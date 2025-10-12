const express = require('express');
const router = express.Router();
const {
    GenerateDocument,
    GetDocumentTemplates,
    PreviewDocument
} = require('../Controllers/DocumentGeneratorController');

// Get all available document templates
// GET /api/documents/generate/templates
router.get('/templates', GetDocumentTemplates);

// Preview document (text only, no PDF generation)
// POST /api/documents/generate/preview
// Body: { templateType: string, details: object }
router.post('/preview', PreviewDocument);

// Generate document (with PDF option)
// POST /api/documents/generate/generate
// Body: { templateType: string, details: object, format: 'pdf' | 'text' }
router.post('/generate', GenerateDocument);

module.exports = router;