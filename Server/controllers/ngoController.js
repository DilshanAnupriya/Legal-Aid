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

// Update NGO with image handling
const UpdateNgo = async (req, res) => {
    try {
        const updateData = { ...req.body };
        const existingNgo = await NGO.findById(req.params.id);

        if (!existingNgo) {
            return res.status(404).json({ message: "not found" });
        }

        // Handle logo update
        if (req.files && req.files.logo) {
            // Delete old logo from cloudinary if exists
            if (existingNgo.logo) {
                const publicId = existingNgo.logo.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`ngo_logos/${publicId}`);
            }
            updateData.logo = req.files.logo[0].path;
        }

        // Handle images update
        if (req.files && req.files.images) {
            // Delete old images from cloudinary if exists
            if (existingNgo.images && existingNgo.images.length > 0) {
                for (const imageUrl of existingNgo.images) {
                    const publicId = imageUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`ngo_logos/${publicId}`);
                }
            }
            updateData.images = req.files.images.map(file => file.path);
        }

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

// Delete NGO with image cleanup
const DeleteNgo = async (req, res) => {
    try {
        const deletedNgo = await NGO.findByIdAndDelete(req.params.id);

        if (deletedNgo) {
            // Clean up images from cloudinary
            if (deletedNgo.logo) {
                const logoPublicId = deletedNgo.logo.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`ngo_logos/${logoPublicId}`);
            }

            if (deletedNgo.images && deletedNgo.images.length > 0) {
                for (const imageUrl of deletedNgo.images) {
                    const publicId = imageUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`ngo_logos/${publicId}`);
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
        const { status } = req.body;
        const updatedNgo = await NGO.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (updatedNgo) {
            return res.status(200).json({ message: "status updated", data: updatedNgo });
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
    UpdateNgoStatus
};