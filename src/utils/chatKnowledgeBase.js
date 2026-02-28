/**
 * Base de conocimiento estática del chatbot de VetSync.
 * Cada entrada tiene:
 *  - keywords: palabras clave que activan esta respuesta (en minúsculas, sin acentos)
 *  - answer: respuesta que se le da al usuario
 *  - score: peso mínimo de coincidencia para activarse (1 = cualquier keyword, >1 = más específico)
 */
export const knowledgeBase = [
  // ─── PLATAFORMA VETSYNC ────────────────────────────────────────────────────
  {
    keywords: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos'],
    answer:
      '¡Hola! Soy el asistente virtual de VetSync 🐾 Estoy aquí para ayudarte con el cuidado de tu mascota o con el uso de la plataforma. ¿En qué puedo ayudarte?',
    score: 1
  },
  {
    keywords: [
      'registrar mascota',
      'agregar mascota',
      'nueva mascota',
      'dar de alta mascota',
      'añadir mascota',
      'como registro',
      'registro mi mascota'
    ],
    answer:
      'Para registrar a tu mascota en VetSync:\n1. Inicia sesión en tu cuenta\n2. Ve a la sección "Mis Mascotas"\n3. Haz clic en "Agregar mascota"\n4. Completa los datos: nombre, especie, raza, fecha de nacimiento y peso\n5. Guardada la ficha, ya puedes agendar citas para ella 🐾',
    score: 2
  },
  {
    keywords: [
      'agendar cita',
      'hacer cita',
      'solicitar cita',
      'pedir cita',
      'reservar cita',
      'como agendo',
      'nueva cita',
      'programar cita'
    ],
    answer:
      'Para agendar una cita en VetSync:\n1. Inicia sesión en tu cuenta\n2. Ve a la sección "Citas" y haz clic en "Agendar"\n3. Selecciona la mascota, el servicio y al veterinario\n4. Elige la fecha y hora disponible\n5. Confirma tu cita — recibirás un resumen en pantalla ✅',
    score: 2
  },
  {
    keywords: ['cancelar cita', 'eliminar cita', 'borrar cita', 'quitar cita'],
    answer:
      'Para cancelar una cita:\n1. Ve a la sección "Citas"\n2. Busca la cita que deseas cancelar\n3. Haz clic en el botón de opciones y selecciona "Cancelar"\nTe recomendamos cancelar con al menos 24 horas de anticipación para liberar el espacio a otros pacientes.',
    score: 2
  },
  {
    keywords: ['ver citas', 'mis citas', 'historial citas', 'proximas citas', 'citas programadas'],
    answer:
      'Puedes ver todas tus citas en la sección "Citas" del menú principal. Ahí encontrarás tus citas próximas e historial de consultas anteriores.',
    score: 2
  },
  {
    keywords: [
      'historial mascota',
      'expediente',
      'ver historial',
      'como veo el historial',
      'informacion mascota',
      'ficha mascota'
    ],
    answer:
      'Para ver el historial de tu mascota:\n1. Ve a "Mis Mascotas"\n2. Selecciona la mascota que deseas consultar\n3. Ahí encontrarás su información general, historial de citas y notas del veterinario.',
    score: 2
  },
  {
    keywords: ['servicios', 'que servicios', 'servicios ofrecen', 'que hacen', 'tratamientos disponibles'],
    answer:
      'VetSync ofrece servicios veterinarios como: consulta general, vacunación, desparasitación, cirugías menores, revisiones de rutina y más. Puedes ver el catálogo completo en la sección "Servicios" de la plataforma.',
    score: 1
  },
  {
    keywords: ['horario', 'horarios', 'horario atencion', 'cuando abren', 'a que hora', 'dias de atencion'],
    answer:
      'Puedes consultar los horarios disponibles al momento de agendar una cita — solo selecciona al veterinario y verás los días y horas disponibles en el calendario. Para horarios generales de la clínica, te recomendamos contactarlos directamente.',
    score: 2
  },
  {
    keywords: ['precio', 'costo', 'cuanto cuesta', 'precios', 'tarifas', 'cobran'],
    answer:
      'Los precios varían según el servicio y el veterinario. Puedes ver el costo de cada servicio en la sección "Servicios" de la plataforma antes de agendar tu cita.',
    score: 1
  },
  {
    keywords: ['iniciar sesion', 'login', 'entrar', 'no puedo entrar', 'olvide contrasena', 'contrasena', 'password'],
    answer:
      'Para iniciar sesión en VetSync usa tu correo y contraseña registrados. Si olvidaste tu contraseña, en la pantalla de login hay la opción "¿Olvidaste tu contraseña?" para restablecerla.',
    score: 2
  },
  {
    keywords: ['crear cuenta', 'registrarme', 'como me registro', 'nueva cuenta', 'registrar usuario'],
    answer:
      'Para crear una cuenta en VetSync:\n1. Haz clic en "Registrarse" en la pantalla de inicio\n2. Ingresa tu nombre, correo electrónico y contraseña\n3. Acepta los términos y confirma tu registro\n¡Listo! Ya puedes agregar tus mascotas y agendar citas.',
    score: 2
  },

  // ─── CUIDADO DE MASCOTAS ───────────────────────────────────────────────────
  {
    keywords: ['vacuna', 'vacunas', 'vacunar', 'vacunacion', 'cuando vacunar'],
    answer:
      'Las vacunas son esenciales para proteger a tu mascota. Los perros necesitan vacunarse desde las 6-8 semanas de edad con refuerzos anuales. Los gatos también requieren vacunas contra enfermedades como el panleucopenia y herpesvirus. Agenda una cita de revisión para que el veterinario te indique el esquema de vacunación adecuado para tu mascota.',
    score: 1
  },
  {
    keywords: ['desparasitar', 'desparasitacion', 'parasitos', 'lombrices', 'pulgas', 'garrapatas'],
    answer:
      'Se recomienda desparasitar a perros y gatos cada 3 meses como mínimo. Existen antiparasitarios internos (lombrices) y externos (pulgas, garrapatas). Consulta con tu veterinario cuál es el producto más adecuado según el peso y la edad de tu mascota.',
    score: 1
  },
  {
    keywords: ['fiebre', 'calentura', 'temperatura', 'perro fiebre', 'gato fiebre'],
    answer:
      'La temperatura normal de un perro o gato es entre 38°C y 39.2°C. Si tu mascota tiene fiebre, señales de alarma incluyen: falta de apetito, letargo, escalofríos o nariz muy caliente y seca. Ante cualquier síntoma, lo mejor es acudir al veterinario — agenda una cita en VetSync lo antes posible.',
    score: 1
  },
  {
    keywords: ['no come', 'no quiere comer', 'dejó de comer', 'sin apetito', 'anorexia'],
    answer:
      'Si tu mascota lleva más de 24 horas sin comer, es señal de que algo puede estar mal. Las causas pueden ir desde estrés hasta problemas digestivos o enfermedades más serias. Te recomendamos consultar con un veterinario — puedes agendar una cita en VetSync.',
    score: 2
  },
  {
    keywords: ['vomito', 'vomitar', 'vomitando', 'nauseas', 'arcadas'],
    answer:
      'Un vómito aislado puede no ser grave (por ejemplo, si comió muy rápido). Sin embargo, si vomita más de 2 veces al día, hay sangre en el vómito, o viene acompañado de letargo, es urgente visitar al veterinario. Agenda una cita en VetSync para una evaluación.',
    score: 1
  },
  {
    keywords: ['diarrea', 'heces', 'evacuaciones', 'estomago', 'digestivo'],
    answer:
      'La diarrea ocasional puede deberse a cambio de alimento o estrés. Si dura más de un día, hay sangre, o tu mascota está decaída, llévala al veterinario. Mantén a tu mascota bien hidratada mientras tanto y agenda una cita si los síntomas persisten.',
    score: 1
  },
  {
    keywords: ['cuanto comer', 'cuantas veces comer', 'alimentar', 'alimento', 'comida', 'dieta'],
    answer:
      'En general:\n• Cachorros (< 6 meses): 3-4 veces al día\n• Adultos: 2 veces al día\n• Gatos: 2-3 veces al día\nLas porciones dependen del peso y la raza. Consulta con tu veterinario para una dieta personalizada.',
    score: 1
  },
  {
    keywords: ['toxico', 'veneno', 'alimentos prohibidos', 'no puede comer', 'danino para perro', 'danino para gato'],
    answer:
      'Alimentos tóxicos para mascotas:\n🚫 Perros: chocolate, uvas, cebollas, ajo, xilitol (endulzante artificial), aguacate, macadamia.\n🚫 Gatos: chocolate, cebollas, ajo, uvas, cafeína, lilies (flores), alcohol.\nSi tu mascota ingirió algo tóxico, ve de inmediato al veterinario.',
    score: 1
  },
  {
    keywords: ['castrar', 'esterilizar', 'castracion', 'esterilizacion', 'operacion'],
    answer:
      'La esterilización es recomendable para la salud y bienestar de tu mascota. En perros y gatos se puede realizar desde los 6 meses de edad. Además de controlar la población animal, reduce el riesgo de ciertos tumores y enfermedades. Consulta los servicios quirúrgicos disponibles en VetSync.',
    score: 1
  },
  {
    keywords: ['bano', 'higiene', 'grooming', 'peluqueria', 'corte de pelo'],
    answer:
      'Los perros deben bañarse cada 3-6 semanas dependiendo de su pelaje y actividad. Los gatos se limpian solos y raramente necesitan baño. El cepillado regular es importante para evitar enredos y reducir el pelo suelto. Consulta si VetSync ofrece servicios de grooming.',
    score: 1
  },
  {
    keywords: ['edad', 'cuantos años', 'vejez', 'senior', 'viejo', 'geriatrico'],
    answer:
      'Un perro o gato se considera "senior" aproximadamente a partir de los 7 años (antes en razas grandes). Las mascotas mayores necesitan revisiones más frecuentes (cada 6 meses) para detectar enfermedades como artritis, problemas renales o dentales. Agenda una revisión geriátrica en VetSync.',
    score: 1
  },

  // ─── EMERGENCIAS ───────────────────────────────────────────────────────────
  {
    keywords: ['emergencia', 'urgencia', 'urgente', 'ayuda rapido', 'se esta muriendo', 'muy mal', 'grave'],
    answer:
      '⚠️ Si tu mascota tiene una emergencia, acude de inmediato a la clínica veterinaria más cercana o a un hospital de urgencias 24 horas. Para situaciones no urgentes, puedes agendar una cita en VetSync lo antes posible.',
    score: 1
  },
  {
    keywords: ['no responde', 'desmayo', 'convulsion', 'choque', 'atropellado', 'accidente'],
    answer:
      '🚨 Esto es una emergencia. Lleva a tu mascota de inmediato a una clínica veterinaria de urgencias. Mientras tanto: mantenla calmada, no le des agua ni comida, y transfórtalas con cuidado evitando moverle el cuello bruscamente.',
    score: 2
  },

  // ─── PREGUNTAS GENERALES ───────────────────────────────────────────────────
  {
    keywords: ['gracias', 'muchas gracias', 'thank you', 'thanks'],
    answer:
      '¡Con gusto! Si tienes más preguntas sobre el cuidado de tu mascota o la plataforma VetSync, aquí estaré 🐾',
    score: 1
  },
  {
    keywords: ['adios', 'hasta luego', 'bye', 'chao', 'nos vemos'],
    answer: '¡Hasta luego! Que tú y tu mascota tengan un excelente día 🐾 Recuerda que puedes volver cuando necesites.',
    score: 1
  },
  {
    keywords: ['que puedes hacer', 'para que sirves', 'como me ayudas', 'que sabes', 'ayuda'],
    answer:
      'Puedo ayudarte con:\n• 📋 Uso de VetSync: registrar mascotas, agendar citas, ver historial\n• 🐾 Cuidado de mascotas: alimentación, vacunas, desparasitación\n• 🏥 Orientación sobre síntomas comunes\n• ⚠️ Identificar cuándo es urgente ir al veterinario\n\n¿Sobre qué tema tienes dudas?',
    score: 1
  }
]

/**
 * Normaliza texto: minúsculas, sin acentos, sin signos de puntuación.
 */
export const normalize = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[¿?¡!.,;:()]/g, '') // quita puntuación
    .trim()

/**
 * Busca la mejor coincidencia en la base de conocimiento.
 * Retorna la respuesta si supera el umbral mínimo, o null si no hay match.
 */
export const findStaticAnswer = (userMessage) => {
  const normalized = normalize(userMessage)

  let bestMatch = null
  let bestScore = 0

  for (const entry of knowledgeBase) {
    let score = 0
    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalize(keyword)
      // Coincidencia exacta de frase
      if (normalized.includes(normalizedKeyword)) {
        score += normalizedKeyword.split(' ').length // frases largas valen más
      }
    }
    if (score >= entry.score && score > bestScore) {
      bestScore = score
      bestMatch = entry.answer
    }
  }

  return bestMatch
}
