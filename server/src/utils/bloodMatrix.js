/**
 * Clinical Blood Compatibility Matrix (Recipient <- Donor)
 * Maps each recipient blood group to the array of donor blood groups they can safely receive from.
 */
const RECIPIENT_DONOR_COMPATIBILITY = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
};

/**
 * Check if a donor blood group is compatible with a recipient blood group
 * @param {string} donorGroup 
 * @param {string} recipientGroup 
 * @returns {boolean}
 */
const isCompatible = (donorGroup, recipientGroup) => {
  if (!donorGroup || !recipientGroup) return false;
  const compatibleDonors = RECIPIENT_DONOR_COMPATIBILITY[recipientGroup];
  if (!compatibleDonors) return false;
  return compatibleDonors.includes(donorGroup);
};

/**
 * Get all donor blood groups compatible with the given recipient blood group
 * @param {string} recipientGroup 
 * @returns {string[]}
 */
const getCompatibleDonorGroups = (recipientGroup) => {
  return RECIPIENT_DONOR_COMPATIBILITY[recipientGroup] || [];
};

module.exports = {
  RECIPIENT_DONOR_COMPATIBILITY,
  isCompatible,
  getCompatibleDonorGroups
};
