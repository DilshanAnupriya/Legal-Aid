const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;

class GeminiService {
  constructor() {
    // Initialize Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
      this.modelName = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Use gemini-2.0-flash-lite which is free and available
      this.modelName = 'gemini-2.0-flash-lite';
      console.log('✅ Gemini AI initialized successfully with model:', this.modelName);
    }
  }

  /**
   * Check if Gemini AI is properly configured
   */
  isConfigured() {
    return this.genAI !== null && this.modelName !== null;
  }

  /**
   * Get the appropriate model instance
   */
  getModel() {
    if (!this.isConfigured()) {
      throw new Error('Gemini AI is not configured');
    }
    return this.genAI.getGenerativeModel({ model: this.modelName });
  }

  /**
   * Extract text from PDF file
   * @param {string} filePath - Path to the PDF file
   * @returns {Promise<string>} Extracted text content
   */
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF: ' + error.message);
    }
  }

  /**
   * Get language-specific prompt instructions
   * @param {string} language - Target language (english, sinhala, tamil)
   * @returns {string} Language-specific instructions
   */
  getLanguageInstructions(language) {
    const instructions = {
      english: 'Provide the explanation in clear, professional English.',
      sinhala: 'ස්පැෂ්ටව සහ වෘත්තීය සිංහල භාෂාවෙන් පැහැදිලි කිරීම ලබා දෙන්න.',
      tamil: 'தெளிவான மற்றும் தொழில்முறை தமிழில் விளக்கத்தை வழங்கவும்.'
    };
    
    return instructions[language] || instructions.english;
  }

  /**
   * Generate AI-powered explanation for legal document
   * @param {string} documentText - Extracted text from the document
   * @param {string} language - Target language (english, sinhala, tamil)
   * @returns {Promise<Object>} Explanation and metadata
   */
  async explainLegalDocument(documentText, language = 'english') {
    if (!this.isConfigured()) {
      throw new Error('Gemini AI is not configured. Please set GEMINI_API_KEY in environment variables.');
    }

    try {
      // Get the configured model
      const model = this.getModel();

      // Truncate document if too long (Gemini has token limits)
      const maxLength = 30000; // characters
      const truncatedText = documentText.length > maxLength 
        ? documentText.substring(0, maxLength) + '...[truncated]'
        : documentText;

      // Create comprehensive prompt for legal document explanation
      const languageInstruction = this.getLanguageInstructions(language);
      
      const prompt = `You are a legal expert assistant. Analyze the following legal document and provide a comprehensive explanation.

${languageInstruction}

Your explanation should include:
1. **Document Type**: Identify what type of legal document this is
2. **Main Purpose**: Explain the primary purpose and intent of the document
3. **Key Points**: List and explain the most important clauses, terms, or sections
4. **Parties Involved**: Identify who are the parties mentioned in the document
5. **Rights and Obligations**: Explain the rights and obligations of each party
6. **Important Dates**: Note any critical dates, deadlines, or time periods
7. **Legal Implications**: Explain potential legal consequences or considerations
8. **Action Items**: List any actions required from the parties
9. **Risk Factors**: Highlight any potential risks or areas of concern
10. **Summary**: Provide a brief overall summary

Format your response in clear, well-structured paragraphs with proper headings.

Document Content:
---
${truncatedText}
---

Please provide the explanation now:`;

      // Generate content with retry logic for service unavailable errors
      const result = await this.generateWithRetry(model, prompt);
      const response = await result.response;
      const explanation = response.text();

      // Calculate approximate confidence based on response quality
      const confidence = this.calculateConfidence(explanation, documentText);

      return {
        explanation: explanation,
        language: language,
        confidence: confidence,
        wordCount: explanation.split(/\s+/).filter(word => word.length > 0).length,
        characterCount: explanation.length,
        documentLength: documentText.length,
        truncated: documentText.length > maxLength
      };

    } catch (error) {
      console.error('Gemini AI explanation error:', error);
      
      // Handle specific error types
      if (error.message && error.message.includes('API key')) {
        throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.');
      } else if (error.message && error.message.includes('quota')) {
        throw new Error('Gemini API quota exceeded. Please try again later.');
      } else if (error.message && error.message.includes('safety')) {
        throw new Error('Content was blocked by safety filters. The document may contain sensitive content.');
      } else if (error.status === 503 || error.message.includes('overloaded')) {
        throw new Error('Gemini AI service is currently overloaded. Please try again in a few moments.');
      } else if (error.status === 429) {
        throw new Error('Too many requests to Gemini AI. Please wait a moment and try again.');
      } else if (error.status === 500) {
        throw new Error('Gemini AI service is experiencing internal issues. Please try again later.');
      }
      
      throw new Error('Failed to generate explanation: ' + error.message);
    }
  }

  /**
   * Generate content with retry logic for handling service unavailable errors
   * @param {Object} model - Gemini model instance
   * @param {string} prompt - The prompt to send
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} Generated content result
   */
  async generateWithRetry(model, prompt, maxRetries = 3, baseDelay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Gemini AI request attempt ${attempt}/${maxRetries}`);
        return await model.generateContent(prompt);
      } catch (error) {
        const isRetryableError = 
          error.status === 503 || 
          error.status === 429 || 
          error.status === 500 ||
          error.message.includes('overloaded') ||
          error.message.includes('rate limit') ||
          error.message.includes('service unavailable');

        if (!isRetryableError || attempt === maxRetries) {
          // Don't retry for non-retryable errors or if we've reached max retries
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Gemini AI error (attempt ${attempt}): ${error.message}`);
        console.log(`Retrying in ${delay}ms...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Calculate confidence score based on explanation quality
   * @param {string} explanation - Generated explanation
   * @param {string} documentText - Original document text
   * @returns {number} Confidence score (0-100)
   */
  calculateConfidence(explanation, documentText) {
    let confidence = 50; // Base confidence

    // Check explanation length
    if (explanation.length > 500) confidence += 15;
    if (explanation.length > 1000) confidence += 10;

    // Check for structured content (headings, lists)
    const hasStructure = /(\*\*|###|##|\n\d+\.)/.test(explanation);
    if (hasStructure) confidence += 15;

    // Check if explanation is substantive (not too short for document size)
    const ratio = explanation.length / Math.max(documentText.length, 1);
    if (ratio > 0.1) confidence += 10;

    // Ensure confidence is within 0-100 range
    return Math.min(100, Math.max(0, confidence));
  }

  /**
   * Generate a quick summary of the document (shorter version)
   * @param {string} documentText - Extracted text from the document
   * @param {string} language - Target language
   * @returns {Promise<Object>} Summary and metadata
   */
  async generateQuickSummary(documentText, language = 'english') {
    if (!this.isConfigured()) {
      throw new Error('Gemini AI is not configured. Please set GEMINI_API_KEY in environment variables.');
    }

    try {
      const model = this.getModel();

      const maxLength = 10000;
      const truncatedText = documentText.length > maxLength 
        ? documentText.substring(0, maxLength) + '...[truncated]'
        : documentText;

      const languageInstruction = this.getLanguageInstructions(language);

      const prompt = `Provide a concise 3-4 paragraph summary of this legal document. ${languageInstruction}

Include:
- Document type and purpose
- Key parties involved
- Main terms and conditions
- Any critical dates or actions required

Document:
${truncatedText}

Summary:`;

      const result = await this.generateWithRetry(model, prompt);
      const response = await result.response;
      const summary = response.text();

      return {
        summary: summary,
        language: language,
        wordCount: summary.split(/\s+/).filter(word => word.length > 0).length,
        characterCount: summary.length
      };

    } catch (error) {
      console.error('Gemini AI summary error:', error);
      throw new Error('Failed to generate summary: ' + error.message);
    }
  }

  /**
   * Get supported languages
   * @returns {Array} List of supported languages
   */
  getSupportedLanguages() {
    return [
      { code: 'english', name: 'English', nativeName: 'English' },
      { code: 'sinhala', name: 'Sinhala', nativeName: 'සිංහල' },
      { code: 'tamil', name: 'Tamil', nativeName: 'தமிழ்' }
    ];
  }
}

// Export singleton instance
module.exports = new GeminiService();
