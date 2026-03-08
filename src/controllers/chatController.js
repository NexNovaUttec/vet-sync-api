import { GoogleGenerativeAI } from '@google/generative-ai'
import { geminiApiKey } from '#root/config.js'
import { findStaticAnswer, normalize } from '#utils/chatKnowledgeBase.js'
import { serviceModel } from '#models/serviceModel.js'
import { speciesModel } from '#models/speciesModel.js'

const SYSTEM_PROMPT = `Eres un asistente virtual amigable de VetSync, una plataforma de gestión veterinaria.
Tu rol es ayudar a los usuarios con preguntas relacionadas con:
- Información general sobre cuidado de mascotas (perros, gatos, etc.)
- Cómo usar la plataforma VetSync (agendar citas, registrar mascotas, ver servicios)
- Preguntas frecuentes sobre visitas veterinarias
- Consejos de salud y bienestar animal básicos

Responde siempre en español, de forma clara, concisa y amable.
Si te preguntan algo fuera de estos temas (política, código, temas no relacionados con mascotas o la plataforma), indica amablemente que solo puedes ayudar con temas de VetSync y cuidado animal.
No des diagnósticos médicos específicos; en esos casos, siempre recomienda visitar a un veterinario.
Máximo 3 párrafos por respuesta.`

const FALLBACK_RESPONSE =
  'Gracias por tu mensaje. En este momento no puedo procesar tu consulta en detalle, pero puedo ayudarte con temas como agendar citas, registrar mascotas, cuidados generales y más. ¿Podrías reformular tu pregunta o elegir uno de estos temas?'

// ─── INTENCIONES DE BASE DE DATOS ─────────────────────────────────────────────
const DB_INTENTS = [
  {
    name: 'service_price',
    keywords: [
      'cuanto cuesta', 'cual es el precio', 'precio de', 'costo de',
      'cuanto vale', 'cuanto es el precio', 'que precio tiene', 'cuanto cobran',
      'precio del', 'costo del', 'cuanto sale', 'cuanto cobra', 'tienen precio',
      'precio es', 'como esta el precio'
    ]
  },
  {
    name: 'services',
    keywords: [
      'que servicios', 'servicios ofrecen', 'servicios tienen', 'servicios disponibles',
      'que tratamientos', 'catalogo de servicios', 'lista de servicios', 'servicios ofrecidos',
      'que servicio', 'hay servicios', 'cuales servicios', 'servicios hay'
    ]
  },
  {
    name: 'species',
    keywords: [
      'que animales', 'que mascotas atienden', 'que especies', 'que tipo de animal',
      'que tipo de mascota', 'animales atienden', 'especies atienden', 'animales se atienden',
      'que animales se', 'animales tratan', 'mascotas atienden'
    ]
  },
  {
    name: 'species_check',
    keywords: [
      'atienden', 'atiende', 'aceptan', 'acepta', 'pueden atender',
      'pueden ver', 'pueden revisar', 'trabajan con', 'manejan'
    ]
  }
]

const detectDbIntent = (normalizedMessage) => {
  for (const intent of DB_INTENTS) {
    for (const kw of intent.keywords) {
      if (normalizedMessage.includes(kw)) return intent.name
    }
  }
  return null
}

// Palabras de precio que se eliminan para extraer el nombre del servicio buscado
const PRICE_STOP_WORDS = [
  'cuanto cuesta', 'cual es el precio de', 'cual es el precio del', 'cual es el precio',
  'precio de', 'precio del', 'costo de', 'costo del', 'cuanto vale', 'cuanto cobran',
  'cuanto es el precio de', 'cuanto es el precio del', 'cuanto es el precio',
  'cuanto sale', 'cuanto cobra', 'que precio tiene', 'como esta el precio de',
  'el precio', 'la consulta de', 'precio', 'costo', 'cuesta', 'vale', 'cobran',
  ' la ', ' el ', ' de ', ' del ', ' un ', ' una ', ' los ', ' las '
]

const extractServiceName = (normalizedMsg) => {
  let query = normalizedMsg
  const sorted = [...PRICE_STOP_WORDS].sort((a, b) => b.length - a.length)
  for (const w of sorted) {
    query = query.split(w).join(' ')
  }
  return query.replace(/\s+/g, ' ').trim()
}

