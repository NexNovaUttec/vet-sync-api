import { supabase } from '#root/src/database/index.js'
import { predictNoShowRisk, predictDailyRevenue } from '#services/ml.service.js'

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

export const getRevenueForecastController = async (req, res) => {
  try {
    const today = new Date()
    const offset = today.getTimezoneOffset()
    const localToday = new Date(today.getTime() - (offset * 60 * 1000))
    const todayStr = localToday.toISOString().split('T')[0]

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    const startOfMonthStr = `${firstDayOfMonth.getFullYear()}-${String(firstDayOfMonth.getMonth() + 1).padStart(2, '0')}-01`
    const startOfNextMonthStr = `${firstDayOfNextMonth.getFullYear()}-${String(firstDayOfNextMonth.getMonth() + 1).padStart(2, '0')}-01`

    // 1. Calculate Realized Revenue (Completed appointments this month)
    const { data: completedAppointments, error: revenueError } = await supabase
      .from('citas')
      .select('fecha, servicios(precio)')
      .eq('status', 'Completada')
      .gte('fecha', startOfMonthStr)
      .lt('fecha', startOfNextMonthStr)

    if (revenueError) throw revenueError

    const realizedRevenue = completedAppointments.reduce((acc, curr) => {
      return acc + Number(curr.servicios?.precio || 0)
    }, 0)

    // 2. Calculate Scheduled Future Revenue discounted by No-Show Risk
    const { data: upcomingAppointments, error: upcomingError } = await supabase
      .from('citas')
      .select('id, fecha, hora_inicio, fecha_creacion, status, servicios(precio)')
      .eq('status', 'Agendada')
      .gte('fecha', todayStr)
      .lt('fecha', startOfNextMonthStr)

    if (upcomingError) throw upcomingError

    let adjustedScheduledRevenue = 0
    let totalScheduledBaseRevenue = 0

    // Optimize with Promise.all to predict all upcoming appointments in parallel
    const predictions = await Promise.all(
      upcomingAppointments.map(async (cita) => {
        const price = Number(cita.servicios?.precio || 0)
        const riskScore = await predictNoShowRisk(cita)
        return { price, riskScore }
      })
    )

    predictions.forEach(({ price, riskScore }) => {
      totalScheduledBaseRevenue += price
      const expectedRevenue = price * (1 - riskScore)
      adjustedScheduledRevenue += expectedRevenue
    })

    // 3. Project extra walk-in/newly booked revenue for remaining days in the month
    let predictedExtraRevenue = 0

    // Total days in the month
    const lastDayOfMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const lastDay = lastDayOfMonthDate.getDate()
    const currentDay = today.getDate()

    // Only predict if we are not on the last day
    if (currentDay <= lastDay) {
      const datesToPredict = []
      for (let d = currentDay; d <= lastDay; d++) {
        datesToPredict.push(new Date(today.getFullYear(), today.getMonth(), d))
      }

      const extraDailyForecasts = await Promise.all(
        datesToPredict.map(date => predictDailyRevenue(date))
      )

      predictedExtraRevenue = extraDailyForecasts.reduce((acc, forecast) => acc + forecast, 0)
    }

    const totalProjectedRevenue = realizedRevenue + adjustedScheduledRevenue + predictedExtraRevenue

    return res.status(200).json({
      success: true,
      data: {
        realizedRevenue: parseFloat(realizedRevenue.toFixed(2)),
        scheduledBaseRevenue: parseFloat(totalScheduledBaseRevenue.toFixed(2)),
        adjustedScheduledRevenue: parseFloat(adjustedScheduledRevenue.toFixed(2)),
        predictedExtraRevenue: parseFloat(predictedExtraRevenue.toFixed(2)),
        totalProjectedRevenue: parseFloat(totalProjectedRevenue.toFixed(2)),
        daysRemaining: lastDay - currentDay + 1,
        month: startOfMonthStr.substring(0, 7)
      }
    })
  } catch (error) {
    console.error('Error calculando pronóstico de ingresos:', error)
    return res.status(500).json({ success: false, message: 'Error interno al generar pronóstico.', error: error.message })
  }
}
