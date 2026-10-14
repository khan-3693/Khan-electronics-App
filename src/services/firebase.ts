import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc, getDocs, collection } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// 1. Customer Application Instance (Default Firebase App)
export const customerApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApp();
/* CRITICAL: The app will break without this line */
export const customerDb = getFirestore(customerApp, firebaseConfig.firestoreDatabaseId);
export const customerAuth = getAuth(customerApp);
export const storage = getStorage(customerApp, firebaseConfig.storageBucket);

// 2. Admin Application Instance (Dedicated Isolated Firebase App for Admin Portal)
// Guarantees separate browser IndexedDB storage and distinct concurrent sessions.
export const adminApp = getApps().some(a => a.name === 'khanAdminApp')
  ? getApp('khanAdminApp')
  : initializeApp(firebaseConfig, 'khanAdminApp');
export const adminDb = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
export const adminAuth = getAuth(adminApp);

// Default exports for backward compatibility
export const app = customerApp;
export const db = customerDb;
export const auth = customerAuth;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown, 
  operationType: OperationType, 
  path: string | null,
  activeAuth = customerAuth
) {
  const current = activeAuth.currentUser || adminAuth.currentUser || customerAuth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: current?.uid,
      email: current?.email,
      emailVerified: current?.emailVerified,
      isAnonymous: current?.isAnonymous,
      tenantId: current?.tenantId,
      providerInfo: current?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection as required by Firebase skill
async function testConnection() {
  try {
    await getDocFromServer(doc(customerDb, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();
