import * as tf from '@tensorflow/tfjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { supabase } from '../../database/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MODEL_DIR = path.join(__dirname, '..', 'ml', 'models', 'demand')

// Features: [DayOfWeek (0-6), IsWeekend (0-1), Month (0-11)]
export const extractDemandFeatures = (dateString) => {
  const date = new Date(dateString)
  const dayOfWeek = date.getDay()
  const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6) ? 1 : 0
  const month = date.getMonth()

  return [
    dayOfWeek / 6, // Normalized
    isWeekend, // Boolean 0 or 1
    month / 11 // Normalized
  ]
}

async function fetchTrainingData () {
  console.log('Fetching active categories from database...')

  // 1. Fetch categories to establish vector size dynamically
  const { data: categories, error: catError } = await supabase
    .from('categorias_servicio')
    .select('id, nombre')
    .order('id', { ascending: true })

  if (catError) {
    console.error('Error fetching categories:', catError)
    return { data: [], categories: [] }
  }

  const categoryMap = {} // name -> index
  const categoryNames = []
  categories.forEach((cat, index) => {
    categoryMap[cat.nombre] = index
    categoryNames.push(cat.nombre)
  })

  console.log(`Found ${categories.length} service categories.`)

  console.log('Fetching historical appointments joined with categories...')
  // We fetch all appointments (to capture demand intent, even cancelled ones count towards 'attempted demand')
  // But let's stick to Completed and Scheduled to be safe and accurate on "realized" demand.
  const { data, error } = await supabase
    .from('citas')
    .select('fecha, status, servicios(categorias_servicio(nombre))')

  if (error) {
    console.error('Error fetching appointments:', error)
    return { data: [], categories: categoryNames }
  }

  // Filter out truly cancelled to not predict ghosts (optional, but requested by logic)
  const validData = data.filter(c => c.status !== 'Cancelada')

  // Aggregate daily demand per category
  // Shape: { 'YYYY-MM-DD': [countCat0, countCat1, ... countCatN] }
  const dailyDemand = {}

  validData.forEach(cita => {
    const dayStr = cita.fecha.split('T')[0]

    // Deep fallback if structure missing
    const categoryName = cita.servicios?.categorias_servicio?.nombre || null
    if (!categoryName) return

    if (!dailyDemand[dayStr]) {
      // Initialize an array of zeroes matching category length
      dailyDemand[dayStr] = new Array(categories.length).fill(0)
    }

    const catIndex = categoryMap[categoryName]
    if (catIndex !== undefined) {
      dailyDemand[dayStr][catIndex] += 1
    }
  })

  // Convert map to array of objects
  const trainingData = Object.keys(dailyDemand).map(dateStr => ({
    date: dateStr,
    demandVector: dailyDemand[dateStr]
  }))

  return { data: trainingData, categories: categoryNames }
}

async function trainModel () {
  try {
    const fetched = await fetchTrainingData()
    let data = fetched.data
    const categories = fetched.categories
    const numCategories = categories.length

    if (numCategories === 0) {
      console.error('No categories found. Aborting training.')
      process.exit(1)
    }

    if (!data || data.length === 0) {
      console.warn('The database is completely empty for appointments. Inserting a dummy row.')
      const today = new Date().toISOString().split('T')[0]
      data = [{
        date: today,
        demandVector: new Array(numCategories).fill(0)
      }]
    }

    const features = []
    const labels = []

    // Scaler representing max appointments per category per day
    const DEMAND_SCALER = 50

    for (const record of data) {
      features.push(extractDemandFeatures(record.date))

      // Normalize outputs
      const normalizedVector = record.demandVector.map(count => count / DEMAND_SCALER)
      labels.push(normalizedVector)
    }

    console.log(`Training Demand Model with ${features.length} daily records predicting ${numCategories} categories.`)

    const xs = tf.tensor2d(features)
    const ys = tf.tensor2d(labels, [labels.length, numCategories])

    // Multi-Output Regression architecture
    const model = tf.sequential()
    model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [3] }))
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }))
    model.add(tf.layers.dense({ units: numCategories, activation: 'sigmoid' })) // Outputs normalized counts ~0-1

    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'meanSquaredError',
      metrics: ['mse']
    })

    console.log('Starting training...')
    await model.fit(xs, ys, {
      epochs: 80,
      batchSize: 16,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if ((epoch + 1) % 10 === 0) {
            console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(6)}`)
          }
        }
      }
    })

    if (!fs.existsSync(MODEL_DIR)) {
      fs.mkdirSync(MODEL_DIR, { recursive: true })
    }

    // Embed the categories mapping and scaler in the metadata so the backend service knows what output tensor mapped to what string.
    const metadataString = JSON.stringify({
      scaler: DEMAND_SCALER,
      categories: categories
    })

    const saveHandler = tf.io.withSaveHandler(async (artifacts) => {
      const modelJson = {
        modelTopology: artifacts.modelTopology,
        format: 'layers-model',
        generatedBy: metadataString,
        convertedBy: null,
        weightsManifest: [{
          paths: ['weights.bin'],
          weights: artifacts.weightSpecs
        }]
      }

      const modelJsonString = JSON.stringify(modelJson)
      const weightBuffer = Buffer.from(artifacts.weightData)

      fs.writeFileSync(path.join(MODEL_DIR, 'model.json'), modelJsonString)
      fs.writeFileSync(path.join(MODEL_DIR, 'weights.bin'), weightBuffer)

      console.log('Uploading Demand model to Supabase Storage...')

      const { error: errorJson } = await supabase.storage
        .from('ml-models')
        .upload('demand/model.json', modelJsonString, {
          contentType: 'application/json',
          upsert: true
        })

      if (errorJson) console.error('Error uploading model.json:', errorJson)

      const { error: errorWeights } = await supabase.storage
        .from('ml-models')
        .upload('demand/weights.bin', weightBuffer, {
          contentType: 'application/octet-stream',
          upsert: true
        })

      if (errorWeights) console.error('Error uploading weights.bin:', errorWeights)

      return {
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: 'JSON',
          modelTopologyBytes: modelJsonString.length,
          weightSpecsBytes: JSON.stringify(artifacts.weightSpecs).length,
          weightDataBytes: artifacts.weightData.byteLength
        }
      }
    })

    await model.save(saveHandler)

    console.log('Demand Model trained and saved to Supabase successfully!')

    xs.dispose()
    ys.dispose()
    model.dispose()

    process.exit(0)
  } catch (error) {
    console.error('Error during training:', error)
    process.exit(1)
  }
}

trainModel()
