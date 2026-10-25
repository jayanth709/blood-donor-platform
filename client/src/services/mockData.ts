import { 
  User, 
  DonorProfile, 
  HospitalProfile, 
  EmergencyRequest, 
  DonorResponse, 
  DonationHistoryItem,
  BloodGroup,
  UrgencyLevel
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_donor_1',
    _id: 'user_donor_1',
    name: 'Karthik Ramanathan',
    email: 'karthik.donor@example.com',
    role: 'donor',
    phone: '+91 98401 23456',
    isActive: true,
    createdAt: '2024-01-15T09:30:00Z'
  },
  {
    id: 'user_donor_2',
    _id: 'user_donor_2',
    name: 'Priya Sundaram',
    email: 'priya.donor@example.com',
    role: 'donor',
    phone: '+91 98412 34567',
    isActive: true,
    createdAt: '2024-02-10T11:15:00Z'
  },
  {
    id: 'user_donor_3',
    _id: 'user_donor_3',
    name: 'Arjun Venkatesh',
    email: 'arjun.donor@example.com',
    role: 'donor',
    phone: '+91 97909 87654',
    isActive: true,
    createdAt: '2024-03-01T14:20:00Z'
  },
  {
    id: 'user_donor_4',
    _id: 'user_donor_4',
    name: 'Ananya Deshmukh',
    email: 'ananya.donor@example.com',
    role: 'donor',
    phone: '+91 98200 45678',
    isActive: true,
    createdAt: '2024-03-12T16:00:00Z'
  },
  {
    id: 'user_donor_5',
    _id: 'user_donor_5',
    name: 'Rajesh Kumar',
    email: 'rajesh.donor@example.com',
    role: 'donor',
    phone: '+91 98840 98712',
    isActive: true,
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'user_hospital_1',
    _id: 'user_hospital_1',
    name: 'Apollo Speciality Hospitals',
    email: 'emergency@apollohospitals.org',
    role: 'hospital',
    phone: '+91 44 2829 0200',
    isActive: true,
    createdAt: '2023-11-05T08:00:00Z'
  },
  {
    id: 'user_hospital_2',
    _id: 'user_hospital_2',
    name: 'Fortis Malar Hospital',
    email: 'bloodbank@fortismalar.in',
    role: 'hospital',
    phone: '+91 44 4289 2222',
    isActive: true,
    createdAt: '2023-12-01T10:30:00Z'
  },
  {
    id: 'user_hospital_3',
    _id: 'user_hospital_3',
    name: 'MIOT International',
    email: 'icu.desk@miotinternational.com',
    role: 'hospital',
    phone: '+91 44 4200 2288',
    isActive: true,
    createdAt: '2024-01-08T12:00:00Z'
  },
  {
    id: 'user_admin_1',
    _id: 'user_admin_1',
    name: 'Dr. Meera Nambiar',
    email: 'admin@bloodlink.gov.in',
    role: 'admin',
    phone: '+91 44 2530 5000',
    isActive: true,
    createdAt: '2023-10-01T08:00:00Z'
  }
];

