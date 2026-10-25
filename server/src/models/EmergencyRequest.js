const mongoose = require('mongoose');
const { BLOOD_GROUPS, URGENCY_LEVELS, REQUEST_STATUS } = require('../config/constants');

const emergencyRequestSchema = new mongoose.Schema(
  {
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
    patientBloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: [true, 'Patient blood group is required'],
      index: true
    },
    requiredUnits: {
      type: Number,
      required: [true, 'Required blood units count is required'],
      min: [1, 'At least 1 unit must be requested']
    },
    fulfilledUnits: {
      type: Number,
      default: 0
    },
    urgency: {
      type: String,
      enum: Object.values(URGENCY_LEVELS),
      default: URGENCY_LEVELS.HIGH,
      index: true
    },
    patientCaseDetails: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      address: { type: String, trim: true, default: '' },
      area: { type: String, trim: true, required: [true, 'Area is required'] },
      city: { type: String, trim: true, required: [true, 'City is required'] },
      pincode: { type: String, trim: true, required: [true, 'Pincode is required'] }
    },
    city: {
      type: String,
      lowercase: true,
      trim: true,
      index: true
    },
    pincode: {
      type: String,
      trim: true,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(REQUEST_STATUS),
      default: REQUEST_STATUS.OPEN,
      index: true
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

emergencyRequestSchema.pre('save', function (next) {
  if (this.location) {
    if (this.location.city) this.city = this.location.city.toLowerCase().trim();
    if (this.location.pincode) this.pincode = this.location.pincode.trim();
  }
  next();
});

const EmergencyRequest = mongoose.model('EmergencyRequest', emergencyRequestSchema);
module.exports = EmergencyRequest;
