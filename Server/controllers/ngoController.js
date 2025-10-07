const NGO = require('../Models/NgoModel');
const cloudinary = require('../config/cloudinary');

// Create NGO with image upload
const CreateNGO = async (req, res) => {
    try {
        const ngoData = { ...req.body };

        // Handle logo upload
        if (req.files && req.files.logo) {
            ngoData.logo = req.files.logo[0].path;
        }

        // Handle multiple images upload
        if (req.files && req.files.images) {
            ngoData.images = req.files.images.map(file => file.path);
        }

        const ngo = new NGO(ngoData);
        await ngo.save();
        res.status(201).json({ message: "success", data: ngo });
    } catch (e) {
        res.status(500).json({ message: "error", error: e.message });
    }
};

// Find all NGOs with search + pagination + sort
const FindAllNgo = async (req, res) => {
    try {
        const { searchText = '', page = 1, size = 10, category = '' } = req.query;

        let filter = {};

        // Add search filter
        if (searchText) {
            filter.name = { $regex: searchText, $options: "i" };
        }

        // Add category filter
        if (category) {
            filter.category = category;
        }

        // Add active status filter
        filter.status = 'active';

        const ngos = await NGO.find(filter)
            .sort({ rating: -1, createdAt: -1 })
            .skip((page - 1) * size)
            .limit(parseInt(size));

        const count = await NGO.countDocuments(filter);
        const totalPages = Math.ceil(count / size);

        res.status(200).json({
            message: "list",
            data: ngos,
            pagination: {
                count,
                currentPage: parseInt(page),
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        });
    } catch (e) {
        res.status(500).json({ message: "error", error: e.message });
    }
};

// Find NGO by ID
const FindNgoById = async (req, res) => {
    try {
        const selectedNgo = await NGO.findById(req.params.id);
        if (selectedNgo) {
            return res.status(200).json({ message: "success", data: selectedNgo });
        }
        res.status(404).json({ message: "not found" });
    } catch (e) {
        res.status(500).json({ message: "error", error: e.message });
    }
};

// Update NGO profile (without images)
const UpdateNgo = async (req, res) => {
    try {
        const updateData = { ...req.body };
        const existingNgo = await NGO.findById(req.params.id);

        if (!existingNgo) {
            return res.status(404).json({ message: "not found" });
        }

        // Remove image fields from update data to prevent accidental updates
        delete updateData.logo;
        delete updateData.images;

        const updatedNgo = await NGO.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: "success", data: updatedNgo });
    } catch (e) {
        res.status(500).json({ message: "error", error: e.message });
    }
};

