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
   * Get the appropriate model instance with system instructions
   */
  getModel(systemInstruction = null) {
    if (!this.isConfigured()) {
      throw new Error('Gemini AI is not configured');
    }
    
    const config = { model: this.modelName };
    
    // Add system instruction if provided (helps enforce language)
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    
    return this.genAI.getGenerativeModel(config);
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
      english: `You MUST respond ONLY in English. Provide the explanation in clear, professional English. 
Use proper English grammar, vocabulary, and legal terminology throughout your entire response.`,
      
      sinhala: `ඔබ සම්පූර්ණයෙන්ම සිංහල භාෂාවෙන් පිළිතුරු දිය යුතුය. සියලු පැහැදිලි කිරීම් ස්පැෂ්ට සහ වෘත්තීය සිංහල භාෂාවෙන් ලබා දෙන්න.
සියලු මාතෘකා, පැහැදිලි කිරීම් සහ සාරාංශය සිංහල භාෂාවෙන් ලියන්න. ඉංග්‍රීසි භාවිතා නොකරන්න.
You MUST write the ENTIRE response in Sinhala language (සිංහල). Do NOT use English words or phrases.
All headings, explanations, and content must be in Sinhala script only.`,
      
      tamil: `நீங்கள் முழுமையாக தமிழில் மட்டுமே பதிலளிக்க வேண்டும். தெளிவான மற்றும் தொழில்முறை தமிழில் விளக்கத்தை வழங்கவும்.
அனைத்து தலைப்புகள், விளக்கங்கள் மற்றும் சுருக்கம் தமிழில் எழுதவும். ஆங்கிலத்தைப் பயன்படுத்த வேண்டாம்.
You MUST write the ENTIRE response in Tamil language (தமிழ்). Do NOT use English words or phrases.
All headings, explanations, and content must be in Tamil script only.`
    };
    
    return instructions[language] || instructions.english;
  }
  
  /**
   * Get language-specific section headings
   * @param {string} language - Target language
   * @returns {Object} Section headings in target language
   */
  getLanguageHeadings(language) {
    const headings = {
      english: {
        documentType: '**Document Type**',
        mainPurpose: '**Main Purpose**',
        keyPoints: '**Key Points**',
        partiesInvolved: '**Parties Involved**',
        rightsAndObligations: '**Rights and Obligations**',
        importantDates: '**Important Dates**',
        legalImplications: '**Legal Implications**',
        actionItems: '**Action Items**',
        riskFactors: '**Risk Factors**',
        summary: '**Summary**'
      },
      sinhala: {
        documentType: '**ලේඛන වර්ගය**',
        mainPurpose: '**ප්‍රධාන අරමුණ**',
        keyPoints: '**ප්‍රධාන කරුණු**',
        partiesInvolved: '**සම්බන්ධ පාර්ශව**',
        rightsAndObligations: '**අයිතිවාසිකම් සහ බැඳීම්**',
        importantDates: '**වැදගත් දිනයන්**',
        legalImplications: '**නීතිමය බලපෑම්**',
        actionItems: '**ක්‍රියාකාරී කරුණු**',
        riskFactors: '**අවදානම් සාධක**',
        summary: '**සාරාංශය**'
      },
      tamil: {
        documentType: '**ஆவண வகை**',
        mainPurpose: '**முக்கிய நோக்கம்**',
        keyPoints: '**முக்கிய புள்ளிகள்**',
        partiesInvolved: '**சம்பந்தப்பட்ட தரப்பினர்**',
        rightsAndObligations: '**உரிமைகள் மற்றும் கடமைகள்**',
        importantDates: '**முக்கியமான தேதிகள்**',
        legalImplications: '**சட்ட தாக்கங்கள்**',
        actionItems: '**செயல் உருப்படிகள்**',
        riskFactors: '**இடர் காரணிகள்**',
        summary: '**சுருக்கம்**'
      }
    };
    
    return headings[language] || headings.english;
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
      // Validate and normalize language
      language = this.validateLanguage(language);
      
      // Get system instruction based on language
      let systemInstruction = null;
      if (language === 'sinhala') {
        systemInstruction = 'You are a legal expert who ONLY responds in Sinhala language. Never use English except for proper nouns. All your responses must be in Sinhala script (සිංහල).';
      } else if (language === 'tamil') {
        systemInstruction = 'You are a legal expert who ONLY responds in Tamil language. Never use English except for proper nouns. All your responses must be in Tamil script (தமிழ்).';
      }
      
      // Get the configured model with system instruction
      const model = this.getModel(systemInstruction);

      // Truncate document if too long (Gemini has token limits)
      const maxLength = 30000; // characters
      const truncatedText = documentText.length > maxLength 
        ? documentText.substring(0, maxLength) + '...[truncated]'
        : documentText;

      // Create comprehensive prompt for legal document explanation
      const languageInstruction = this.getLanguageInstructions(language);
      const headings = this.getLanguageHeadings(language);
      
      let prompt = '';
      
      if (language === 'sinhala') {
        prompt = `CRITICAL INSTRUCTION: You MUST respond ENTIRELY in Sinhala language. Do NOT use any English words except for proper nouns (names, places).

IMPORTANT: Write EVERYTHING in Sinhala script (සිංහල අකුරු). All explanations, headings, and content must be in Sinhala only.

ඔබ නීතිමය විශේෂඥයෙකු වන අතර පහත ලේඛනය සම්පූර්ණයෙන්ම සිංහල භාෂාවෙන් විශ්ලේෂණය කළ යුතුය.

විශේෂ උපදෙස්: ඔබගේ සම්පූර්ණ පිළිතුර සිංහල භාෂාවෙන් විය යුතුය. ඉංග්‍රීසි භාෂාව භාවිතා නොකරන්න.

පහත නීතිමය ලේඛනය විශ්ලේෂණය කර සිංහල භාෂාවෙන් සම්පූර්ණ පැහැදිලි කිරීමක් ලබා දෙන්න:

ඔබගේ සිංහල පැහැදිලි කිරීමට පහත කොටස් ඇතුළත් විය යුතුය:

1. ${headings.documentType}
මෙය කුමන වර්ගයේ නීතිමය ලේඛනයක්ද යන්න සිංහලෙන් පැහැදිලි කරන්න.

2. ${headings.mainPurpose}
ලේඛනයේ ප්‍රධාන අරමුණ සහ අභිප්‍රාය සිංහලෙන් විස්තර කරන්න.

3. ${headings.keyPoints}
වැදගත්ම වගන්ති, කොන්දේසි සහ කොටස් සිංහලෙන් ලැයිස්තුගත කර පැහැදිලි කරන්න.

4. ${headings.partiesInvolved}
ලේඛනයේ සඳහන් පාර්ශව කවුරුන්ද යන්න සිංහලෙන් හඳුනා ගන්න.

5. ${headings.rightsAndObligations}
එක් එක් පාර්ශවයේ අයිතිවාසිකම් සහ වගකීම් සිංහලෙන් පැහැදිලි කරන්න.

6. ${headings.importantDates}
වැදගත් දිනයන්, කාල සීමාවන් සිංහලෙන් සටහන් කරන්න.

7. ${headings.legalImplications}
නීතිමය ප්‍රතිවිපාක සහ සලකා බැලිය යුතු කරුණු සිංහලෙන් පැහැදිලි කරන්න.

8. ${headings.actionItems}
අවශ්‍ය ක්‍රියාමාර්ග සිංහලෙන් ලැයිස්තුගත කරන්න.

9. ${headings.riskFactors}
විභව අවදානම් සහ සැලකිලිමත් වීමට ඇති කරුණු සිංහලෙන් ඉස්මතු කරන්න.

10. ${headings.summary}
සම්පූර්ණ ලේඛනයේ සංක්ෂිප්ත සාරාංශයක් සිංහලෙන් ලබා දෙන්න.

ලේඛනය:
---
${truncatedText}
---

මතක තබා ගන්න: ඔබගේ සම්පූර්ණ පිළිතුර සිංහල භාෂාවෙන් පමණක් විය යුතුය. දැන් සිංහල භාෂාවෙන් විශ්ලේෂණය ආරම්භ කරන්න:`;
      } else if (language === 'tamil') {
        prompt = `CRITICAL INSTRUCTION: You MUST respond ENTIRELY in Tamil language. Do NOT use any English words except for proper nouns (names, places).

IMPORTANT: Write EVERYTHING in Tamil script (தமிழ் எழுத்து). All explanations, headings, and content must be in Tamil only.

நீங்கள் ஒரு சட்ட நிபுணர் மற்றும் பின்வரும் ஆவணத்தை முழுமையாக தமிழில் மட்டுமே பகுப்பாய்வு செய்ய வேண்டும்.

சிறப்பு அறிவுறுத்தல்: உங்கள் முழு பதிலும் தமிழ் மொழியில் இருக்க வேண்டும். ஆங்கிலம் பயன்படுத்த வேண்டாம்.

பின்வரும் சட்ட ஆவணத்தை பகுப்பாய்வு செய்து தமிழில் முழுமையான விளக்கத்தை வழங்கவும்:

உங்கள் தமிழ் விளக்கத்தில் பின்வரும் பிரிவுகள் இருக்க வேண்டும்:

1. ${headings.documentType}
இது என்ன வகையான சட்ட ஆவணம் என்பதை தமிழில் விளக்கவும்.

2. ${headings.mainPurpose}
ஆவணத்தின் முக்கிய நோக்கம் மற்றும் குறிக்கோளை தமிழில் விவரிக்கவும்.

3. ${headings.keyPoints}
மிக முக்கியமான பிரிவுகள், விதிமுறைகள் மற்றும் பிரிவுகளை தமிழில் பட்டியலிட்டு விளக்கவும்.

4. ${headings.partiesInvolved}
ஆவணத்தில் குறிப்பிடப்பட்டுள்ள தரப்பினர் யார் என்பதை தமிழில் அடையாளம் காணவும்.

5. ${headings.rightsAndObligations}
ஒவ்வொரு தரப்பினரின் உரிமைகள் மற்றும் பொறுப்புகளை தமிழில் விளக்கவும்.

6. ${headings.importantDates}
முக்கியமான தேதிகள், காலக்கெடுக்கள் ஆகியவற்றை தமிழில் குறிப்பிடவும்.

7. ${headings.legalImplications}
சட்ட விளைவுகள் மற்றும் கருத்தில் கொள்ள வேண்டிய விஷயங்களை தமிழில் விளக்கவும்.

8. ${headings.actionItems}
தேவையான நடவடிக்கைகளை தமிழில் பட்டியலிடவும்.

9. ${headings.riskFactors}
சாத்தியமான இடர்கள் மற்றும் கவனிக்க வேண்டிய விஷயங்களை தமிழில் முன்னிலைப்படுத்தவும்.

10. ${headings.summary}
முழு ஆவணத்தின் சுருக்கமான சுருக்கத்தை தமிழில் வழங்கவும்.

ஆவணம்:
---
${truncatedText}
---

நினைவில் கொள்ளுங்கள்: உங்கள் முழு பதிலும் தமிழ் மொழியில் மட்டுமே இருக்க வேண்டும். இப்போது தமிழில் பகுப்பாய்வை தொடங்குங்கள்:`;
      } else {
        // English
        prompt = `You are a legal expert assistant. Analyze the following legal document and provide a comprehensive explanation.

${languageInstruction}

Your explanation should include:
1. ${headings.documentType}: Identify what type of legal document this is
2. ${headings.mainPurpose}: Explain the primary purpose and intent of the document
3. ${headings.keyPoints}: List and explain the most important clauses, terms, or sections
4. ${headings.partiesInvolved}: Identify who are the parties mentioned in the document
5. ${headings.rightsAndObligations}: Explain the rights and obligations of each party
6. ${headings.importantDates}: Note any critical dates, deadlines, or time periods
7. ${headings.legalImplications}: Explain potential legal consequences or considerations
8. ${headings.actionItems}: List any actions required from the parties
9. ${headings.riskFactors}: Highlight any potential risks or areas of concern
10. ${headings.summary}: Provide a brief overall summary

Format your response in clear, well-structured paragraphs with proper headings.

Document Content:
---
${truncatedText}
---

Please provide the explanation now:`;
      }

      // Generate content with language-specific configuration
      const generationConfig = {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192,
      };
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: generationConfig,
      });
      
      const response = await result.response;
      let explanation = response.text();
      
      // Post-process to ensure language compliance
      if (language === 'sinhala') {
        // Check if response has sufficient Sinhala characters
        const sinhalaChars = (explanation.match(/[\u0D80-\u0DFF]/g) || []).length;
        if (sinhalaChars < 100) {
          console.warn('⚠️  Warning: Response may not be fully in Sinhala');
          // Retry with even stronger instruction
          const retryPrompt = `මෙය අවසන් අවස්ථාවයි: ඔබගේ සම්පූර්ණ පිළිතුර සිංහල භාෂාවෙන් පමණක් විය යුතුය. කිසිදු ඉංග්‍රීසි වචනයක් භාවිතා නොකරන්න.\n\n${prompt}`;
          const retryResult = await model.generateContent(retryPrompt);
          explanation = retryResult.response.text();
        }
      } else if (language === 'tamil') {
        // Check if response has sufficient Tamil characters
        const tamilChars = (explanation.match(/[\u0B80-\u0BFF]/g) || []).length;
        if (tamilChars < 100) {
          console.warn('⚠️  Warning: Response may not be fully in Tamil');
          // Retry with even stronger instruction
          const retryPrompt = `இது கடைசி வாய்ப்பு: உங்கள் முழு பதிலும் தமிழில் மட்டுமே இருக்க வேண்டும். எந்த ஆங்கில வார்த்தைகளையும் பயன்படுத்த வேண்டாம்.\n\n${prompt}`;
          const retryResult = await model.generateContent(retryPrompt);
          explanation = retryResult.response.text();
        }
      }

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
      }
      
      throw new Error('Failed to generate explanation: ' + error.message);
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
      // Validate and normalize language
      language = this.validateLanguage(language);
      
      // Get system instruction based on language
      let systemInstruction = null;
      if (language === 'sinhala') {
        systemInstruction = 'You are a legal expert who ONLY responds in Sinhala language. Never use English except for proper nouns. All your responses must be in Sinhala script (සිංහල).';
      } else if (language === 'tamil') {
        systemInstruction = 'You are a legal expert who ONLY responds in Tamil language. Never use English except for proper nouns. All your responses must be in Tamil script (தமிழ்).';
      }
      
      const model = this.getModel(systemInstruction);

      const maxLength = 10000;
      const truncatedText = documentText.length > maxLength 
        ? documentText.substring(0, maxLength) + '...[truncated]'
        : documentText;

      const languageInstruction = this.getLanguageInstructions(language);

      let prompt = '';
      
      if (language === 'sinhala') {
        prompt = `CRITICAL: Respond ONLY in Sinhala. NO English words.

මෙම නීතිමය ලේඛනයේ සංක්ෂිප්ත සාරාංශයක් සිංහලෙන් ලබා දෙන්න (3-4 ඡේද).

ඇතුළත් කළ යුතු දේ:
- ලේඛන වර්ගය සහ අරමුණ (සිංහලෙන්)
- ප්‍රධාන පාර්ශව (සිංහලෙන්)
- ප්‍රධාන නියමයන් සහ කොන්දේසි (සිංහලෙන්)
- වැදගත් දිනයන් හෝ ක්‍රියා (සිංහලෙන්)

ලේඛනය:
${truncatedText}

සිංහල සාරාංශය (ඉංග්‍රීසි වචන නැත):`;
      } else if (language === 'tamil') {
        prompt = `CRITICAL: Respond ONLY in Tamil. NO English words.

இந்த சட்ட ஆவணத்தின் சுருக்கமான சுருக்கத்தை தமிழில் வழங்கவும் (3-4 பத்திகள்).

உள்ளடக்க வேண்டியவை:
- ஆவண வகை மற்றும் நோக்கம் (தமிழில்)
- முக்கிய தரப்பினர் (தமிழில்)
- முக்கிய விதிமுறைகள் மற்றும் நிபந்தனைகள் (தமிழில்)
- முக்கியமான தேதிகள் அல்லது செயல்கள் (தமிழில்)

ஆவணம்:
${truncatedText}

தமிழ் சுருக்கம் (ஆங்கில வார்த்தைகள் இல்லை):`;
      } else {
        prompt = `Provide a concise 3-4 paragraph summary of this legal document. ${languageInstruction}

Include:
- Document type and purpose
- Key parties involved
- Main terms and conditions
- Any critical dates or actions required

Document:
${truncatedText}

Summary:`;
      }

      const result = await model.generateContent(prompt);
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

  /**
   * Validate and normalize language code
   * @param {string} language - Language code to validate
   * @returns {string} Normalized language code
   */
  validateLanguage(language) {
    const normalized = language.toLowerCase().trim();
    const supported = ['english', 'sinhala', 'tamil'];
    
    if (!supported.includes(normalized)) {
      console.warn(`Unsupported language '${language}', defaulting to English`);
      return 'english';
    }
    
    return normalized;
  }
}

// Export singleton instance
module.exports = new GeminiService();
