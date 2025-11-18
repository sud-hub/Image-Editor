/**
 * Validation utilities for image editing parameters
 * Ensures parameters meet backend requirements before sending requests
 */

/**
 * Validates adjustment parameters (brightness, contrast, saturation, sharpness)
 * @param {Object} params - Adjustment parameters
 * @param {number} params.brightness - Brightness value (0-2)
 * @param {number} params.contrast - Contrast value (0-2)
 * @param {number} params.saturation - Saturation value (0-2)
 * @param {number} params.sharpness - Sharpness value (0-2)
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateAdjustParams = (params) => {
  const { brightness, contrast, saturation, sharpness } = params

  // Check if all parameters are numbers
  if (typeof brightness !== 'number' || isNaN(brightness)) {
    return { valid: false, error: 'Brightness must be a valid number' }
  }
  if (typeof contrast !== 'number' || isNaN(contrast)) {
    return { valid: false, error: 'Contrast must be a valid number' }
  }
  if (typeof saturation !== 'number' || isNaN(saturation)) {
    return { valid: false, error: 'Saturation must be a valid number' }
  }
  if (typeof sharpness !== 'number' || isNaN(sharpness)) {
    return { valid: false, error: 'Sharpness must be a valid number' }
  }

  // Check if values are within valid range (0-2)
  if (brightness < 0 || brightness > 2) {
    return { valid: false, error: 'Brightness must be between 0 and 2' }
  }
  if (contrast < 0 || contrast > 2) {
    return { valid: false, error: 'Contrast must be between 0 and 2' }
  }
  if (saturation < 0 || saturation > 2) {
    return { valid: false, error: 'Saturation must be between 0 and 2' }
  }
  if (sharpness < 0 || sharpness > 2) {
    return { valid: false, error: 'Sharpness must be between 0 and 2' }
  }

  return { valid: true, error: null }
}

/**
 * Validates crop parameters
 * @param {Object} params - Crop parameters
 * @param {number} params.x - X coordinate
 * @param {number} params.y - Y coordinate
 * @param {number} params.width - Crop width
 * @param {number} params.height - Crop height
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateCropParams = (params) => {
  const { x, y, width, height } = params

  // Check if all parameters are numbers
  if (typeof x !== 'number' || isNaN(x)) {
    return { valid: false, error: 'X coordinate must be a valid number' }
  }
  if (typeof y !== 'number' || isNaN(y)) {
    return { valid: false, error: 'Y coordinate must be a valid number' }
  }
  if (typeof width !== 'number' || isNaN(width)) {
    return { valid: false, error: 'Width must be a valid number' }
  }
  if (typeof height !== 'number' || isNaN(height)) {
    return { valid: false, error: 'Height must be a valid number' }
  }

  // Check if coordinates are non-negative
  if (x < 0) {
    return { valid: false, error: 'X coordinate must be non-negative' }
  }
  if (y < 0) {
    return { valid: false, error: 'Y coordinate must be non-negative' }
  }

  // Check minimum crop size (10x10 pixels as per requirements)
  if (width < 10) {
    return { valid: false, error: 'Crop width must be at least 10 pixels' }
  }
  if (height < 10) {
    return { valid: false, error: 'Crop height must be at least 10 pixels' }
  }

  return { valid: true, error: null }
}

/**
 * Validates text parameters
 * @param {Object} params - Text parameters
 * @param {string} params.text - Text content
 * @param {number} params.x - X coordinate
 * @param {number} params.y - Y coordinate
 * @param {number} params.size - Font size
 * @param {string} params.color - Text color
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateTextParams = (params) => {
  const { text, x, y, size, color } = params

  // Check if text is provided and not empty
  if (typeof text !== 'string' || text.trim() === '') {
    return { valid: false, error: 'Text cannot be empty' }
  }

  // Check if coordinates are numbers
  if (typeof x !== 'number' || isNaN(x)) {
    return { valid: false, error: 'X coordinate must be a valid number' }
  }
  if (typeof y !== 'number' || isNaN(y)) {
    return { valid: false, error: 'Y coordinate must be a valid number' }
  }

  // Check if coordinates are non-negative
  if (x < 0) {
    return { valid: false, error: 'X coordinate must be non-negative' }
  }
  if (y < 0) {
    return { valid: false, error: 'Y coordinate must be non-negative' }
  }

  // Check if size is a valid number
  if (typeof size !== 'number' || isNaN(size)) {
    return { valid: false, error: 'Font size must be a valid number' }
  }

  // Check if size is within reasonable range (12-120 as per UI)
  if (size < 12 || size > 120) {
    return { valid: false, error: 'Font size must be between 12 and 120 pixels' }
  }

  // Check if color is a string (basic validation)
  if (typeof color !== 'string' || color.trim() === '') {
    return { valid: false, error: 'Color must be a valid string' }
  }

  return { valid: true, error: null }
}
