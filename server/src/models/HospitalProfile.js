const mongoose = require('mongoose');

const hospitalProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      index: true
    },
    licenseNumber: {
      type: String,
      required: [true, 'License or Registration number is required'],
      trim: true,
      unique: true
    },
    contactPerson: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true
    },
    emergencyPhone: {
      type: String,
      required: [true, 'Emergency contact phone number is required'],
      trim: true
    },
    address: {
      street: { type: String, trim: true, default: '' },
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
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'verified',
      index: true
    }
  },
  {
    timestamps: true
  }
);

hospitalProfileSchema.pre('save', function (next) {
  if (this.address) {
    if (this.address.city) this.city = this.address.city.toLowerCase().trim();
    if (this.address.pincode) this.pincode = this.address.pincode.trim();
  }
  next();
});

const HospitalProfile = mongoose.model('HospitalProfile', hospitalProfileSchema);
module.exports = HospitalProfile;
