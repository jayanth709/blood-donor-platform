import { BloodGroup } from '../types';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Recipient -> Array of compatible Donor blood groups
export const RECIPIENT_DONOR_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
};

// Check if donor blood group can donate to recipient
export const isCompatible = (donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean => {
  return RECIPIENT_DONOR_COMPATIBILITY[recipientGroup]?.includes(donorGroup) || false;
};

// Return project-defined eligibility check (Disclaim: final medical screening performed by hospital)
export interface EligibilityCheckResult {
  isEligible: boolean;
  reasons: string[];
}

export const checkDonorEligibility = (
  weight: number,
  birthDateString: string,
  hasChronicIllness: boolean,
  lastDonationDate?: string | null
): EligibilityCheckResult => {
  const reasons: string[] = [];

  // Age calculation
  const birthDate = new Date(birthDateString);
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    reasons.push('Donor must be at least 18 years old (current: ' + age + ')');
  } else if (age > 65) {
    reasons.push('Donor must be under 65 years old for voluntary emergency donation (current: ' + age + ')');
  }

  if (weight < 50) {
    reasons.push('Weight must be at least 50 kg for safe blood donation (current: ' + weight + ' kg)');
  }

  if (hasChronicIllness) {
    reasons.push('Disclosed chronic illness requires prior clinical clearance');
  }

  if (lastDonationDate) {
    const lastDate = new Date(lastDonationDate);
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 90) {
      reasons.push(`Minimum 90 days required between whole blood donations (${diffDays} days elapsed)`);
    }
  }

  return {
    isEligible: reasons.length === 0,
    reasons
  };
};
