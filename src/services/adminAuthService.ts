import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';

export const INITIAL_ADMIN_EMAIL = 'nkae.rjb@gmail.com';

export interface AdminUserDoc {
  email: string;
  role: 'admin';
  active: boolean;
  createdAt: Timestamp;
}

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  adminDoc: AdminUserDoc | null;
  loading: boolean;
  authError: string | null;
}

/**
 * Checks if a given Firebase user is authorized in the adminUsers collection.
 * If the user's email matches the configured initial admin, automatically bootstraps their admin document.
 */
export async function verifyAndEnsureAdmin(user: User): Promise<{
  isAuthorized: boolean;
  adminDoc: AdminUserDoc | null;
  error?: string;
}> {
  const path = 'adminUsers';
  try {
    const adminDocRef = doc(db, path, user.uid);
    const docSnap = await getDoc(adminDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as AdminUserDoc;
      if (data.role === 'admin' && data.active === true) {
        return { isAuthorized: true, adminDoc: data };
      }
      return { 
        isAuthorized: false, 
        adminDoc: data, 
        error: 'You do not have administrator access.' 
      };
    }

    // Check if user is the designated Initial Administrator (nkae.rjb@gmail.com)
    if (user.email && user.email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase()) {
      const initialDoc: AdminUserDoc = {
        email: user.email.toLowerCase(),
        role: 'admin',
        active: true,
        createdAt: Timestamp.now()
      };
      await setDoc(adminDocRef, initialDoc);
      return { isAuthorized: true, adminDoc: initialDoc };
    }

    return { 
      isAuthorized: false, 
      adminDoc: null, 
      error: 'You do not have administrator access.' 
    };
  } catch (error) {
    console.error('Error verifying admin authorization:', error);
    // If user's email matches initial admin, they still have valid credentials
    if (user.email && user.email.toLowerCase() === INITIAL_ADMIN_EMAIL.toLowerCase()) {
      return { 
        isAuthorized: true, 
        adminDoc: {
          email: user.email.toLowerCase(),
          role: 'admin',
          active: true,
          createdAt: Timestamp.now()
        } 
      };
    }
    handleFirestoreError(error, OperationType.GET, path);
    return { 
      isAuthorized: false, 
      adminDoc: null, 
      error: 'Error verifying administrator permissions.' 
    };
  }
}

/**
 * Sign in admin using Email & Password.
 * If the initial admin user does not exist in Firebase Auth yet, creates the account automatically.
 */
export async function loginAdminWithEmailPassword(email: string, pass: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  
  try {
    const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
    return cred.user;
  } catch (error: any) {
    // If account doesn't exist yet and it's the designated initial admin, register it
    if (
      (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') &&
      normalizedEmail === INITIAL_ADMIN_EMAIL.toLowerCase()
    ) {
      try {
        const newCred = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
        // Bootstrap admin record in Firestore
        await setDoc(doc(db, 'adminUsers', newCred.user.uid), {
          email: normalizedEmail,
          role: 'admin',
          active: true,
          createdAt: Timestamp.now()
        });
        return newCred.user;
      } catch (createErr: any) {
        // If creating fails with already in use, throw standard error
        if (createErr.code !== 'auth/email-already-in-use') {
          throw translateAuthError(createErr);
        }
      }
    }
    throw translateAuthError(error);
  }
}

/**
 * Sign in admin using Google Sign-In (1-Click Popup Auth).
 * Recommended default since Google Login is natively pre-configured by Firebase.
 */
export async function loginAdminWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    login_hint: INITIAL_ADMIN_EMAIL,
    prompt: 'select_account'
  });

  try {
    const cred = await signInWithPopup(auth, provider);
    await verifyAndEnsureAdmin(cred.user);
    return cred.user;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-in window was closed. Please try again.');
    }
    if (error?.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in operation was cancelled.');
    }
    throw translateAuthError(error);
  }
}

/**
 * Signs out the current admin
 */
export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

/**
 * Translates Firebase Auth error codes into human-readable messages
 */
function translateAuthError(error: any): Error {
  const code = error?.code || '';
  let message = 'An error occurred during authentication.';

  switch (code) {
    case 'auth/invalid-email':
      message = 'Please enter a valid email address.';
      break;
    case 'auth/user-disabled':
      message = 'This administrator account has been disabled.';
      break;
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      message = 'Invalid email or password. Please verify your credentials.';
      break;
    case 'auth/too-many-requests':
      message = 'Access temporarily disabled due to multiple failed login attempts. Please try again later.';
      break;
    case 'auth/weak-password':
      message = 'Password should be at least 6 characters.';
      break;
    default:
      if (error?.message) {
        message = error.message;
      }
  }

  return new Error(message);
}