const findServiceByQuery = (services, normalizedMsg) => {
  const searchTerm = extractServiceName(normalizedMsg)
  if (!searchTerm || searchTerm.length < 2) return null

  let bestMatch = null
  let bestScore = 0

  for (const service of services) {
    const normalizedName = normalize(service.nombre)
    // Coincidencia exacta del nombre completo
    if (normalizedMsg.includes(normalizedName)) return service
    // Scoring por palabras del nombre que aparecen en la query
    const nameWords = normalizedName.split(' ').filter((w) => w.length > 2)
    let score = 0
    for (const word of nameWords) {
      if (searchTerm.includes(word) || normalizedMsg.includes(word)) score++
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = service
    }
  }

  return bestScore > 0 ? bestMatch : null
}

const formatServicePrice = (service) => {
  const precio = service.precio != null ? `$${service.precio}` : 'Consultar en clínica'
  const duracion = service.duracion_estimada ? `\n⏱ Duración: ${service.duracion_estimada} minutos` : ''
  const desc = service.descripcion ? `\n${service.descripcion}` : ''
  return `**${service.nombre}**${desc}\n\n💰 Precio: ${precio}${duracion}\n\n---\nPuedes agendar este servicio desde la sección "Servicios" de VetSync.`
}

const formatServices = (services) => {
  if (!services || services.length === 0) {
    return 'En este momento no hay servicios disponibles registrados en la plataforma.'
  }
  const lines = services.map((s) => {
    const precio = s.precio != null ? `$${s.precio}` : 'Consultar precio'
    const duracion = s.duracion_estimada ? ` · ${s.duracion_estimada} min` : ''
    return `- **${s.nombre}** — 💰 ${precio}${duracion}`
  })
  return `Estos son los servicios disponibles en VetSync:\n\n${lines.join('\n')}\n\n---\nPuedes ver detalles completos y agendar en la sección **"Servicios"** de la plataforma.`
}

// Sinónimos y razas comunes (Extraído con IA) → nombre en la BD 
const ANIMAL_SYNONYMS = {
  // Perro
  perro: 'perro', perros: 'perro', can: 'perro', canes: 'perro',
  canino: 'perro', caninos: 'perro',
  golden: 'perro', labrador: 'perro', bulldog: 'perro', chihuahua: 'perro',
  poodle: 'perro', beagle: 'perro', boxer: 'perro', dalmata: 'perro',
  pitbull: 'perro', husky: 'perro', pastor: 'perro', salchicha: 'perro',
  dachshund: 'perro', schnauzer: 'perro', pomerania: 'perro', shih: 'perro',
  // Gato
  gato: 'gato', gatos: 'gato', felino: 'gato', felinos: 'gato',
  minino: 'gato', mininos: 'gato', michis: 'gato', michi: 'gato',
  siames: 'gato', persa: 'gato', angora: 'gato', bengala: 'gato',
  ragdoll: 'gato', maine: 'gato', abisinio: 'gato', esfinge: 'gato',
  // Pájaro / Ave
  pajaro: 'pajaro', pajaros: 'pajaro', ave: 'pajaro', aves: 'pajaro',
  canario: 'pajaro', canarios: 'pajaro', periquito: 'pajaro', periquitos: 'pajaro',
  loro: 'pajaro', loros: 'pajaro', guacamayo: 'pajaro', guacamayos: 'pajaro',
  cotorra: 'pajaro', cotorras: 'pajaro', cockatiel: 'pajaro', ninfa: 'pajaro',
  agapornis: 'pajaro', perico: 'pajaro', pericos: 'pajaro', jilguero: 'pajaro',
  // Pez
  pez: 'pez', peces: 'pez', goldfish: 'pez', betta: 'pez',
  carpa: 'pez', carpas: 'pez', acuario: 'pez', tilapia: 'pez', guppy: 'pez',
  // Hamster / Roedor pequeño
  hamster: 'hamster', hamsters: 'hamster',
  // Tortuga
  tortuga: 'tortuga', tortugas: 'tortuga',
  // Reptil
  reptil: 'reptil', reptiles: 'reptil',
  iguana: 'reptil', iguanas: 'reptil', lagartija: 'reptil', lagartijas: 'reptil',
  gecko: 'reptil', geckos: 'reptil', camaleon: 'reptil', camaleones: 'reptil',
  serpiente: 'reptil', serpientes: 'reptil', vibora: 'reptil', boa: 'reptil',
  lagarto: 'reptil', lagartos: 'reptil'
}