export const INITIAL_DONOR_PROFILES: DonorProfile[] = [
  {
    _id: 'dp_1',
    user: INITIAL_USERS[0],
    bloodGroup: 'O+',
    isAvailable: true,
    dateOfBirth: '1996-05-14',
    weight: 72,
    hasChronicIllness: false,
    lastDonationDate: '2023-11-20',
    address: {
      street: '14, 2nd Avenue, Roundana',
      area: 'Anna Nagar',
      city: 'Chennai',
      pincode: '600040'
    },
    city: 'Chennai',
    pincode: '600040',
    totalDonations: 6,
    age: 28,
    createdAt: '2024-01-15T09:30:00Z'
  },
  {
    _id: 'dp_2',
    user: INITIAL_USERS[1],
    bloodGroup: 'O-',
    isAvailable: true,
    dateOfBirth: '1998-08-22',
    weight: 58,
    hasChronicIllness: false,
    lastDonationDate: '2023-12-10',
    address: {
      street: '42, Usman Road',
      area: 'T. Nagar',
      city: 'Chennai',
      pincode: '600017'
    },
    city: 'Chennai',
    pincode: '600017',
    totalDonations: 4,
    age: 26,
    createdAt: '2024-02-10T11:15:00Z'
  },
  {
    _id: 'dp_3',
    user: INITIAL_USERS[2],
    bloodGroup: 'A+',
    isAvailable: false,
    dateOfBirth: '1994-11-03',
    weight: 76,
    hasChronicIllness: false,
    lastDonationDate: '2024-02-18',
    address: {
      street: '88, Gandhi Mandapam Road',
      area: 'Adyar',
      city: 'Chennai',
      pincode: '600020'
    },
    city: 'Chennai',
    pincode: '600020',
    totalDonations: 8,
    age: 30,
    createdAt: '2024-03-01T14:20:00Z'
  },
  {
    _id: 'dp_4',
    user: INITIAL_USERS[3],
    bloodGroup: 'B+',
    isAvailable: true,
    dateOfBirth: '2000-02-17',
    weight: 62,
    hasChronicIllness: false,
    lastDonationDate: '2023-10-05',
    address: {
      street: '102, 100 Feet Road',
      area: 'Velachery',
      city: 'Chennai',
      pincode: '600042'
    },
    city: 'Chennai',
    pincode: '600042',
    totalDonations: 3,
    age: 24,
    createdAt: '2024-03-12T16:00:00Z'
  },
  {
    _id: 'dp_5',
    user: INITIAL_USERS[4],
    bloodGroup: 'AB+',
    isAvailable: true,
    dateOfBirth: '1992-09-10',
    weight: 80,
    hasChronicIllness: false,
    lastDonationDate: '2023-09-15',
    address: {
      street: '15, Sterling Road',
      area: 'Nungambakkam',
      city: 'Chennai',
      pincode: '600034'
    },
    city: 'Chennai',
    pincode: '600034',
    totalDonations: 11,
    age: 32,
    createdAt: '2024-01-20T10:00:00Z'
  }
];

export const INITIAL_HOSPITAL_PROFILES: HospitalProfile[] = [
  {
    _id: 'hp_1',
    user: INITIAL_USERS[5],
    hospitalName: 'Apollo Speciality Hospitals',
    licenseNumber: 'TN-CHE-MED-2018-0912',
    contactPerson: 'Dr. K. Senthil Kumar (Blood Bank In-Charge)',
    emergencyPhone: '+91 44 2829 0200',
    address: {
      street: 'No. 21, Greams Lane, Off Greams Road',
      area: 'Thousand Lights',
      city: 'Chennai',
      pincode: '600006'
    },
    city: 'Chennai',
    pincode: '600006',
    verificationStatus: 'verified',
    createdAt: '2023-11-05T08:00:00Z'
  },
  {
    _id: 'hp_2',
    user: INITIAL_USERS[6],
    hospitalName: 'Fortis Malar Hospital',
    licenseNumber: 'TN-CHE-MED-2019-1403',
    contactPerson: 'Sister Margaret Gomez (Emergency Triage)',
    emergencyPhone: '+91 44 4289 2222',
    address: {
      street: 'No. 52, 1st Main Road, Gandhi Nagar',
      area: 'Adyar',
      city: 'Chennai',
      pincode: '600020'
    },
    city: 'Chennai',
    pincode: '600020',
    verificationStatus: 'verified',
    createdAt: '2023-12-01T10:30:00Z'
  },
  {
    _id: 'hp_3',
    user: INITIAL_USERS[7],
    hospitalName: 'MIOT International',
    licenseNumber: 'TN-CHE-MED-2020-0441',
    contactPerson: 'Dr. Ronald Jacob (Trauma Director)',
    emergencyPhone: '+91 44 4200 2288',
    address: {
      street: '4/112, Mount Poonamallee Road',
      area: 'Manapakkam',
      city: 'Chennai',
      pincode: '600089'
    },
    city: 'Chennai',
    pincode: '600089',
    verificationStatus: 'verified',
    createdAt: '2024-01-08T12:00:00Z'
  }
];

