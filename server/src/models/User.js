const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "HOSPITAL_ADMIN",
        "REFERRAL_COORDINATOR",
        "DOCTOR",
      ],
      default: "DOCTOR",
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
    },

    verificationStatus: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    profilePhoto: {
      type: String,
      default: null,
    },

    notificationPreferences: {
      referralAccepted: {
        type: Boolean,
        default: true,
      },
      doctorAssigned: {
        type: Boolean,
        default: true,
      },
      bedReserved: {
        type: Boolean,
        default: true,
      },
      reservationExpired: {
        type: Boolean,
        default: true,
      },
    },

    documents: {
      licenseNumber: {
        type: String,
      },

      hospitalRegistrationNumber: {
        type: String,
      },

      employeeId: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);