// Quita sufijos diminutivos comunes en español
const removeDiminutive = (word) => {
  return word
    .replace(/citos?$/, '')   // -cito/-citos
    .replace(/citas?$/, '')   // -cita/-citas
    .replace(/itos?$/, '')    // -ito/-itos
    .replace(/itas?$/, '')    // -ita/-itas
    .replace(/ines?$/, 'in')  // -ines → -in (e.g. "pajarines" edge case)
    || word
}

// Palabras que se eliminan para extraer el nombre del animal buscado
const SPECIES_STOP_WORDS = [
  'atienden', 'atiende', 'aceptan', 'acepta', 'pueden atender', 'pueden ver',
  'pueden revisar', 'trabajan con', 'manejan', 'tambien', 'también',
  'en vetsync', 'en la clinica', 'en la veterinaria',
  ' a ', ' un ', ' una ', ' con ', ' el ', ' la ', ' los ', ' las ', ' de '
]

const extractAnimalName = (normalizedMsg) => {
  let query = normalizedMsg
  const sorted = [...SPECIES_STOP_WORDS].sort((a, b) => b.length - a.length)
  for (const w of sorted) {
    query = query.split(w).join(' ')
  }
  return query.replace(/\s+/g, ' ').trim()
}

// Resuelve el nombre normalizado de especie a partir de un término (con sinónimos + diminutivos)
const resolveSpeciesName = (term) => {
  if (!term) return null
  const direct = ANIMAL_SYNONYMS[term]
  if (direct) return direct
  const withoutDim = removeDiminutive(term)
  return ANIMAL_SYNONYMS[withoutDim] ?? null
}

const findSpeciesByQuery = (species, normalizedMsg) => {
  const searchTerm = extractAnimalName(normalizedMsg)
  if (!searchTerm || searchTerm.length < 2) return null

  // 1. Buscar cada palabra de la query en el mapa de sinónimos (con y sin diminutivo)
  const words = normalizedMsg.split(/\s+/)
  for (const word of words) {
    const resolved = resolveSpeciesName(word)
    if (resolved) {
      const found = species.find((sp) => normalize(sp.nombre) === resolved)
      if (found) return found
    }
  }

  // 2. Coincidencia directa con el nombre en BD
  for (const sp of species) {
    const normalizedName = normalize(sp.nombre)
    if (normalizedMsg.includes(normalizedName) || searchTerm.includes(normalizedName)) {
      return sp
    }
    // Coincidencia parcial por palabras del nombre (ej: "reptil" dentro de "reptiles")
    const nameWords = normalizedName.split(' ').filter((w) => w.length > 2)
    for (const word of nameWords) {
      if (searchTerm.includes(word) || normalizedMsg.includes(word)) return sp
    }
  }
  return null
}

const EMOJI_MAP = { perro: '🐶', gato: '🐱', hamster: '🐹', tortuga: '🐢', pez: '🐟', pajaro: '🐦', reptil: '🦎' }

const formatSpeciesFound = (species, allSpecies) => {
  const emoji = EMOJI_MAP[normalize(species.nombre)] ?? '🐾'
  const otherLines = allSpecies
    .filter((s) => s.id !== species.id)
    .map((s) => `- ${EMOJI_MAP[normalize(s.nombre)] ?? '🐾'} ${s.nombre}`)
    .join('\n')
  return `¡Sí! En VetSync atendemos ${emoji} **${species.nombre}**.

Nuestros veterinarios están capacitados para brindarles la atención que necesitan, desde consultas generales hasta tratamientos especializados.

---
También atendemos:

${otherLines}

Puedes registrar a tu mascota en la sección **"Mis Mascotas"** y agendar una cita cuando gustes. 🐾`
}

const formatSpeciesNotFound = (allSpecies) => {
  const lines = allSpecies.map((s) => `- ${EMOJI_MAP[normalize(s.nombre)] ?? '🐾'} ${s.nombre}`).join('\n')
  return `Por el momento no contamos con atención para ese tipo de animal. 😔

Actualmente en VetSync atendemos las siguientes especies:

${lines}

---
Si tienes dudas o quieres más información, te recomendamos contactar directamente a la clínica.`
}

const formatSpecies = (species) => {
  if (!species || species.length === 0) {
    return 'En este momento no hay especies registradas en la plataforma.'
  }
  const lines = species.map((s) => {
    const emoji = EMOJI_MAP[normalize(s.nombre)] ?? '🐾'
    return `- ${emoji} ${s.nombre}`
  }).join('\n')
  return `En VetSync atendemos las siguientes especies:\n\n${lines}\n\n---\nPuedes registrar a tu mascota en la sección **"Mis Mascotas"** e indicar su especie al crearla.`
}

