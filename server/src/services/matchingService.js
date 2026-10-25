const DonorProfile = require('../models/DonorProfile');
const { getCompatibleDonorGroups, isCompatible } = require('../utils/bloodMatrix');
const { ELIGIBILITY_RULES } = require('../config/constants');

/**
 * Calculate location proximity score between an emergency request location and a donor location
 * @param {Object} reqLocation { address, area, city, pincode }
 * @param {Object} donorLocation { address, area, city, pincode }
 * @returns {{ score: number, tier: string, reason: string }}
 */
const calculateLocationScore = (reqLocation = {}, donorLocation = {}) => {
  const reqPincode = (reqLocation.pincode || '').trim();
  const donorPincode = (donorLocation.pincode || '').trim();

  const reqArea = (reqLocation.area || '').toLowerCase().trim();
  const donorArea = (donorLocation.area || '').toLowerCase().trim();

  const reqCity = (reqLocation.city || '').toLowerCase().trim();
  const donorCity = (donorLocation.city || '').toLowerCase().trim();

  // Tier 1: Exact Pincode match
  if (reqPincode && donorPincode && reqPincode === donorPincode) {
    return {
      score: 100,
      tier: 'EXACT_PINCODE',
      reason: `Immediate vicinity - Matching Pincode (${reqPincode})`
    };
  }

  // Tier 2: Same Area & Same City
  if (reqCity && donorCity && reqCity === donorCity && reqArea && donorArea && reqArea === donorArea) {
    return {
      score: 70,
      tier: 'SAME_AREA',
      reason: `Neighborhood match - Same Area (${reqLocation.area}) in ${reqLocation.city}`
    };
  }

  // Tier 3: Same City
  if (reqCity && donorCity && reqCity === donorCity) {
    return {
      score: 40,
      tier: 'SAME_CITY',
      reason: `City-wide match - Located in ${reqLocation.city}`
    };
  }

  // Non-matching city
  return {
    score: 10,
    tier: 'OUTSIDE_CITY',
    reason: `Outside city (${donorLocation.city || 'Unknown'})`
  };
};

/**
 * Evaluates whether a donor profile satisfies strict health and donation interval eligibility
 * @param {Object} profile 
 * @returns {{ isEligible: boolean, reasons: string[] }}
 */
const evaluateEligibility = (profile) => {
  const reasons = [];

  // Age evaluation
  if (!profile.dateOfBirth) {
    reasons.push('Date of birth not recorded');
  } else {
    const today = new Date();
    const dob = new Date(profile.dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < ELIGIBILITY_RULES.MIN_AGE || age > ELIGIBILITY_RULES.MAX_AGE) {
      reasons.push(`Age ${age} is outside the eligible range (${ELIGIBILITY_RULES.MIN_AGE}-${ELIGIBILITY_RULES.MAX_AGE})`);
    }
  }

  // Weight evaluation
  if (!profile.weight || profile.weight < ELIGIBILITY_RULES.MIN_WEIGHT_KG) {
    reasons.push(`Weight (${profile.weight || 0} kg) is below minimum required (${ELIGIBILITY_RULES.MIN_WEIGHT_KG} kg)`);
  }

  // Chronic illness evaluation
  if (profile.hasChronicIllness) {
    reasons.push('Excluded due to chronic health condition');
  }

  // Donation interval evaluation
  if (profile.lastDonationDate) {
    const msSince = Date.now() - new Date(profile.lastDonationDate).getTime();
    const daysSince = Math.floor(msSince / (1000 * 60 * 60 * 24));
    if (daysSince < ELIGIBILITY_RULES.DONATION_INTERVAL_DAYS) {
      reasons.push(`Only ${daysSince} days passed since last donation (minimum ${ELIGIBILITY_RULES.DONATION_INTERVAL_DAYS} days required)`);
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons
  };
};

/**
 * Finds all eligible, available, compatible and ranked donors for an emergency request
 * @param {Object} emergencyRequest 
 * @returns {Promise<Array>} Sorted array of matched donors
 */
const findSuitableDonorsForRequest = async (emergencyRequest) => {
  const { patientBloodGroup, location: reqLocation } = emergencyRequest;
  const compatibleBloodGroups = getCompatibleDonorGroups(patientBloodGroup);

  // 1. Query registered donors who have compatible blood group, are available, and whose user account is active
  const donorProfiles = await DonorProfile.find({
    bloodGroup: { $in: compatibleBloodGroups },
    isAvailable: true
  }).populate({
    path: 'user',
    select: 'name email phone isActive createdAt'
  });

  const matchedDonors = [];

  for (const profile of donorProfiles) {
    // Check if user account exists and is active
    if (!profile.user || !profile.user.isActive) {
      continue;
    }

    // 2. Check health eligibility
    const eligibilityResult = evaluateEligibility(profile);
    if (!eligibilityResult.isEligible) {
      continue;
    }

    // 3. Location proximity scoring
    const locationScore = calculateLocationScore(reqLocation, profile.address);

    matchedDonors.push({
      donorId: profile.user._id,
      profileId: profile._id,
      name: profile.user.name,
      email: profile.user.email,
      phone: profile.user.phone,
      bloodGroup: profile.bloodGroup,
      totalDonations: profile.totalDonations,
      weight: profile.weight,
      age: profile.age,
      address: profile.address,
      matchScore: locationScore.score,
      matchTier: locationScore.tier,
      matchReason: locationScore.reason,
      compatibleWith: patientBloodGroup
    });
  }

  // Sort by highest match score first, then by totalDonations descending
  matchedDonors.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return b.totalDonations - a.totalDonations;
  });

  return matchedDonors;
};

module.exports = {
  calculateLocationScore,
  evaluateEligibility,
  findSuitableDonorsForRequest
};
