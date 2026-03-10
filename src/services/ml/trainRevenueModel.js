import * as tf from '@tensorflow/tfjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { supabase } from '../../database/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MODEL_DIR = path.join(__dirname, '..', 'ml', 'models', 'revenue')

// Features: [DayOfWeek (0-6), IsWeekend (0-1), Month (0-11)]
export const extractRevenueFeatures = (dateString) => {
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
  console.log('Fetching historical revenue data from database...')

  // We fetch completed appointments directly joined with their service price
  const { data, error } = await supabase
    .from('citas')
    .select('fecha, servicios(precio)')
    .eq('status', 'Completada')

  if (error) {
    console.error('Error fetching data:', error)
    return []
  }

  // Aggregate daily revenue
  const dailyRevenue = {}
  data.forEach(cita => {
    // Only parse the YYYY-MM-DD part to group by day strictly
    const dayStr = cita.fecha.split('T')[0]
    const price = Number(cita.servicios?.precio || 0)

    if (!dailyRevenue[dayStr]) {
      dailyRevenue[dayStr] = 0
    }
    dailyRevenue[dayStr] += price
  })

  // Convert map to array of objects
  return Object.keys(dailyRevenue).map(dateStr => ({
    date: dateStr,
    totalRevenue: dailyRevenue[dateStr]
  }))
}

async function trainModel () {
  try {
    let data = await fetchTrainingData()

    if (!data || data.length === 0) {
      console.warn('The database is completely empty. Inserting a dummy zero row so the model compiles but predicts 0 until real data arrives.')
      // Add a dummy record representing 0 revenue so the model doesn't crash
      // when converting empty arrays to tensors.
      const today = new Date().toISOString().split('T')[0]
      data = [{
        date: today,
        totalRevenue: 0
      }]
    }

    const features = []
    const labels = []

    // Max revenue seen, used to normalize the output label (Regression outputs should be usually 0-1)
    // We'll use a fixed scaler (e.g. 50,000 MXN as the theoretical absolute maximum daily revenue)
    // This makes the neural network much more stable.
    const REVENUE_SCALER = 50000

    for (const record of data) {
      features.push(extractRevenueFeatures(record.date))
      labels.push(record.totalRevenue / REVENUE_SCALER)
    }

    console.log(`Training Revenue Model with ${features.length} daily records.`)

    const xs = tf.tensor2d(features)
    const ys = tf.tensor1d(labels)

    // Regression model architecture
    const model = tf.sequential()
    model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [3] }))
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }))
    // Linear activation because we're predicting a continuous float value, not a probability
    model.add(tf.layers.dense({ units: 1, activation: 'linear' }))

    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'meanSquaredError',
      metrics: ['mse']
    })

    console.log('Starting training...')
    await model.fit(xs, ys, {
      epochs: 100,
      batchSize: 16,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if ((epoch + 1) % 10 === 0) {
            console.log(`Epoch ${epoch + 1}: loss(MSE) = ${logs.loss.toFixed(6)}`)
          }
        }
      }
    })

    if (!fs.existsSync(MODEL_DIR)) {
      fs.mkdirSync(MODEL_DIR, { recursive: true })
    }

    // Include the scaler in the model.json generatedBy metadata field so the service can read it
    const metadataString = `TensorFlow.js Revenue Model | Scaler: ${REVENUE_SCALER}`

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

      console.log('Uploading Revenue model to Supabase Storage (ml-models)...')

      const { error: errorJson } = await supabase.storage
        .from('ml-models')
        .upload('revenue/model.json', modelJsonString, {
          contentType: 'application/json',
          upsert: true
        })

      if (errorJson) console.error('Error uploading model.json:', errorJson)

      const { error: errorWeights } = await supabase.storage
        .from('ml-models')
        .upload('revenue/weights.bin', weightBuffer, {
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

    console.log('Revenue Model trained and saved to Supabase successfully!')

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