// Upload/Update NGO Logo
const UploadNgoLogo = async (req, res) => {
    try {
        const existingNgo = await NGO.findById(req.params.id);

        if (!existingNgo) {
            return res.status(404).json({ message: "not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "error", error: "No logo file provided" });
        }

        // Delete old logo from cloudinary if exists
        if (existingNgo.logo && existingNgo.logo.includes('cloudinary')) {
            try {
                const publicId = existingNgo.logo.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
                console.log('Deleted old logo from Cloudinary');
            } catch (error) {
                console.error('Error deleting old logo:', error);
            }
        }

        // Update with new logo
        const updatedNgo = await NGO.findByIdAndUpdate(
            req.params.id,
            { logo: req.file.path },
            { new: true }
        );

        res.status(200).json({
            message: "logo updated successfully",
            data: updatedNgo
        });
    } catch (e) {
        console.error('Upload logo error:', e);
        res.status(500).json({ message: "error", error: e.message });
    }
};

// Upload/Add NGO Images
const UploadNgoImages = async (req, res) => {
    try {
        const existingNgo = await NGO.findById(req.params.id);

        if (!existingNgo) {
            return res.status(404).json({ message: "not found" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "error", error: "No image files provided" });
        }

        // Get new image paths
        const newImages = req.files.map(file => file.path);

        // Add new images to existing images array
        const updatedImages = [...(existingNgo.images || []), ...newImages];

        const updatedNgo = await NGO.findByIdAndUpdate(
            req.params.id,
            { images: updatedImages },
            { new: true }
        );

        res.status(200).json({
            message: "images uploaded successfully",
            data: updatedNgo,
            uploadedCount: newImages.length
        });
    } catch (e) {
        console.error('Upload images error:', e);
        res.status(500).json({ message: "error", error: e.message });
    }
};

// Delete specific NGO image by URL
const DeleteNgoImage = async (req, res) => {
    try {
        const { imageUrl } = req.body;
        const existingNgo = await NGO.findById(req.params.id);

        if (!existingNgo) {
            return res.status(404).json({ message: "not found" });
        }

        if (!imageUrl) {
            return res.status(400).json({ message: "error", error: "Image URL is required" });
        }

        // Check if image exists in NGO images array
        const imageIndex = existingNgo.images.indexOf(imageUrl);
        if (imageIndex === -1) {
            return res.status(404).json({ message: "error", error: "Image not found in NGO profile" });
        }

        // Delete from cloudinary if it's a cloudinary URL
        if (imageUrl.includes('cloudinary')) {
            try {
                const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
                console.log('Deleted image from Cloudinary:', publicId);
            } catch (error) {
                console.error('Error deleting from Cloudinary:', error);
            }
        }

        // Remove image from array
        existingNgo.images.splice(imageIndex, 1);
        await existingNgo.save();

        res.status(200).json({
            message: "image deleted successfully",
            data: existingNgo
        });
    } catch (e) {
        console.error('Delete image error:', e);
        res.status(500).json({ message: "error", error: e.message });
    }
};

// Delete all NGO images
const DeleteAllNgoImages = async (req, res) => {
    try {
        const existingNgo = await NGO.findById(req.params.id);

        if (!existingNgo) {
            return res.status(404).json({ message: "not found" });
        }

        if (!existingNgo.images || existingNgo.images.length === 0) {
            return res.status(400).json({ message: "error", error: "No images to delete" });
        }

        // Delete all images from cloudinary
        for (const imageUrl of existingNgo.images) {
            if (imageUrl.includes('cloudinary')) {
                try {
                    const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                    console.log('Deleted image from Cloudinary');
                } catch (error) {
                    console.error('Error deleting image:', error);
                }
            }
        }

        // Clear images array
        existingNgo.images = [];
        await existingNgo.save();

        res.status(200).json({
            message: "all images deleted successfully",
            data: existingNgo
        });
    } catch (e) {
        console.error('Delete all images error:', e);
        res.status(500).json({ message: "error", error: e.message });
    }
};

// Delete NGO with image cleanup
const DeleteNgo = async (req, res) => {
    try {
        const deletedNgo = await NGO.findByIdAndDelete(req.params.id);

        if (deletedNgo) {
            // Clean up logo from cloudinary
            if (deletedNgo.logo && deletedNgo.logo.includes('cloudinary')) {
                try {
                    const logoPublicId = deletedNgo.logo.split('/').slice(-2).join('/').split('.')[0];
                    await cloudinary.uploader.destroy(logoPublicId);
                } catch (error) {
                    console.error('Error deleting logo:', error);
                }
            }

            // Clean up images from cloudinary
            if (deletedNgo.images && deletedNgo.images.length > 0) {
                for (const imageUrl of deletedNgo.images) {
                    if (imageUrl.includes('cloudinary')) {
                        try {
                            const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
                            await cloudinary.uploader.destroy(publicId);
                        } catch (error) {
                            console.error('Error deleting image:', error);
                        }
                    }
                }
            }

            return res.status(200).json({ message: "deleted", data: deletedNgo });
        }
        res.status(404).json({ message: "not found" });
    } catch (e) {
        res.status(500).json({ message: "error", error: e.message });
    }
};

// Get Top Rated NGOs
const TopRatings = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const top = await NGO.find({ status: 'active' })
            .sort({ rating: -1 })
            .limit(parseInt(limit));
        res.status(200).json({ message: "top", data: top });
    } catch (e) {
        res.status(500).json({ message: "error", error: e.message });
    }
};

// Get NGOs by Category
const GetNgoByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 10 } = req.query;

        const ngos = await NGO.find({
            category: category,
            status: 'active'
        })
            .sort({ rating: -1 })
            .limit(parseInt(limit));

        res.status(200).json({ message: "success", data: ngos });
    } catch (e) {
        res.status(500).json({ message: "error", error: e.message });
    }
};

// Update NGO Status
const UpdateNgoStatus = async (req, res) => {
    try {
        console.log('UpdateNgoStatus called');
        console.log('NGO ID:', req.params.id);
        console.log('Request body:', req.body);
        
        const { status } = req.body;
        
        if (!status) {
            console.log('No status provided in request body');
            return res.status(400).json({ message: "error", error: "Status is required" });
        }
        
        console.log(`Updating NGO ${req.params.id} to status: ${status}`);
        
        const updatedNgo = await NGO.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        console.log('Update result:', updatedNgo ? 'Success' : 'Not found');
        
        if (updatedNgo) {
            console.log('NGO updated successfully:', {
                id: updatedNgo._id,
                name: updatedNgo.name,
                newStatus: updatedNgo.status
            });
            return res.status(200).json({ message: "status updated", data: updatedNgo });
        }
        console.log('NGO not found with ID:', req.params.id);
        res.status(404).json({ message: "not found" });
    } catch (e) {
        console.error('Error in UpdateNgoStatus:', e);
        res.status(500).json({ message: "error", error: e.message });
    }
};

const FindNgoByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        const ngo = await NGO.findOne({ email: email });

        if (ngo) {
            return res.status(200).json({ message: "success", data: ngo });
        }

        res.status(404).json({ message: "not found" });
    } catch (e) {
        res.status(500).json({ message: "error", error: e.message });
    }
};

module.exports = {
    CreateNGO,
    FindAllNgo,
    FindNgoById,
    UpdateNgo,
    DeleteNgo,
    TopRatings,
    GetNgoByCategory,
    UpdateNgoStatus,
    FindNgoByEmail,
    // New image management functions
    UploadNgoLogo,
    UploadNgoImages,
    DeleteNgoImage,
    DeleteAllNgoImages
};