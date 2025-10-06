# 📄 AI Document Analysis - Multilingual Support

## Overview
The Legal-Aid application provides AI-powered document analysis with **full support for three languages**:
- 🇬🇧 **English**
- 🇱🇰 **Sinhala (සිංහල)**
- 🇱🇰 **Tamil (தமிழ்)**

## Features

### ✨ What the AI Does

The AI analyzes legal documents and provides comprehensive explanations in your chosen language, including:

1. **Document Type** - Identifies what type of legal document it is
2. **Main Purpose** - Explains the primary intent and objective
3. **Key Points** - Lists and explains important clauses and terms
4. **Parties Involved** - Identifies all mentioned parties
5. **Rights & Obligations** - Explains what each party must do
6. **Important Dates** - Notes critical deadlines and time periods
7. **Legal Implications** - Explains potential legal consequences
8. **Action Items** - Lists required actions from parties
9. **Risk Factors** - Highlights potential risks and concerns
10. **Summary** - Provides an overall summary

### 🌍 Language Support

#### English
- Professional legal terminology
- Clear, structured explanations
- Proper formatting with headings

#### Sinhala (සිංහල)
- **Full native language support**
- All headings and explanations in Sinhala script
- Legal terminology in Sinhala
- No English mixing - 100% Sinhala output

Example headings:
- ලේඛන වර්ගය (Document Type)
- ප්‍රධාන අරමුණ (Main Purpose)
- ප්‍රධාන කරුණු (Key Points)
- නීතිමය බලපෑම් (Legal Implications)

#### Tamil (தமிழ்)
- **Full native language support**
- All headings and explanations in Tamil script
- Legal terminology in Tamil
- No English mixing - 100% Tamil output

Example headings:
- ஆவண வகை (Document Type)
- முக்கிய நோக்கம் (Main Purpose)
- முக்கிய புள்ளிகள் (Key Points)
- சட்ட தாக்கங்கள் (Legal Implications)

## Technical Implementation

### AI Model
- **Provider**: Google Gemini AI
- **Model**: gemini-2.0-flash-lite (free tier)
- **Max Document Length**: 30,000 characters
- **Supported File Format**: PDF only

### Language Processing
The system uses language-specific prompts that:
1. **Instruct the AI in the target language**
2. **Provide section headings in the native script**
3. **Enforce strict language-only output**
4. **Prevent language mixing**

### How It Works

```javascript
// Language validation and normalization
language = validateLanguage(language); // Ensures valid language code

// Language-specific prompt generation
if (language === 'sinhala') {
  // Full Sinhala prompt with native headings
} else if (language === 'tamil') {
  // Full Tamil prompt with native headings
} else {
  // English prompt
}

// AI generates response in requested language
```

## User Workflow

1. **Upload PDF** → Select a legal document (PDF format)
2. **Choose Language** → Select English, Sinhala, or Tamil
3. **Analyze** → AI processes the document
4. **View Results** → Get comprehensive explanation in chosen language
5. **History** → All analyses are saved for future reference

## API Endpoints

### Explain Document
```http
POST /api/documents/explain
Content-Type: multipart/form-data

Parameters:
- file: PDF file (required)
- language: 'english' | 'sinhala' | 'tamil' (required)

Response:
{
  "success": true,
  "data": {
    "explanation": "Full explanation in requested language...",
    "language": "sinhala",
    "confidence": 95,
    "wordCount": 450,
    "characterCount": 2800
  }
}
```

### Get Supported Languages
```http
GET /api/documents/languages

Response:
{
  "success": true,
  "data": {
    "languages": [
      { "code": "english", "name": "English", "nativeName": "English" },
      { "code": "sinhala", "name": "Sinhala", "nativeName": "සිංහල" },
      { "code": "tamil", "name": "Tamil", "nativeName": "தமிழ்" }
    ],
    "default": "english"
  }
}
```

## Configuration

### Environment Variables
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
NODE_ENV=development
PORT=5000
```

### Getting a Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to your `.env` file

## Testing the Languages

### Test Sinhala Support
1. Upload a PDF document
2. Select "Sinhala (සිංහල)" from the language dropdown
3. Click "Analyze Document"
4. Verify all headings and content are in Sinhala script

### Test Tamil Support
1. Upload a PDF document
2. Select "Tamil (தமிழ்)" from the language dropdown
3. Click "Analyze Document"
4. Verify all headings and content are in Tamil script

## Quality Metrics

The system provides:
- **Confidence Score**: AI analysis quality (0-100%)
- **Word Count**: Number of words in explanation
- **Character Count**: Total characters in response
- **Processing Status**: completed, processing, failed

## Error Handling

The system handles:
- ✅ Invalid language codes (defaults to English)
- ✅ PDF parsing errors
- ✅ AI service unavailability
- ✅ API quota exceeded
- ✅ Content safety filters
- ✅ Network errors

## Best Practices

1. **Use high-quality PDF files** - Scanned documents may have poor text extraction
2. **Choose the correct language** - Select the language you want the explanation in
3. **Check confidence scores** - Higher scores indicate better analysis quality
4. **Review history** - Previous analyses are saved for reference
5. **Monitor API usage** - Free tier has daily limits

## Troubleshooting

### Issue: Getting English output when selecting Sinhala/Tamil
**Solution**: This fix enforces strict language output. The AI prompt now explicitly instructs to use only the target language.

### Issue: Mixed language in response
**Solution**: Updated prompts prevent language mixing by providing native headings and instructions.

### Issue: AI service unavailable
**Solution**: Check GEMINI_API_KEY in environment variables.

## Future Enhancements

- [ ] Support for more document formats (DOCX, images)
- [ ] Additional languages (Hindi, Bengali, etc.)
- [ ] Custom legal terminology glossaries
- [ ] Batch document processing
- [ ] Document comparison features
- [ ] Export to multiple formats

## Support

For issues or questions:
- Check server logs for error messages
- Verify Gemini API key is configured
- Ensure PDF files are text-based (not scanned images)
- Check network connectivity

---

**Last Updated**: October 6, 2025  
**Version**: 2.0.0 - Full Multilingual Support
