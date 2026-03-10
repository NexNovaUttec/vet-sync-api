import { supabase } from '#root/src/database/index.js'
import { predictNoShowRisk } from '#services/ml.service.js'

export const getNoShowRiskController = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return res.status(400).json({ success: false, message: 'Falta el id de la cita.' })
    }

    // 1. Fetch the appointment details
    const { data: cita, error } = await supabase
      .from('citas')
      .select('id, fecha, hora_inicio, fecha_creacion, status')
      .eq('id', id)
      .single()

    if (error || !cita) {
      return res.status(404).json({ success: false, message: 'Cita no encontrada.' })
    }

    // 2. We can skip predicting if it's already completed or canceled,
    // but for demonstration we'll return the risk anyway, or zero.
    if (cita.status === 'completado' || cita.status === 'completada') {
      return res.status(200).json({ active: false, riesgo_ausencia: 0.0, message: 'La cita ya fue completada.' })
    }

    // 3. Calculate Risk
    const riskScore = await predictNoShowRisk(cita)

    // Formulate a response
    let explanation = 'Riesgo normal.'
    if (riskScore > 0.7) {
      explanation = 'Alto riesgo de inasistencia detectado. Se recomienda confirmar por teléfono.'
    } else if (riskScore < 0.3) {
      explanation = 'Bajo riesgo de inasistencia. Es muy probable que el cliente asista.'
    }

    return res.status(200).json({
      success: true,
      data: {
        cita_id: cita.id,
        riesgo_ausencia: parseFloat(riskScore.toFixed(4)),
        explicacion: explanation
      }
    })
  } catch (error) {
    console.error('Error calculando riesgo ML:', error)
    return res.status(500).json({ success: false, message: 'Error interno calculando riesgo.', error: error.message })
  }
}
