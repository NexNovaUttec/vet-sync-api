export function convertToMinutes (timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

export function checkIfTimeIsWithinRange (checkTime, startTime, endTime) {
  const timeMinutes = convertToMinutes(checkTime)
  const startMinutes = convertToMinutes(startTime)
  const endMinutes = convertToMinutes(endTime)

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes
}

export function isValidTimeFormat (timeStr) {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)
}

export function calcularHoraFin (horaInicio, duracionMinutos) {
  const [horas, minutos] = horaInicio.split(':').map(Number)

  const minutosTotal = horas * 60 + minutos + duracionMinutos

  const horasFin = Math.floor(minutosTotal / 60)
  const minutosFin = minutosTotal % 60

  return `${horasFin.toString().padStart(2, '0')}:${minutosFin.toString().padStart(2, '0')}`
}

export const getCurrentDateTime = () => {
  const now = new Date().toLocaleString('sv-SE', { timeZone: 'America/Mexico_City' })
  const [currentDate, currentTime] = now.split(' ')
  return { currentDate, currentTime }
}
