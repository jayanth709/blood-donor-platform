const mongoose = require('mongoose');

const donationHistorySchema = new mongoose.Schema(
  {
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
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    hospitalProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HospitalProfile',
      required: true
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyRequest',
      required: true
    },
    bloodGroup: {
      type: String,
      required: true
    },
    unitsDonated: {
      type: Number,
      default: 1,
      min: 1
    },
    donatedAt: {
      type: Date,
      default: Date.now
    },
    remarks: {
      type: String,
      default: 'Emergency fulfillment donation verified by hospital'
    }
  },
  {
    timestamps: true
  }
);

const DonationHistory = mongoose.model('DonationHistory', donationHistorySchema);
module.exports = DonationHistory;
