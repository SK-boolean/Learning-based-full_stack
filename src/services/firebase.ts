import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyC8QXP5wqv3_0Qq3GByvLCiNokGSlr3H9I",
  authDomain: "learnbuddy-5dd8f.firebaseapp.com",
  projectId: "learnbuddy-5dd8f",
  storageBucket: "learnbuddy-5dd8f.firebasestorage.app",
  messagingSenderId: "331699694274",
  appId: "1:331699694274:web:17177147b732907afee95b",
};

// Initialize Firebase safely (avoid duplicate initialization)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export type UserRole = 'learner' | 'mentor' | 'ngo' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt: string;
  lastLoginAt: string;
  isDemo?: boolean;
  isLocalAuth?: boolean;

  // Learner fields
  age?: number;
  fieldOfInterest?: string;
  doctorDiagnosed?: string; // 'Autism' | 'Dyslexia' | 'Cerebral Palsy' | 'Low Sensory' | 'None'
  assignedCondition?: string; // 'autism' | 'dyslexia' | 'cerebral-palsy'
  startingLevel?: number;
  currentLevel?: number;
  completedLevels?: number[];
  screeningCompleted?: boolean;

  // Mentor fields
  agencyName?: string;
  fieldOfStudy?: string;
  servicesProvided?: string[]; // 'Speech Therapy' | 'Occupational Therapy' | 'Behavioral Intervention' | 'Special Education' | 'Parent Support' | 'Vocational Training'

  // NGO fields
  ngoName?: string;
  registeredAddress?: string;
  officialEmail?: string;
  phoneNumber?: string;
  registrationNumber?: string;
  orgType?: string; // 'NGO/Trust' | 'Society' | 'Section 8 Company' | 'Private Agency/Clinic' | 'Other'
  orgTypeOther?: string;
}

export async function saveUserProfile(userProfile: UserProfile): Promise<void> {
  try {
    const userRef = doc(db, 'users', userProfile.uid);
    await setDoc(userRef, userProfile, { merge: true });
  } catch (error) {
    console.warn('Firestore write notice (fallback to local storage):', error);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (error) {
    console.warn('Firestore read notice (using local storage fallback):', error);
  }
  return null;
}