export const INITIAL_EMERGENCY_REQUESTS: EmergencyRequest[] = [
  {
    _id: 'req_001',
    hospital: {
      _id: 'hp_1',
      name: 'Apollo Speciality Hospitals',
      phone: '+91 44 2829 0200',
      licenseNumber: 'TN-CHE-MED-2018-0912'
    },
    hospitalProfile: {
      hospitalName: 'Apollo Speciality Hospitals',
      emergencyPhone: '+91 44 2829 0200',
      contactPerson: 'Dr. K. Senthil Kumar (Blood Bank In-Charge)',
      address: {
        street: 'No. 21, Greams Lane',
        area: 'Thousand Lights',
        city: 'Chennai',
        pincode: '600006'
      }
    },
    patientBloodGroup: 'O+',
    requiredUnits: 3,
    fulfilledUnits: 1,
    urgency: 'CRITICAL',
    patientCaseDetails: 'Emergency polytrauma ICU patient following road traffic accident. Immediate surgery required within 90 minutes. Whole blood / PRBC urgently needed.',
    location: {
      street: 'No. 21, Greams Lane',
      area: 'Thousand Lights',
      city: 'Chennai',
      pincode: '600006'
    },
    status: 'OPEN',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(), // 42 mins ago
    responsesCount: {
      pending: 2,
      accepted: 1,
      rejected: 0,
      total: 3
    }
  },
  {
    _id: 'req_002',
    hospital: {
      _id: 'hp_2',
      name: 'Fortis Malar Hospital',
      phone: '+91 44 4289 2222',
      licenseNumber: 'TN-CHE-MED-2019-1403'
    },
    hospitalProfile: {
      hospitalName: 'Fortis Malar Hospital',
      emergencyPhone: '+91 44 4289 2222',
      contactPerson: 'Sister Margaret Gomez',
      address: {
        street: 'No. 52, 1st Main Road',
        area: 'Adyar',
        city: 'Chennai',
        pincode: '600020'
      }
    },
    patientBloodGroup: 'O-',
    requiredUnits: 2,
    fulfilledUnits: 0,
    urgency: 'CRITICAL',
    patientCaseDetails: 'Obstetric emergency with postpartum hemorrhage. Rare O-negative whole blood needed immediately for urgent resuscitation.',
    location: {
      street: 'No. 52, 1st Main Road, Gandhi Nagar',
      area: 'Adyar',
      city: 'Chennai',
      pincode: '600020'
    },
    status: 'SEARCHING',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    responsesCount: {
      pending: 1,
      accepted: 0,
      rejected: 0,
      total: 1
    }
  },
  {
    _id: 'req_003',
    hospital: {
      _id: 'hp_3',
      name: 'MIOT International',
      phone: '+91 44 4200 2288',
      licenseNumber: 'TN-CHE-MED-2020-0441'
    },
    hospitalProfile: {
      hospitalName: 'MIOT International',
      emergencyPhone: '+91 44 4200 2288',
      contactPerson: 'Dr. Ronald Jacob',
      address: {
        street: '4/112, Mount Poonamallee Road',
        area: 'Manapakkam',
        city: 'Chennai',
        pincode: '600089'
      }
    },
    patientBloodGroup: 'A+',
    requiredUnits: 4,
    fulfilledUnits: 2,
    urgency: 'HIGH',
    patientCaseDetails: 'Scheduled complex cardiac valve replacement surgery scheduled for tomorrow morning. Pre-operative blood reserve needed.',
    location: {
      street: '4/112, Mount Poonamallee Road',
      area: 'Manapakkam',
      city: 'Chennai',
      pincode: '600089'
    },
    status: 'RESPONSE_RECEIVED',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    responsesCount: {
      pending: 0,
      accepted: 2,
      rejected: 1,
      total: 3
    }
  },
  {
    _id: 'req_004',
    hospital: {
      _id: 'hp_1',
      name: 'Apollo Speciality Hospitals',
      phone: '+91 44 2829 0200',
      licenseNumber: 'TN-CHE-MED-2018-0912'
    },
    hospitalProfile: {
      hospitalName: 'Apollo Speciality Hospitals',
      emergencyPhone: '+91 44 2829 0200',
      contactPerson: 'Dr. K. Senthil Kumar',
      address: {
        street: 'No. 21, Greams Lane',
        area: 'Thousand Lights',
        city: 'Chennai',
        pincode: '600006'
      }
    },
    patientBloodGroup: 'B+',
    requiredUnits: 2,
    fulfilledUnits: 2,
    urgency: 'NORMAL',
    patientCaseDetails: 'Elective orthopedic hip arthroplasty scheduled. Standard patient replacement units fulfilled successfully.',
    location: {
      street: 'No. 21, Greams Lane',
      area: 'Thousand Lights',
      city: 'Chennai',
      pincode: '600006'
    },
    status: 'FULFILLED',
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    responsesCount: {
      pending: 0,
      accepted: 2,
      rejected: 0,
      total: 2
    }
  }
];

