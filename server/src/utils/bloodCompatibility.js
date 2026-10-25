/**
 * Blood Group Compatibility Table
 * Key = Recipient blood group
 * Value = Array of blood groups that can donate TO the recipient
 */
const COMPATIBLE_DONORS = {
  'A+':  ['A+', 'A-', 'O+', 'O-'],
  'A-':  ['A-', 'O-'],
  'B+':  ['B+', 'B-', 'O+', 'O-'],
  'B-':  ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+':  ['O+', 'O-'],
  'O-':  ['O-']
};

/**
 * Returns true if a donor with donorGroup can donate to
 * a patient with recipientGroup.
 */
const isCompatible = (donorGroup, recipientGroup) => {
  const compatible = COMPATIBLE_DONORS[recipientGroup];
  return compatible ? compatible.includes(donorGroup) : false;
};

/**
 * Get all compatible blood groups that can donate to a recipient
 */
const getCompatibleDonorGroups = (recipientGroup) => {
  return COMPATIBLE_DONORS[recipientGroup] || [];
};

/**
 * Project-defined eligibility check (no AI — rule-based only)
 * Final medical clearance is always at the hospital.
 */
const checkEligibility = (donor) => {
  const reasons = [];

  // Age check
  const dob = new Date(donor.date_of_birth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;

  if (age < 18) {
    reasons.push(`Donor must be at least 18 years old (current age: ${age})`);
  } else if (age > 65) {
    reasons.push(`Donor must be under 65 years old (current age: ${age})`);
  }

  // Weight check
  if (donor.weight < 50) {
    reasons.push(`Minimum weight is 50 kg for safe donation (current: ${donor.weight} kg)`);
  }

  // Chronic illness
  if (donor.has_chronic_illness) {
    reasons.push('Disclosed chronic illness requires prior clinical clearance');
  }

  // Last donation — 90 day gap required
  if (donor.last_donation_date) {
    const lastDate = new Date(donor.last_donation_date);
    const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 90) {
      reasons.push(`Minimum 90 days required between donations (${diffDays} days elapsed)`);
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons
  };
};

module.exports = { isCompatible, getCompatibleDonorGroups, checkEligibility, COMPATIBLE_DONORS };
