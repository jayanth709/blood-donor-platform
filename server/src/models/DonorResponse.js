const mongoose = require('mongoose');
const { RESPONSE_STATUS } = require('../config/constants');

const donorResponseSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyRequest',
      required: true,
      index: true
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    donorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DonorProfile',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(RESPONSE_STATUS),
      required: true
    },
    responseNotes: {
      type: String,
      trim: true,
      default: ''
    },
    isDonationCompleted: {
      type: Boolean,
      default: false
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index so a donor responds only once per emergency request
donorResponseSchema.index({ request: 1, donor: 1 }, { unique: true });

const DonorResponse = mongoose.model('DonorResponse', donorResponseSchema);
module.exports = DonorResponse;
