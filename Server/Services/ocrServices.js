const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class OCRService {
  constructor() {
    this.workerPool = [];
    this.maxWorkers = 2; // Limit concurrent workers to prevent memory issues
    this.activeWorkers = 0;
  }

  /**
   * Preprocess image for better OCR results
   * @param {string} imagePath - Path to the image file
   * @returns {Promise<Buffer>} Processed image buffer
   */
  async preprocessImage(imagePath) {
    try {
      const processedImage = await sharp(imagePath)
        .resize(null, 2000, { 
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3 
        })
        .grayscale()
        .normalize()
        .sharpen({ sigma: 1.0 })
        .threshold(128)
        .png({ quality: 90 })
        .toBuffer();

      return processedImage;
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw new Error('Failed to preprocess image for OCR');
    }
  }

  /**
   * Extract text from image using OCR
   * @param {string} imagePath - Path to the image file
   * @param {Object} options - OCR options
   * @returns {Promise<Object>} OCR result with text and confidence
   */
  async extractText(imagePath, options = {}) {
    const {
      language = 'eng',
      psm = '6', // Page segmentation mode
      oem = '3'  // OCR Engine Mode
    } = options;

    try {
      // Check if file exists
      await fs.access(imagePath);

      // Preprocess image
      const processedImageBuffer = await this.preprocessImage(imagePath);

      // Perform OCR
      const { data } = await Tesseract.recognize(
        processedImageBuffer,
        language,
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
          tessedit_pageseg_mode: psm,
          tessedit_ocr_engine_mode: oem,
          preserve_interword_spaces: '1',
          tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:\'"()[]{}/-_@#$%^&*+=|\\<>~` \n\t'
        }
      );

      // Clean up extracted text
      const cleanedText = this.cleanExtractedText(data.text);
      
      return {
        text: cleanedText,
        confidence: Math.round(data.confidence),
        symbols: data.symbols?.length || 0,
        words: data.words?.length || 0,
        lines: data.lines?.length || 0,
        paragraphs: data.paragraphs?.length || 0,
        blocks: data.blocks?.length || 0
      };

    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error(`OCR failed: ${error.message}`);
    }
  }

  /**
   * Clean and format extracted text
   * @param {string} text - Raw extracted text
   * @returns {string} Cleaned text
   */
  cleanExtractedText(text) {
    if (!text) return '';

    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim()
      // Fix common OCR errors
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
      .replace(/(\d)([A-Za-z])/g, '$1 $2') // Add space between numbers and letters
      .replace(/([A-Za-z])(\d)/g, '$1 $2') // Add space between letters and numbers
      // Fix punctuation spacing
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
      .replace(/([,;:])\s*/g, '$1 ')
      // Remove invalid characters
      .replace(/[^\w\s.,!?;:()'"[\]{}\-_@#$%^&*+=|\\<>~`]/g, '')
      // Normalize multiple spaces to single space
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract text with retry mechanism
   * @param {string} imagePath - Path to image
   * @param {Object} options - OCR options
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<Object>} OCR result
   */
  async extractTextWithRetry(imagePath, options = {}, maxRetries = 2) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`OCR attempt ${attempt} for ${path.basename(imagePath)}`);
        const result = await this.extractText(imagePath, options);
        
        // Check if result has reasonable confidence
        if (result.confidence >= 30 || attempt === maxRetries + 1) {
          return result;
        }
        
        console.log(`Low confidence (${result.confidence}%), retrying...`);
        
      } catch (error) {
        lastError = error;
        console.log(`OCR attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries + 1) {
          throw lastError;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  /**
   * Get supported languages
   * @returns {Array<string>} List of supported language codes
   */
  getSupportedLanguages() {
    return [
      'eng', // English
      'spa', // Spanish
      'fra', // French
      'deu', // German
      'ita', // Italian
      'por', // Portuguese
      'rus', // Russian
      'chi_sim', // Chinese Simplified
      'chi_tra', // Chinese Traditional
      'jpn', // Japanese
      'kor', // Korean
      'ara', // Arabic
      'hin', // Hindi
    ];
  }

  /**
   * Validate language code
   * @param {string} language - Language code to validate
   * @returns {boolean} Whether language is supported
   */
  isLanguageSupported(language) {
    return this.getSupportedLanguages().includes(language);
  }

  /**
   * Get OCR statistics for monitoring
   * @returns {Object} OCR service statistics
   */
  getStats() {
    return {
      activeWorkers: this.activeWorkers,
      maxWorkers: this.maxWorkers,
      supportedLanguages: this.getSupportedLanguages().length
    };
  }
}

module.exports = new OCRService();