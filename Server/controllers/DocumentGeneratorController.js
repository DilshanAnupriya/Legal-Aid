const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Document templates with Gemini prompts
const DOCUMENT_TEMPLATES = {
    'complaint_letter': {
        name: 'Legal Complaint Letter',
        description: 'Formal complaint letter for legal issues',
        prompt: `Generate a professional legal complaint letter with the following details:
        - Complainant: {name}
        - Address: {address}
        - Issue: {issue}
        - Respondent: {respondent}
        - Date of Incident: {incidentDate}
        - Demands: {demands}
        
        Format: Professional legal format with proper salutation, body, and closing.
        Include: Reference numbers, legal citations where applicable, and clear demands.
        Tone: Firm but professional.`
    },
    'affidavit': {
        name: 'Affidavit',
        description: 'Sworn written statement',
        prompt: `Generate a legal affidavit with:
        - Deponent Name: {name}
        - Age: {age}
        - Occupation: {occupation}
        - Address: {address}
        - Facts to be stated: {facts}
        - Purpose: {purpose}
        
        Include: Proper affidavit format, verification clause, and notary section.
        Follow standard legal affidavit structure.`
    },
    'notice': {
        name: 'Legal Notice',
        description: 'Formal legal notice',
        prompt: `Generate a legal notice with:
        - Sender: {name}
        - Recipient: {recipient}
        - Subject: {subject}
        - Facts: {facts}
        - Legal basis: {legalBasis}
        - Demands: {demands}
        - Timeline: {timeline}
        
        Format: Standard legal notice format with proper citations and timeline for response.`
    },
    'petition': {
        name: 'Petition',
        description: 'Legal petition document',
        prompt: `Generate a legal petition with:
        - Petitioner: {name}
        - Against: {against}
        - Matter: {matter}
        - Facts: {facts}
        - Prayer/Relief: {relief}
        
        Include: Proper petition format with facts, grounds, and prayers.`
    },
    'authorization_letter': {
        name: 'Authorization Letter',
        description: 'Letter authorizing someone to act on your behalf',
        prompt: `Generate an authorization letter with:
        - Authorizer: {name}
        - Authorized Person: {authorizedPerson}
        - Purpose: {purpose}
        - Duration: {duration}
        - Scope: {scope}
        
        Format: Clear authorization with specific powers and limitations.`
    },
    'rental_agreement': {
        name: 'Rental Agreement',
        description: 'Residential/commercial rental agreement',
        prompt: `Generate a rental agreement with:
        - Landlord: {landlord}
        - Tenant: {tenant}
        - Property: {property}
        - Rent Amount: {rent}
        - Duration: {duration}
        - Terms: {terms}
        
        Include: Standard clauses for maintenance, termination, security deposit, and legal compliance.`
    }
};

// Generate document content using Gemini
const generateDocumentContent = async (templateType, details) => {
    try {
        const template = DOCUMENT_TEMPLATES[templateType];

        if (!template) {
            throw new Error('Invalid document template');
        }

        // Replace placeholders in prompt with actual values
        let prompt = template.prompt;
        Object.keys(details).forEach(key => {
            prompt = prompt.replace(`{${key}}`, details[key] || '[Not provided]');
        });

        // Enhanced prompt for better formatting
        const fullPrompt = `${prompt}

IMPORTANT FORMATTING RULES:
1. Use clear section headings
2. Number all paragraphs/clauses
3. Use formal legal language
4. Include date placeholders where needed
5. Add signature lines at the end
6. Keep it concise but comprehensive
7. Make it ready to use (no placeholders except for signatures/dates)

Generate the complete document now:`;

        // Call Gemini API
        const apiKey = process.env.GEMINI_API_KEY;
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: fullPrompt }] }],
                    generationConfig: {
                        temperature: 0.3, // Lower for more formal/consistent output
                        maxOutputTokens: 2000,
                        topP: 0.8,
                        topK: 40
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to generate document content');
        }

        const data = await response.json();
        const content = data.candidates[0]?.content?.parts[0]?.text;

        if (!content) {
            throw new Error('No content generated');
        }

        return {
            content,
            template: template.name,
            generatedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Document generation error:', error);
        throw error;
    }
};

// Generate PDF from content
const generatePDF = async (content, metadata) => {
    return new Promise((resolve, reject) => {
        try {
            const uploadsDir = path.join(__dirname, '../uploads/documents');

            // Create uploads directory if it doesn't exist
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const filename = `document_${Date.now()}.pdf`;
            const filepath = path.join(uploadsDir, filename);

            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 60, right: 60 }
            });

            const stream = fs.createWriteStream(filepath);
            doc.pipe(stream);

            // Header
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .text(metadata.template, { align: 'center' })
                .moveDown(0.5);

            doc.fontSize(10)
                .font('Helvetica')
                .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' })
                .moveDown(2);

            // Content
            doc.fontSize(11)
                .font('Helvetica')
                .text(content, {
                    align: 'justify',
                    lineGap: 5
                });

            // Footer
            doc.moveDown(2);
            doc.fontSize(9)
                .font('Helvetica-Oblique')
                .fillColor('#666666')
                .text('This document was generated using AI and should be reviewed by a legal professional before use.', {
                    align: 'center'
                });

            doc.end();

            stream.on('finish', () => {
                resolve({
                    filename,
                    filepath,
                    url: `/uploads/documents/${filename}`
                });
            });

            stream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
};

// Main API endpoint - Generate Document
const GenerateDocument = async (req, res) => {
    try {
        const { templateType, details, format = 'pdf' } = req.body;

        // Validation
        if (!templateType || !details) {
            return res.status(400).json({
                success: false,
                error: 'Template type and details are required'
            });
        }

        if (!DOCUMENT_TEMPLATES[templateType]) {
            return res.status(400).json({
                success: false,
                error: 'Invalid template type',
                availableTemplates: Object.keys(DOCUMENT_TEMPLATES)
            });
        }

        console.log(`📄 Generating ${templateType} document...`);

        // Generate content using Gemini
        const { content, template, generatedAt } = await generateDocumentContent(
            templateType,
            details
        );

        let result = {
            success: true,
            template,
            content,
            generatedAt,
            format: 'text'
        };

        // Generate PDF if requested
        if (format === 'pdf') {
            const pdfInfo = await generatePDF(content, { template });
            result = {
                ...result,
                format: 'pdf',
                filename: pdfInfo.filename,
                downloadUrl: pdfInfo.url,
                filepath: pdfInfo.filepath
            };
        }

        console.log('✅ Document generated successfully');

        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Document generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate document',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get available templates
const GetDocumentTemplates = async (req, res) => {
    try {
        const templates = Object.entries(DOCUMENT_TEMPLATES).map(([key, value]) => ({
            id: key,
            name: value.name,
            description: value.description
        }));

        res.status(200).json({
            success: true,
            templates,
            count: templates.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Preview document (text only, no PDF)
const PreviewDocument = async (req, res) => {
    try {
        const { templateType, details } = req.body;

        if (!templateType || !details) {
            return res.status(400).json({
                success: false,
                error: 'Template type and details are required'
            });
        }

        const { content, template } = await generateDocumentContent(
            templateType,
            details
        );

        res.status(200).json({
            success: true,
            preview: content,
            template,
            note: 'This is a preview. Generate full document to get PDF.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = {
    GenerateDocument,
    GetDocumentTemplates,
    PreviewDocument,
    DOCUMENT_TEMPLATES
};