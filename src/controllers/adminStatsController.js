import { AdminStatsModel } from '../models/adminStatsModel.js'

export class AdminStatsController {
  static async getStats (req, res) {
    try {
      const stats = await AdminStatsModel.getStats()
      return res.json({ data: stats })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      return res.status(500).json({ error: 'Failed to fetch dashboard statistics' })
    }
  }
}
