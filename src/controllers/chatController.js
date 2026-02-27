import { GoogleGenerativeAI } from '@google/generative-ai'
import { geminiApiKey } from '#root/config.js'

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

let genAI = null

const getGenAI = () => {
  if (!genAI) {
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY no está configurada')
    }
    genAI = new GoogleGenerativeAI(geminiApiKey)
  }
  return genAI
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

    try {
      const ai = getGenAI()
      const model = ai.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: SYSTEM_PROMPT
      })

      // Convertir historial al formato de Gemini
      const formattedHistory = history.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))

      const chat = model.startChat({
        history: formattedHistory
      })

      const result = await chat.sendMessage(message.trim())
      const response = result.response.text()

      return res.json({ reply: response })
    } catch (error) {
      console.error('[ChatController] Error:', error.message)

      if (error.message.includes('GEMINI_API_KEY')) {
        return res.status(503).json({ error: 'El servicio de chat no está disponible actualmente' })
      }

      if (error.status === 429) {
        return res.status(429).json({ error: 'Demasiadas solicitudes, intenta de nuevo en un momento' })
      }

      return res.status(500).json({ error: 'Error al procesar tu mensaje' })
    }
  }
}
