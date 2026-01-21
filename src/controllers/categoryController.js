import { categoryModel } from '#models/categoryModel.js'

export class CategoryController {
  static async getAllCategories (req, res) {
    const { name } = req.query

    try {
      const categories = await categoryModel.getAllCategories({ name })
      res.json({ message: 'Categories found', data: categories })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  static async getCategoryById (req, res) {
    const { id } = req.params
    const category = await categoryModel.getById({ id })

    if (category.length === 0) {
      return res.status(404).json({ error: 'Category not found' })
    }
    res.json({ message: 'Category found', data: category })
  }
}
