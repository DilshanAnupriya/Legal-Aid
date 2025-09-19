const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// NGO Logo upload configuration (existing)
const ngoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'ngo_logos',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' }, // Resize large images
            { quality: 'auto' } // Auto optimize quality
        ]
    }
});

const ngoUpload = multer({
    storage: ngoStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 11 // Maximum 11 files (1 logo + 10 images)
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Document upload configuration (new)
const documentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userUploadsDir = path.join(uploadsDir, 'documents');
        if (!fs.existsSync(userUploadsDir)) {
            fs.mkdirSync(userUploadsDir, { recursive: true });
        }
        cb(null, userUploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `doc_${uniqueSuffix}${ext}`);
    }
});

const documentUpload = multer({
    storage: documentStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for documents
        files: 1 // Only one document at a time
    },
    fileFilter: (req, file, cb) => {
        // Allowed MIME types for documents
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/webp',
            'image/tiff',
            'image/bmp',
            'application/pdf'
        ];

        // Check file type
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, WEBP, TIFF, BMP) and PDF files are allowed!'), false);
        }
    }
});

// Post/general image upload configuration 
const postImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'post_images',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' }
        ]
    }
});

const postImageUpload = multer({
    storage: postImageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // Maximum 5 images per post
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size allowed is 10MB for documents and 5MB for images.'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Too many files uploaded.'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Unexpected file field.'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: `Upload error: ${error.message}`
                });
        }
    }
    
    if (error.message) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
};

module.exports = {
    // Legacy export for backward compatibility
    upload: ngoUpload,
    
    // Specific upload configurations
    ngoUpload,
    documentUpload,
    postImageUpload,
    
    // Error handling
    handleMulterError,
    
    // Utility functions
    getUploadsDir: () => uploadsDir,
    
    // Cleanup function for old files
    cleanupOldFiles: async (maxAgeInDays = 30) => {
        const documentsDir = path.join(uploadsDir, 'documents');
        if (!fs.existsSync(documentsDir)) return;
        
        const files = await fs.promises.readdir(documentsDir);
        const now = Date.now();
        const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000; // Convert to milliseconds
        
        for (const file of files) {
            const filePath = path.join(documentsDir, file);
            const stats = await fs.promises.stat(filePath);
            
            if (now - stats.mtime.getTime() > maxAge) {
                try {
                    await fs.promises.unlink(filePath);
                    console.log(`Cleaned up old file: ${file}`);
                } catch (error) {
                    console.error(`Error cleaning up file ${file}:`, error);
                }
            }
        }
    }
};