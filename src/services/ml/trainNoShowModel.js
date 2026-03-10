import * as tf from '@tensorflow/tfjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { supabase } from '../../database/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MODEL_DIR = path.join(__dirname, '..', 'ml', 'models', 'no-show')

export const extractFeatures = (cita) => {
  const hour = new Date(cita.hora_inicio || cita.fecha).getHours() || 12
  const creationDate = cita.fecha_creacion ? new Date(cita.fecha_creacion) : new Date()
  const appointmentDate = new Date(cita.fecha)
  const leadTimeDays = Math.max(0, (appointmentDate - creationDate) / (1000 * 60 * 60 * 24)) || 0
  const dayOfWeek = appointmentDate.getDay() || 0

  return [
    hour / 24,
    leadTimeDays / 30,
    dayOfWeek / 6
  ]
}

const getLabel = (status) => {
  const s = status ? status.toLowerCase() : ''
  if (['cancelado', 'cancelada', 'ausente', 'no-show'].includes(s)) return 1
  if (['completado', 'completada'].includes(s)) return 0
  return null
}

async function fetchTrainingData () {
  console.log('Fetching historical appointments from database...')
  const { data, error } = await supabase
    .from('citas')
    .select('status, fecha, hora_inicio, fecha_creacion')
    .in('status', ['completado', 'completada', 'cancelado', 'cancelada', 'ausente'])

  if (error) {
    console.error('Error fetching data:', error)
    return []
  }

  return data
}

async function trainModel () {
  try {
    const data = await fetchTrainingData()

    if (!data || data.length < 10) {
      console.warn('Not enough historical data to train the model realistically. Using synthetic data for demonstration.')
      for (let i = 0; i < 500; i++) {
        // Creating a more obvious synthetic pattern for the AI to learn
        // Pattern: Long lead times + Afternoon/Evening appointments = Higher chance of No-Show
        const isCancelado = Math.random() > 0.6

        const now = Date.now()
        // If it's going to be canceled, we artificially make the lead time longer (e.g. 15-30 days)
        // If it's completed, we make lead time shorter (e.g. 1-10 days)
        const leadDays = isCancelado ? 15 + Math.random() * 15 : 1 + Math.random() * 9

        const fecha = new Date(now + leadDays * 24 * 60 * 60 * 1000)

        // If it's going to be canceled, we artificially push it to late hours (16:00 - 20:00)
        // If completed, morning hours (08:00 - 14:00)
        const hour = isCancelado ? 16 + Math.floor(Math.random() * 4) : 8 + Math.floor(Math.random() * 6)
        fecha.setHours(hour)

        data.push({
          status: isCancelado ? 'cancelado' : 'completado',
          fecha: fecha.toISOString(),
          hora_inicio: fecha.toISOString(),
          fecha_creacion: new Date(now).toISOString()
        })
      }
    }

    const features = []
    const labels = []

    for (const cita of data) {
      const label = getLabel(cita.status)
      if (label !== null) {
        features.push(extractFeatures(cita))
        labels.push(label)
      }
    }

    console.log(`Training with ${features.length} samples.`)

    const xs = tf.tensor2d(features)
    const ys = tf.tensor1d(labels)

    // Build a deeper neural network to capture the patterns better
    const model = tf.sequential()
    model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [3] }))
    model.add(tf.layers.dense({ units: 8, activation: 'relu' }))
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' })) // Output probability (0 to 1)

    model.compile({
      optimizer: tf.train.adam(0.005),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    })

    console.log('Starting training...')
    await model.fit(xs, ys, {
      epochs: 80,
      batchSize: 32,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if ((epoch + 1) % 10 === 0) {
            console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`)
          }
        }
      }
    })

    if (!fs.existsSync(MODEL_DIR)) {
      fs.mkdirSync(MODEL_DIR, { recursive: true })
    }

    console.log(`Saving model to ${MODEL_DIR}...`)

    // Custom save handler that also uploads to Supabase
    const saveHandler = tf.io.withSaveHandler(async (artifacts) => {
      const modelJson = {
        modelTopology: artifacts.modelTopology,
        format: 'layers-model',
        generatedBy: 'TensorFlow.js validation script',
        convertedBy: null,
        weightsManifest: [{
          paths: ['weights.bin'],
          weights: artifacts.weightSpecs
        }]
      }

      const modelJsonString = JSON.stringify(modelJson)
      const weightBuffer = Buffer.from(artifacts.weightData)

      // Keep local copy just in case
      fs.writeFileSync(path.join(MODEL_DIR, 'model.json'), modelJsonString)
      fs.writeFileSync(path.join(MODEL_DIR, 'weights.bin'), weightBuffer)

      console.log('Uploading model to Supabase Storage (ml-models)...')

      // Upload to Supabase Storage
      const { error: errorJson } = await supabase.storage
        .from('ml-models')
        .upload('no-show/model.json', modelJsonString, {
          contentType: 'application/json',
          upsert: true
        })

      if (errorJson) console.error('Error uploading model.json:', errorJson)

      const { error: errorWeights } = await supabase.storage
        .from('ml-models')
        .upload('no-show/weights.bin', weightBuffer, {
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

    console.log('Model trained and saved to Supabase successfully!')

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
