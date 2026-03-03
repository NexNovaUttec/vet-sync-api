import { supabase } from '#databases/index.js'

export class AdminStatsModel {
  static async getStats () {
    try {
      // FECHAS
      const today = new Date()
      // Date in local timezone formatted as YYYY-MM-DD
      // Use local timezone offset to avoid previous day when it's evening in UTC
      const offset = today.getTimezoneOffset()
      const localToday = new Date(today.getTime() - (offset * 60 * 1000))
      const todayStr = localToday.toISOString().split('T')[0]

      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

      const startOfMonthStr = `${firstDayOfMonth.getFullYear()}-${String(firstDayOfMonth.getMonth() + 1).padStart(2, '0')}-01`
      const startOfNextMonthStr = `${firstDayOfNextMonth.getFullYear()}-${String(firstDayOfNextMonth.getMonth() + 1).padStart(2, '0')}-01`

      // 1. Total de usuarios activos
      const { count: totalUsers, error: usersError } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      if (usersError) throw usersError

      // 1b. Usuarios nuevos este mes (Para la tendencia)
      const { count: newUsersThisMonth, error: newUsersError } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_registro', startOfMonthStr)

      if (newUsersError) throw newUsersError

      // 2. Citas de hoy (no canceladas)
      const { count: todayAppointments, error: appointmentsError } = await supabase
        .from('citas')
        .select('*', { count: 'exact', head: true })
        .eq('fecha', todayStr)
        .neq('status', 'Cancelada')

      if (appointmentsError) throw appointmentsError

      // 3. Total de Mascotas registradas
      const { count: totalPets, error: petsError } = await supabase
        .from('mascotas')
        .select('*', { count: 'exact', head: true })

      if (petsError) throw petsError

      // 4. Ingresos del mes (Sumar precio de citas completadas este mes)
      const { data: completedAppointmentsData, error: revenueError } = await supabase
        .from('citas')
        .select('servicios(nombre, precio)')
        .eq('status', 'Completada')
        .gte('fecha', startOfMonthStr)
        .lt('fecha', startOfNextMonthStr)

      if (revenueError) throw revenueError

      // 4b. Total Servicios Activos
      const { count: activeServicesCount, error: servicesError } = await supabase
        .from('servicios')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      if (servicesError) throw servicesError

      const monthlyRevenue = completedAppointmentsData.reduce((acc, current) => {
        // Handle potential nulls or structures
        const price = current.servicios?.precio || 0
        return acc + Number(price)
      }, 0)

      // 5. Datos para el gráfico (Citas de este mes por categoría para pie chart o tendencia diaria)
      // Recuperamos todas las citas del mes para procesarlas en el backend
      const { data: monthAppointmentsData, error: chartError } = await supabase
        .from('citas')
        .select('fecha, servicios(categorias_servicio(nombre))')
        .gte('fecha', startOfMonthStr)
        .lt('fecha', startOfNextMonthStr)
        .neq('status', 'Cancelada')

      if (chartError) throw chartError

      // Procesar chartData: distribución por categoría
      const categoryCounts = {}
      monthAppointmentsData.forEach(cita => {
        const categoryName = cita.servicios?.categorias_servicio?.nombre || 'Otra'

        if (categoryCounts[categoryName]) {
          categoryCounts[categoryName]++
        } else {
          categoryCounts[categoryName] = 1
        }
      })

      const chartData = Object.keys(categoryCounts).map(name => ({
        name,
        value: categoryCounts[name]
      }))

      // Procesar Daily Trend (opcional para un Line Chart)
      // Agrupamos por día
      const dailyCounts = {}
      monthAppointmentsData.forEach(cita => {
        const date = cita.fecha
        if (dailyCounts[date]) {
          dailyCounts[date]++
        } else {
          dailyCounts[date] = 1
        }
      })
      const trendData = Object.keys(dailyCounts).sort().map(date => ({
        date,
        citas: dailyCounts[date]
      }))

      // 6. Actividad Reciente (Próximas 5 citas a partir de hoy)
      const { data: recentAppointments, error: recentAppError } = await supabase
        .from('citas')
        .select('id, fecha, hora_inicio, status, motivo_consulta, mascotas(nombre), servicios(nombre)')
        .gte('fecha', todayStr)
        .neq('status', 'Cancelada')
        .order('fecha', { ascending: true })
        .order('hora_inicio', { ascending: true })
        .limit(5)

      if (recentAppError) throw recentAppError

      // Formatear recentAppointments para el frontend
      const formattedRecent = recentAppointments.map(app => ({
        id: app.id,
        mascota: app.mascotas?.nombre || 'Desconocida',
        servicio: app.servicios?.nombre || 'Desconocido',
        fecha: app.fecha,
        hora: app.hora_inicio,
        status: app.status
      }))

      // 7. Mascotas recientes (Nuevas altas)
      const { data: recentPets, error: recentPetsError } = await supabase
        .from('mascotas')
        .select('id, nombre, fecha_registro, especies(nombre), raza_id')
        .order('fecha_registro', { ascending: false })
        .limit(5)

      if (recentPetsError) throw recentPetsError

      // Get breed names if needed, or we can just fetch 'em via simple joins if Supabase allows
      const { data: breeds } = await supabase.from('razas').select('id, nombre')
      const breedsMap = breeds ? breeds.reduce((acc, b) => ({ ...acc, [b.id]: b.nombre }), {}) : {}

      const formattedPets = recentPets.map(pet => ({
        id: pet.id,
        nombre: pet.nombre,
        especie: pet.especies?.nombre || 'Desconocida',
        raza: breedsMap[pet.raza_id] || 'Desconocida',
        fecha: pet.fecha_registro
      }))

      // -------------------------------------------------------------
      // FASE 2: NUEVOS WIDGETS
      // -------------------------------------------------------------

      // 8. Tasa de Cancelación (Mes actual)
      const { count: canceledThisMonth, error: canceledError } = await supabase
        .from('citas')
        .select('*', { count: 'exact', head: true })
        .gte('fecha', startOfMonthStr)
        .lt('fecha', startOfNextMonthStr)
        .eq('status', 'Cancelada')

      if (canceledError) throw canceledError

      const { count: totalAppointmentsThisMonth, error: totalAppMonthError } = await supabase
        .from('citas')
        .select('*', { count: 'exact', head: true })
        .gte('fecha', startOfMonthStr)
        .lt('fecha', startOfNextMonthStr)

      if (totalAppMonthError) throw totalAppMonthError

      const cancellationRateValue = totalAppointmentsThisMonth > 0 ? (canceledThisMonth / totalAppointmentsThisMonth) * 100 : 0

      const cancellationRate = {
        rate: parseFloat(cancellationRateValue.toFixed(1)),
        canceled: canceledThisMonth,
        total: totalAppointmentsThisMonth
      }

      // 9. Top 5 Servicios más Rentables del mes
      const serviceRevenue = {}
      completedAppointmentsData.forEach(cita => {
        const serviceName = cita.servicios?.nombre || 'Servicio General'
        const price = Number(cita.servicios?.precio || 0)

        if (serviceRevenue[serviceName]) {
          serviceRevenue[serviceName] += price
        } else {
          serviceRevenue[serviceName] = price
        }
      })

      const topServices = Object.keys(serviceRevenue)
        .map(name => ({
          name,
          revenue: serviceRevenue[name]
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // 10. Distribución de Especies (Global)
      const { data: allPetsData, error: allPetsError } = await supabase
        .from('mascotas')
        .select('especies(nombre)')

      if (allPetsError) throw allPetsError

      const speciesCounts = {}
      allPetsData.forEach(pet => {
        const speciesName = pet.especies?.nombre || 'Otra'
        if (speciesCounts[speciesName]) {
          speciesCounts[speciesName]++
        } else {
          speciesCounts[speciesName] = 1
        }
      })

      const speciesDistribution = Object.keys(speciesCounts).map(name => ({
        name,
        value: speciesCounts[name]
      }))

      // 11. Últimos Usuarios Registrados (Leads)
      const { data: recentUsersData, error: recentUsersError } = await supabase
        .from('usuarios')
        .select('id, nombre, email, fecha_registro')
        .order('fecha_registro', { ascending: false })
        .limit(5)

      if (recentUsersError) throw recentUsersError

      const recentUsers = recentUsersData.map(user => ({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        fecha: user.fecha_registro
      }))

      return {
        cards: {
          totalUsers,
          newUsersThisMonth,
          todayAppointments,
          totalPets,
          monthlyRevenue,
          activeServicesCount
        },
        chartData, // Distribución en pastel/dona
        trendData, // Tendencia en linea/barras
        recentAppointments: formattedRecent,
        recentPets: formattedPets,
        cancellationRate,
        topServices,
        speciesDistribution,
        recentUsers
      }
    } catch (error) {
      throw error
    }
  }
}
