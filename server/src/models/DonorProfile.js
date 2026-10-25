const mongoose = require('mongoose');
const { BLOOD_GROUPS, ELIGIBILITY_RULES } = require('../config/constants');

const donorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: [true, 'Blood group is required'],
      index: true
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [35, 'Weight must be at least 35 kg']
    },
    hasChronicIllness: {
      type: Boolean,
      default: false
    },
    chronicIllnessDetails: {
      type: String,
      default: ''
    },
    lastDonationDate: {
      type: Date,
      default: null
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
    totalDonations: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Keep city and pincode in sync with address subdocument before saving
donorProfileSchema.pre('save', function (next) {
  if (this.address) {
    if (this.address.city) this.city = this.address.city.toLowerCase().trim();
    if (this.address.pincode) this.pincode = this.address.pincode.trim();
  }
  next();
});

// Virtual for calculating age
donorProfileSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Helper method to compute eligibility status and reasons
donorProfileSchema.methods.checkEligibility = function () {
  const reasons = [];
  const age = this.age;

  if (age === null || age < ELIGIBILITY_RULES.MIN_AGE || age > ELIGIBILITY_RULES.MAX_AGE) {
    reasons.push(`Age must be between ${ELIGIBILITY_RULES.MIN_AGE} and ${ELIGIBILITY_RULES.MAX_AGE} (current age: ${age})`);
  }

  if (this.weight < ELIGIBILITY_RULES.MIN_WEIGHT_KG) {
    reasons.push(`Weight must be at least ${ELIGIBILITY_RULES.MIN_WEIGHT_KG} kg (current: ${this.weight} kg)`);
  }

  if (this.hasChronicIllness) {
    reasons.push('Chronic health conditions report ineligibility');
  }

  if (this.lastDonationDate) {
    const daysSince = Math.floor((Date.now() - new Date(this.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < ELIGIBILITY_RULES.DONATION_INTERVAL_DAYS) {
      reasons.push(`At least ${ELIGIBILITY_RULES.DONATION_INTERVAL_DAYS} days required between donations (${daysSince} days passed)`);
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons
  };
};

const DonorProfile = mongoose.model('DonorProfile', donorProfileSchema);
module.exports = DonorProfile;
