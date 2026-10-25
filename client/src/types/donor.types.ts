import { User } from './auth.types';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface LocationAddress {
  street?: string;
  area: string;
  city: string;
  pincode: string;
}

export interface DonorProfile {
  _id: string;
  user: User;
  bloodGroup: BloodGroup;
  isAvailable: boolean;
  dateOfBirth: string;
  weight: number;
  hasChronicIllness: boolean;
  chronicIllnessDetails?: string;
  lastDonationDate?: string | null;
  address: LocationAddress;
  city: string;
  pincode: string;
  totalDonations: number;
  age?: number;
}

export interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
}

export interface DonorEmergencyAlert {
  request: {
    _id: string;
    patientBloodGroup: BloodGroup;
    requiredUnits: number;
    fulfilledUnits: number;
    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    patientCaseDetails?: string;
    location: LocationAddress;
    status: 'OPEN' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED';
    createdAt: string;
    hospital: {
      name: string;
      phone: string;
    };
    hospitalProfile?: {
      hospitalName: string;
      emergencyPhone: string;
      contactPerson: string;
      address: LocationAddress;
    };
  };
  proximity: {
    score: number;
    tier: string;
    reason: string;
  };
  myResponse?: {
    _id: string;
    status: 'ACCEPTED' | 'REJECTED';
    responseNotes?: string;
    isDonationCompleted: boolean;
    respondedAt: string;
  } | null;
}

export interface DonationHistoryItem {
  _id: string;
  bloodGroup: BloodGroup;
  unitsDonated: number;
  donatedAt: string;
  remarks: string;
  hospital?: {
    name: string;
  };
  hospitalProfile?: {
    hospitalName: string;
    emergencyPhone: string;
    address: LocationAddress;
  };
}
