import { User, UserRole } from './auth.types';

export * from './auth.types';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'NORMAL';

export type RequestStatus = 'OPEN' | 'SEARCHING' | 'RESPONSE_RECEIVED' | 'FULFILLED' | 'CANCELLED';

export type ResponseStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

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
  createdAt?: string;
}

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
  createdAt?: string;
}

export interface EmergencyRequest {
  _id: string;
  hospital: {
    _id: string;
    name: string;
    phone: string;
    licenseNumber?: string;
  };
  hospitalProfile?: {
    hospitalName: string;
    emergencyPhone: string;
    contactPerson: string;
    address: LocationAddress;
  };
  patientBloodGroup: BloodGroup;
  requiredUnits: number;
  fulfilledUnits: number;
  urgency: UrgencyLevel;
  patientCaseDetails?: string;
  location: LocationAddress;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  responsesCount?: {
    pending: number;
    accepted: number;
    rejected: number;
    total: number;
  };
}

export interface DonorResponse {
  _id: string;
  requestId: string;
  request?: EmergencyRequest;
  donorId: string;
  donor: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  donorProfile?: {
    bloodGroup: BloodGroup;
    weight: number;
    address: LocationAddress;
    isAvailable: boolean;
  };
  status: ResponseStatus;
  responseNotes?: string;
  isDonationCompleted: boolean;
  respondedAt: string;
}

export interface DonationHistoryItem {
  _id: string;
  bloodGroup: BloodGroup;
  unitsDonated: number;
  donatedAt: string;
  remarks: string;
  hospitalName: string;
  hospitalCity: string;
  requestId?: string;
}

export interface MatchedDonor {
  donorId: string;
  profileId: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  isAvailable: boolean;
  weight: number;
  age: number;
  address: LocationAddress;
  matchReason: string;
  suitabilityLabel: 'Suitable Donor' | 'High Compatibility' | 'Universal Donor';
  status: 'Available' | 'Pending Response' | 'Accepted' | 'Busy';
  lastDonationDate?: string | null;
}