const handleDbIntent = async (intent, normalizedMsg) => {
  try {
    if (intent === 'service_price') {
      const services = await serviceModel.getActiveServices({ active: true })
      const match = findServiceByQuery(services, normalizedMsg)
      if (match) return formatServicePrice(match)
      // No se identificó un servicio específico → listar todos con precios
      return formatServices(services)
    }
    if (intent === 'services') {
      const services = await serviceModel.getActiveServices({ active: true })
      return formatServices(services)
    }
    if (intent === 'species') {
      const species = await speciesModel.getAllSpecies()
      return formatSpecies(species)
    }
    if (intent === 'species_check') {
      const species = await speciesModel.getAllSpecies()
      const match = findSpeciesByQuery(species, normalizedMsg)
      if (match) return formatSpeciesFound(match, species)
      return formatSpeciesNotFound(species)
    }
  } catch (error) {
    console.error(`[ChatController] Error BD intent "${intent}":`, error.message)
  }
  return null // Si falla la BD, continúa con el flujo normal
}

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 4000

let genAI = null

const getGenAI = () => {
  if (!geminiApiKey) return null
  if (!genAI) {
    genAI = new GoogleGenerativeAI(geminiApiKey)
  }
  return genAI
}

const isRateLimitError = (error) => {
  const msg = error?.message?.toLowerCase() ?? ''
  const status = error?.status ?? error?.statusCode ?? error?.httpStatus
  return (
    status === 429 ||
    msg.includes('429') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('too many requests') ||
    msg.includes('exhausted')
  )
}

const sleep = (ms) => new Promise((resolve) => { globalThis.setTimeout(resolve, ms) })

const callGemini = async (message, formattedHistory) => {
  const ai = getGenAI()
  if (!ai) return null // sin key configurada, skip Gemini

  const model = ai.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT
  })

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const chat = model.startChat({ history: formattedHistory })
      // eslint-disable-next-line no-await-in-loop
      const result = await chat.sendMessage(message)
      return result.response.text()
    } catch (error) {
      console.warn(`[ChatController] Gemini intento ${attempt}/${MAX_RETRIES}:`, {
        status: error?.status,
        message: error?.message?.slice(0, 120)
      })
      if (isRateLimitError(error) && attempt < MAX_RETRIES) {
        // eslint-disable-next-line no-await-in-loop
        await sleep(RETRY_DELAY_MS * attempt)
        continue
      }
      break // error no recuperable, salir del loop
    }
  }
  return null // Gemini falló, se usará fallback
}

export class ChatController {
  static async sendMessage (req, res) {
    const { message, history = [] } = req.body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' })
    }

    if (message.trim().length > 500) {
      return res.status(400).json({ error: 'El mensaje es demasiado largo (máx. 500 caracteres)' })
    }

    const trimmed = message.trim()
    const normalizedMsg = normalize(trimmed)

    // 1️⃣ Primero: detectar si pregunta por datos de la BD (servicios, especies, precios)
    const dbIntent = detectDbIntent(normalizedMsg)
    if (dbIntent) {
      const dbReply = await handleDbIntent(dbIntent, normalizedMsg)
      if (dbReply) {
        console.log(`[ChatController] Respuesta BD (${dbIntent}) para:`, trimmed.slice(0, 50))
        return res.json({ reply: dbReply, source: 'database' })
      }
    }

    // 2️⃣ Segundo: buscar en la base de conocimiento estática
    const staticAnswer = findStaticAnswer(trimmed)
    if (staticAnswer) {
      console.log('[ChatController] Respuesta estática para:', trimmed.slice(0, 50))
      return res.json({ reply: staticAnswer, source: 'static' })
    }

    // 3️⃣ Tercero: intentar con Gemini AI
    const formattedHistory = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    const geminiReply = await callGemini(trimmed, formattedHistory)
    if (geminiReply) {
      return res.json({ reply: geminiReply, source: 'ai' })
    }

    // 4️⃣ Fallback: respuesta genérica si todo falla
    console.warn('[ChatController] Usando fallback para:', trimmed.slice(0, 50))
    return res.json({ reply: FALLBACK_RESPONSE, source: 'fallback' })
  }
}
