import { BloodGroup, LocationAddress } from './donor.types';
import { User } from './auth.types';

export interface HospitalProfile {
  _id: string;
  user: User;
  hospitalName: string;
  licenseNumber: string;
  contactPerson: string;
  emergencyPhone: string;
  address: LocationAddress;
  city: string;
  pincode: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface MatchedDonor {
  donorId: string;
  profileId: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  totalDonations: number;
  weight: number;
  age: number;
  address: LocationAddress;
  matchScore: number;
  matchTier: string;
  matchReason: string;
  compatibleWith: BloodGroup;
}

export interface EmergencyRequestDetail {
  _id: string;
  hospital: string;
  hospitalProfile: HospitalProfile;
  patientBloodGroup: BloodGroup;
  requiredUnits: number;
  fulfilledUnits: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  patientCaseDetails?: string;
  location: LocationAddress;
  status: 'OPEN' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED';
  expiresAt?: string;
  createdAt: string;
  acceptedResponsesCount?: number;
  rejectedResponsesCount?: number;
  totalResponsesCount?: number;
}

export interface DonorResponseDetail {
  _id: string;
  request: string;
  donor: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  donorProfile: {
    _id: string;
    bloodGroup: BloodGroup;
    weight: number;
    totalDonations: number;
    address: LocationAddress;
  };
  status: 'ACCEPTED' | 'REJECTED';
  responseNotes?: string;
  isDonationCompleted: boolean;
  respondedAt: string;
}
