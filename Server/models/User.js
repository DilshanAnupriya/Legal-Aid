const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: ["user", "lawyer", "ngo", "admin"],
      default: "user",
      trim: true,
    },
    // Common profile fields
    birthday: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      trim: true,
    },
    genderSpectrum: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      enum: ["Male", "Female", "Non-binary", "Prefer not to say", "Other"],
      trim: true,
    },

    // Lawyer-specific fields
    firstName: {
      type: String,
      required: function () {
        return this.role === "lawyer";
      },
      trim: true,
    },
    lastName: {
      type: String,
      required: function () {
        return this.role === "lawyer";
      },
      trim: true,
    },
    specialization: {
      type: String,
      required: function () {
        return this.role === "lawyer";
      },
      trim: true,
    },
    contactNumber: {
      type: String,
      required: function () {
        return this.role === "lawyer";
      },
      trim: true,
    },
    lawyerStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: function () {
        return this.role === "lawyer" ? "pending" : undefined;
      },
    },
    totalPoints: {
      type: Number,
      default: 0,
      required: function () {
        return this.role === "lawyer";
      },
    },
    tier: {
      type: String,
      enum: [
        "Community Ally",
        "Legal Helper",
        "Justice Advocate",
        "Legal Mentor",
        "Champion of Justice",
      ],
      default: function () {
        return this.role === "lawyer" ? "Community Ally" : undefined;
      },
      required: function () {
        return this.role === "lawyer";
      },
    },
    reviews: {
      type: [{ rating: Number, comment: String }],
    
      required: function () {
        return this.role === "lawyer";
      },
      default: function () {
        return this.role === "lawyer" ? [] : undefined;
      },
    },
    contributions: {
      type: [
        {
          type: { type: String }, // e.g., 'forum', 'case', 'appointment'
          date: Date,
          points: Number,
        },
      ],
      required: function () {
        return this.role === "lawyer";
      },
      default: function () {
        return this.role === "lawyer" ? [] : undefined;
      },
    },

    
    // NGO-specific fields
    organizationName: {
      type: String,
      required: function () {
        return this.role === "ngo";
      },
      trim: true,
    },
    description: {
      type: String,
      required: function () {
        return this.role === "ngo";
      },
    },
    category: {
      type: String,
      required: function () {
        return this.role === "ngo";
      },
      enum: [
        "Human Rights & Civil Liberties",
        "Women's Rights & Gender Justice",
        "Child Protection",
        "Labor & Employment Rights",
        "Refugee & Migrant Rights",
        "LGBTQ+ Rights",
      ],
    },
    logo: {
      type: String,
      default: null,
    },
    contact: {
      type: String,
      required: function () {
        return this.role === "ngo";
      },
    },
    images: {
      type: Array,
      default: [],
    },

    // Admin-specific fields
    adminName: {
      type: String,
      required: function () {
        return this.role === "admin";
      },
      trim: true,
    },
    permissions: {
      type: [String],
      default: function () {
        if (this.role === "admin") {
          return ["manage_users", "manage_content", "view_analytics"];
        }
        return [];
      },
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output and format role-based data
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;

  // Return role-specific data structure
  const baseData = {
    id: userObject._id,
    email: userObject.email,
    role: userObject.role,
    status: userObject.status,
    createdAt: userObject.createdAt,
    updatedAt: userObject.updatedAt,
  };

  switch (userObject.role) {
    case "user":
      return {
        ...baseData,
        birthday: userObject.birthday,
        genderSpectrum: userObject.genderSpectrum,
      };

    case "lawyer":
      return {
        ...baseData,
        // _id: userObject._id,
        firstName: userObject.firstName,
        lastName: userObject.lastName,
        specialization: userObject.specialization,
        contactNumber: userObject.contactNumber,
        lawyerStatus: userObject.lawyerStatus,
        tier: userObject.tier,
        totalPoints: userObject.totalPoints,
        reviews: userObject.reviews,
        contributions:userObject.contributions,
        rating: userObject.rating 

      };

    case "ngo":
      return {
        ...baseData,
        organizationName: userObject.organizationName,
        description: userObject.description,
        category: userObject.category,
        logo: userObject.logo,
        contact: userObject.contact,
        images: userObject.images,
        rating: userObject.rating,
      };

    case "admin":
      return {
        ...baseData,
        adminName: userObject.adminName,
        permissions: userObject.permissions,
      };

    default:
      return baseData;
  }
};

module.exports = mongoose.model("User", userSchema);
