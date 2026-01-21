import { categoryModel } from '#models/categoryModel.js'

export const runValidations = async ({ data }) => {
  const validations = []

  if (data.categoria_id !== undefined) {
    validations.push({ validate: validateCategory, value: data.categoria_id })
  }

  if (validations.length === 0) return { error: null }

  const results = await Promise.all(
    validations.map(({ validate, value }) => validate(value))
  )

  const error = results.find(result => result.error)?.error || null

  return { error }
}

async function validateCategory (categoryId) {
  const category = await categoryModel.getById({ id: categoryId })

  if (category.length === 0) return { error: 'Category not found' }

  return { error: null }
}