export const INITIAL_DONOR_RESPONSES: DonorResponse[] = [
  {
    _id: 'resp_001',
    requestId: 'req_001',
    request: INITIAL_EMERGENCY_REQUESTS[0],
    donorId: 'dp_1',
    donor: {
      _id: 'user_donor_1',
      name: 'Karthik Ramanathan',
      email: 'karthik.donor@example.com',
      phone: '+91 98401 23456'
    },
    donorProfile: {
      bloodGroup: 'O+',
      weight: 72,
      address: {
        area: 'Anna Nagar',
        city: 'Chennai',
        pincode: '600040'
      },
      isAvailable: true
    },
    status: 'ACCEPTED',
    responseNotes: 'Confirmed available. ETA 30 minutes at Apollo Greams Road Blood Bank.',
    isDonationCompleted: false,
    respondedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    _id: 'resp_002',
    requestId: 'req_003',
    request: INITIAL_EMERGENCY_REQUESTS[2],
    donorId: 'dp_3',
    donor: {
      _id: 'user_donor_3',
      name: 'Arjun Venkatesh',
      email: 'arjun.donor@example.com',
      phone: '+91 97909 87654'
    },
    donorProfile: {
      bloodGroup: 'A+',
      weight: 76,
      address: {
        area: 'Adyar',
        city: 'Chennai',
        pincode: '600020'
      },
      isAvailable: true
    },
    status: 'ACCEPTED',
    responseNotes: 'Will arrive by 6:00 PM for pre-donation screening.',
    isDonationCompleted: true,
    respondedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'resp_003',
    requestId: 'req_003',
    request: INITIAL_EMERGENCY_REQUESTS[2],
    donorId: 'dp_5',
    donor: {
      _id: 'user_donor_5',
      name: 'Rajesh Kumar',
      email: 'rajesh.donor@example.com',
      phone: '+91 98840 98712'
    },
    donorProfile: {
      bloodGroup: 'AB+',
      weight: 80,
      address: {
        area: 'Nungambakkam',
        city: 'Chennai',
        pincode: '600034'
      },
      isAvailable: true
    },
    status: 'REJECTED',
    responseNotes: 'Currently out of town on business travel until Friday.',
    isDonationCompleted: false,
    respondedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  }
];

export const INITIAL_DONATION_HISTORY: DonationHistoryItem[] = [
  {
    _id: 'hist_1',
    bloodGroup: 'O+',
    unitsDonated: 1,
    donatedAt: '2023-11-20',
    remarks: 'Voluntary whole blood donation during emergency dengue platelet surge',
    hospitalName: 'Apollo Speciality Hospitals',
    hospitalCity: 'Chennai',
    requestId: 'req_old_98'
  },
  {
    _id: 'hist_2',
    bloodGroup: 'O+',
    unitsDonated: 1,
    donatedAt: '2023-07-14',
    remarks: 'World Blood Donor Day voluntary drive',
    hospitalName: 'Madras Medical College Blood Bank',
    hospitalCity: 'Chennai'
  },
  {
    _id: 'hist_3',
    bloodGroup: 'O+',
    unitsDonated: 1,
    donatedAt: '2023-02-02',
    remarks: 'Emergency response for emergency cardiac surgery reserve',
    hospitalName: 'Fortis Malar Hospital',
    hospitalCity: 'Chennai',
    requestId: 'req_old_45'
  }
];

// Helper to retrieve & persist in browser localStorage
const STORAGE_PREFIX = 'bloodlink_';

export const getStoredData = <T>(key: string, initialFallback: T): T => {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return initialFallback;
    return JSON.parse(raw) as T;
  } catch {
    return initialFallback;
  }
};

export const setStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
};
