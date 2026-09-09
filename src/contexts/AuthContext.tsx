import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, saveUserProfile, getUserProfile, UserRole, UserProfile } from '../services/firebase';
import { authRateLimiter, dispatchLoadBalancedRequest } from '../utils/rateLimiter';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authError: string | null;
  clearError: () => void;
  signUp: (email: string, pass: string, role: UserRole, displayName?: string, extraProfile?: Partial<UserProfile>) => Promise<boolean>;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  demoLogin: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  updateCurrentUserProfile: (patch: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_PROFILE_KEY = 'berry_user_profile_cache';
const LOCAL_USERS_REGISTRY_KEY = 'berry_registered_users_v1';

interface LocalUserRecord {
  uid: string;
  email: string;
  password: string;
  profile: UserProfile;
}

function getLocalRegistry(): Record<string, LocalUserRecord> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalRegistry(registry: Record<string, LocalUserRecord>) {
  try {
    localStorage.setItem(LOCAL_USERS_REGISTRY_KEY, JSON.stringify(registry));
  } catch (e) {
    console.warn('Failed to save to local registry:', e);
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch or hydrate user profile
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
            localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
          } else {
            // Fallback or maintain role from cache if Firestore is not yet configured
            const cached = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
            const fallbackRole: UserRole = cached ? (JSON.parse(cached).role || 'learner') : 'learner';
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || 'user@berry.app',
              role: fallbackRole,
              displayName: user.displayName || user.email?.split('@')[0] || 'Berry Learner',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            setUserProfile(newProfile);
            localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(newProfile));
            await saveUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        // If not logged into Firebase, maintain active session from local cache (resilient local auth or demo)
        const cached = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as UserProfile;
            if (parsed && parsed.uid) {
              setUserProfile(parsed);
              setCurrentUser({
                uid: parsed.uid,
                email: parsed.email,
                displayName: parsed.displayName,
              } as unknown as User);
            } else {
              setUserProfile(null);
            }
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setAuthError(null);

  // Sign up with rate limiter check, load balanced dispatcher, and graceful Firebase fallback
  const signUp = async (
    email: string, 
    pass: string, 
    role: UserRole, 
    displayName?: string,
    extraProfile?: Partial<UserProfile>
  ): Promise<boolean> => {
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return false;
    }
    if (pass.length < 6) {
      setAuthError('Password is too weak. Please use at least 6 characters.');
      return false;
    }

    // 1. Check Rate Limiter
    const rateCheck = authRateLimiter.checkLimit();
    if (!rateCheck.allowed) {
      setAuthError(`Rate limit exceeded! Please wait ${rateCheck.resetSeconds}s before trying again.`);
      return false;
    }
    authRateLimiter.recordAttempt();

    // 2. Load Balancer Dispatch Notification
    await dispatchLoadBalancedRequest({ action: 'signup', email: cleanEmail, role });

    let firebaseSuccess = false;
    let registeredUid = '';

    // Attempt Firebase sign up first
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const user = userCredential.user;
      registeredUid = user.uid;
      firebaseSuccess = true;

      if (displayName) {
        try {
          await updateProfile(user, { displayName });
        } catch {
          // ignore display name update error
        }
      }
    } catch (err: unknown) {
      const errMsg = (err as Error)?.message || '';
      console.warn('Firebase createUser notice (activating resilient auth):', errMsg);

      // Check for user-input validation errors from Firebase
      if (errMsg.includes('auth/email-already-in-use')) {
        setAuthError('An account with this email already exists. Please log in.');
        return false;
      }
      if (errMsg.includes('auth/weak-password')) {
        setAuthError('Password is too weak. Please use at least 6 characters.');
        return false;
      }
      if (errMsg.includes('auth/invalid-email')) {
        setAuthError('Invalid email address provided.');
        return false;
      }

      // Check local user registry to prevent duplicate accounts
      const registry = getLocalRegistry();
      if (registry[cleanEmail]) {
        setAuthError('An account with this email already exists. Please log in.');
        return false;
      }

      // Generate local resilient UID
      registeredUid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    }

    // Build the complete UserProfile
    const profile: UserProfile = {
      uid: registeredUid,
      email: cleanEmail,
      role: role,
      displayName: displayName?.trim() || cleanEmail.split('@')[0],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isLocalAuth: !firebaseSuccess,
      ...(extraProfile || {})
    };

    // Save to local registry so sign-in and cross-session persistence work seamlessly
    try {
      const registry = getLocalRegistry();
      registry[cleanEmail] = {
        uid: registeredUid,
        email: cleanEmail,
        password: pass,
        profile: profile,
      };
      saveLocalRegistry(registry);
    } catch (e) {
      console.warn('Notice saving local registry record:', e);
    }

    setUserProfile(profile);
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));

    if (!firebaseSuccess) {
      setCurrentUser({
        uid: registeredUid,
        email: cleanEmail,
        displayName: profile.displayName,
      } as unknown as User);
    }

    // Save profile to Firestore (fails gracefully if firestore unavailable)
    saveUserProfile(profile).catch(() => {});

    return true;
  };

  // Sign in with rate limiter check and resilient local registry fallback
  const signIn = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return false;
    }
    if (!pass) {
      setAuthError('Please enter your password.');
      return false;
    }

    // 1. Check Rate Limiter
    const rateCheck = authRateLimiter.checkLimit();
    if (!rateCheck.allowed) {
      setAuthError(`Too many sign in attempts! Rate limiter locked for ${rateCheck.resetSeconds}s.`);
      return false;
    }
    authRateLimiter.recordAttempt();

    // 2. Load Balancer Dispatch
    await dispatchLoadBalancedRequest({ action: 'signin', email: cleanEmail });

    // Attempt Firebase sign in
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const user = userCredential.user;

      // Retrieve profile
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
      } else {
        const cached = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
        const fallbackRole: UserRole = cached ? (JSON.parse(cached).role || 'learner') : 'learner';
        const fallbackProfile: UserProfile = {
          uid: user.uid,
          email: user.email || cleanEmail,
          role: fallbackRole,
          displayName: user.displayName || cleanEmail.split('@')[0],
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        setUserProfile(fallbackProfile);
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(fallbackProfile));
      }

      return true;
    } catch (err: unknown) {
      const errMsg = (err as Error)?.message || '';
      console.warn('Firebase signIn notice (checking local registry):', errMsg);

      // Check local user registry
      const registry = getLocalRegistry();
      const localAccount = registry[cleanEmail];

      if (localAccount) {
        if (localAccount.password === pass) {
          const updatedProfile: UserProfile = {
            ...localAccount.profile,
            lastLoginAt: new Date().toISOString(),
          };
          localAccount.profile = updatedProfile;
          registry[cleanEmail] = localAccount;
          saveLocalRegistry(registry);

          setUserProfile(updatedProfile);
          setCurrentUser({
            uid: updatedProfile.uid,
            email: updatedProfile.email,
            displayName: updatedProfile.displayName,
          } as unknown as User);
          localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updatedProfile));
          return true;
        } else {
          setAuthError('Incorrect password. Please verify and try again.');
          return false;
        }
      }

      // Check if user was looking for a demo account or email not registered
      if (errMsg.includes('auth/wrong-password')) {
        setAuthError('Incorrect password. Please verify and try again.');
      } else if (errMsg.includes('auth/user-not-found') || errMsg.includes('auth/invalid-credential')) {
        setAuthError('No account found with this email. Please sign up or choose a demo profile.');
      } else {
        setAuthError('Account not found. Please click a role tab above to register your account!');
      }
      return false;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
  };

  // Quick evaluation demo login (with instant role switching)
  const demoLogin = (role: UserRole) => {
    const demoProfiles: Record<UserRole, UserProfile> = {
      learner: {
        uid: 'demo-learner-101',
        email: 'learner.berry@example.com',
        role: 'learner',
        displayName: 'Leo the Learner',
        age: 12,
        fieldOfInterest: 'Practical Life & Work Skills',
        doctorDiagnosed: 'Autism',
        assignedCondition: 'autism',
        startingLevel: 1,
        currentLevel: 1,
        completedLevels: [],
        screeningCompleted: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      mentor: {
        uid: 'demo-mentor-202',
        email: 'mentor.sarah@example.com',
        role: 'mentor',
        displayName: 'Dr. Sarah (Special Educator)',
        agencyName: 'Asha Child Development Center',
        fieldOfStudy: 'Special Education & Speech Therapy',
        servicesProvided: ['Speech Therapy', 'Behavioral Intervention', 'Special Education'],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      ngo: {
        uid: 'demo-ngo-404',
        email: 'contact@inclusiveminds.org',
        role: 'ngo',
        displayName: 'Inclusive Minds Foundation',
        ngoName: 'Inclusive Minds Foundation',
        registeredAddress: 'Plot 12, Institutional Area, Vasant Kunj, New Delhi',
        officialEmail: 'contact@inclusiveminds.org',
        phoneNumber: '+91 98102 34567',
        registrationNumber: 'NGO-DEL-2019-7712',
        orgType: 'NGO/Trust',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      admin: {
        uid: 'demo-admin-303',
        email: 'admin.berry@example.com',
        role: 'admin',
        displayName: 'Alex Admin (Lead)',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
    };

    const selected = { ...demoProfiles[role], isDemo: true };
    setUserProfile(selected);
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(selected));
    setAuthError(null);
  };

  const updateCurrentUserProfile = async (patch: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated: UserProfile = { ...userProfile, ...patch };
    setUserProfile(updated);
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updated));

    // Update in local registry if stored there
    try {
      const registry = getLocalRegistry();
      const normEmail = updated.email.trim().toLowerCase();
      if (registry[normEmail]) {
        registry[normEmail].profile = updated;
        saveLocalRegistry(registry);
      }
    } catch {
      // ignore
    }

    await saveUserProfile(updated);
  };

  const switchRole = (role: UserRole) => {
    if (userProfile) {
      const updated = { ...userProfile, role };
      setUserProfile(updated);
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updated));
      saveUserProfile(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        authError,
        clearError,
        signUp,
        signIn,
        signOut,
        demoLogin,
        switchRole,
        updateCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
