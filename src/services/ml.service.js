import * as tf from '@tensorflow/tfjs'
import { supabase } from '../database/index.js'

let noShowModel = null

/**
/**
 * Custom IO handler to load model directly from downloaded buffers in pure JS
 */
const customBufferLoader = (modelJsonText, weightArrayBuffer) => {
  return {
    load: async () => {
      const modelJson = JSON.parse(modelJsonText)
      const weightsManifest = modelJson.weightsManifest

      return {
        modelTopology: modelJson.topology || modelJson.modelTopology,
        weightSpecs: weightsManifest[0].weights,
        weightData: weightArrayBuffer
      }
    }
  }
}

/**
 * Initializes and loads the pre-trained model into memory from Supabase Storage.
 * This should be called when the server starts.
 */
export const loadNoShowModel = async () => {
  try {
    console.log('[ML Service] Fetching No-Show model from Supabase Storage...')

    const { data: modelData, error: modelError } = await supabase.storage
      .from('ml-models')
      .download('no-show/model.json')

    const { data: weightData, error: weightError } = await supabase.storage
      .from('ml-models')
      .download('no-show/weights.bin')

    if (modelError || weightError || !modelData || !weightData) {
      console.warn('[ML Service] Model files not found in Supabase Storage. Please run the training script.')
      return false
    }

    const modelJsonText = await modelData.text()
    const weightArrayBuffer = await weightData.arrayBuffer()

    console.log('[ML Service] Loading No-Show model into memory...')
    noShowModel = await tf.loadLayersModel(customBufferLoader(modelJsonText, weightArrayBuffer))
    console.log('[ML Service] No-Show model loaded successfully.')
    return true
  } catch (error) {
    console.error('[ML Service] Error loading model from Supabase:', error)
    return false
  }
}

/**
 * Features extraction for inference. Matches the logic in trainNoShowModel.js
 */
const extractFeaturesForPrediction = (cita) => {
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

/**
 * Predicts the probability of a No-Show for a given appointment.
 * @param {Object} cita - Appointment details (must include fecha, hora_inicio, fecha_creacion)
 * @returns {Number} Probability from 0.0 to 1.0
 */
export const predictNoShowRisk = async (cita) => {
  if (!noShowModel) {
    console.warn('[ML Service] Model not loaded. Returning baseline risk of 0.15.')
    return 0.15 // Default fallback risk
  }

  try {
    const features = extractFeaturesForPrediction(cita)
    const inputTensor = tf.tensor2d([features])

    // Predict
    const predictionTensor = noShowModel.predict(inputTensor)
    const predictionArray = await predictionTensor.data()

    // Cleanup
    inputTensor.dispose()
    predictionTensor.dispose()

    const risk = predictionArray[0]
    return risk
  } catch (error) {
    console.error('[ML Service] Error during prediction:', error)
    return 0.15 // Fallback
  }
}
