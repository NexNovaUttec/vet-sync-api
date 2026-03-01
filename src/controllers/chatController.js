import { GoogleGenerativeAI } from '@google/generative-ai'
import { geminiApiKey } from '#root/config.js'
import { findStaticAnswer } from '#utils/chatKnowledgeBase.js'

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

    // 1️⃣ Primero: buscar en la base de conocimiento estática
    const staticAnswer = findStaticAnswer(trimmed)
    if (staticAnswer) {
      console.log('[ChatController] Respuesta estática para:', trimmed.slice(0, 50))
      return res.json({ reply: staticAnswer, source: 'static' })
    }

    // 2️⃣ Segundo: intentar con Gemini AI
    const formattedHistory = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    const geminiReply = await callGemini(trimmed, formattedHistory)
    if (geminiReply) {
      return res.json({ reply: geminiReply, source: 'ai' })
    }

    // 3️⃣ Fallback: respuesta genérica si todo falla
    console.warn('[ChatController] Usando fallback para:', trimmed.slice(0, 50))
    return res.json({ reply: FALLBACK_RESPONSE, source: 'fallback' })
  }
}
