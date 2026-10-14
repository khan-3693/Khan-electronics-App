import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  verifyBeforeUpdateEmail,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { auth, db, storage, handleFirestoreError, OperationType } from './firebase';
import { 
  CustomerProfile, 
  SavedAddress, 
  Order, 
  ServiceTicket, 
  ExchangeRequest, 
  FinanceApplication, 
  FinanceEnquiry,
  RegisteredWarranty
} from '../types';
import { cleanFirestoreObject, normalizePhoneNumber } from './orderService';

/**
 * Registers a new customer with Firebase Auth and creates their profile document in Firestore
 */
export async function registerCustomer(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}): Promise<CustomerProfile> {
  const { email, password, fullName, phone } = params;

  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  if (!fullName || !fullName.trim()) {
    throw new Error('Please enter your full name.');
  }
  if (!phone || phone.trim().length < 7) {
    throw new Error('Please enter a valid mobile number.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  // Set displayName in Firebase Auth
  try {
    await updateProfile(user, { displayName: fullName.trim() });
  } catch (err) {
    console.warn('Could not set displayName on auth user:', err);
  }

  const nowIso = new Date().toISOString();
  const profile: CustomerProfile = {
    uid: user.uid,
    fullName: fullName.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
    savedAddresses: [],
    memberTier: 'Regular Customer',
    createdAt: nowIso,
    updatedAt: nowIso
  };

  try {
    const profileRef = doc(db, 'customers', user.uid);
    await setDoc(profileRef, cleanFirestoreObject(profile));
    return profile;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `customers/${user.uid}`);
    throw err;
  }
}

/**
 * Signs in an existing customer and retrieves their profile document
 */
export async function loginCustomer(email: string, password: string): Promise<CustomerProfile> {
  if (!email || !password) {
    throw new Error('Please enter both email and password.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = userCredential.user;

  return await getOrCreateCustomerProfile(user);
}

/**
 * Helper to check if a user is authenticated via Google Sign-In
 */
export function isGoogleAuthUser(user: FirebaseUser | null): boolean {
  if (!user) return false;
  return user.providerData.some(p => p.providerId === 'google.com');
}

/**
 * Helper to check if a user is authenticated via Email/Password
 */
export function isPasswordAuthUser(user: FirebaseUser | null): boolean {
  if (!user) return false;
  return user.providerData.some(p => p.providerId === 'password');
}

/**
 * Helper to fetch or bootstrap a customer's profile upon sign-in.
 * Also keeps the Firestore email synchronized with the Firebase Auth email if verified.
 */
export async function getOrCreateCustomerProfile(user: FirebaseUser): Promise<CustomerProfile> {
  const profileRef = doc(db, 'customers', user.uid);
  try {
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      const data = snap.data() as CustomerProfile;
      // If user.email has changed (e.g. after verifying email change), sync it to Firestore
      if (user.email && data.email && user.email.toLowerCase() !== data.email.toLowerCase()) {
        const syncedEmail = user.email.toLowerCase();
        await updateDoc(profileRef, cleanFirestoreObject({
          email: syncedEmail,
          updatedAt: new Date().toISOString()
        }));
        return { ...data, email: syncedEmail };
      }
      return data;
    }

    // Bootstrap profile if document does not exist yet
    const nowIso = new Date().toISOString();
    const newProfile: CustomerProfile = {
      uid: user.uid,
      fullName: user.displayName || 'Valued Customer',
      phone: user.phoneNumber || '',
      email: user.email?.toLowerCase() || '',
      photoUrl: user.photoURL || null,
      photoStoragePath: null,
      savedAddresses: [],
      memberTier: 'Regular Customer',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    await setDoc(profileRef, cleanFirestoreObject(newProfile));
    return newProfile;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `customers/${user.uid}`);
    throw err;
  }
}

/**
 * Signs out the currently authenticated user
 */
export async function logoutCustomer(): Promise<void> {
  await signOut(auth);
}

/**
 * Sends a password reset email to the customer
 */
export async function sendCustomerPasswordReset(email: string): Promise<void> {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Changes customer password with re-authentication
 */
export async function changeCustomerPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('You must be signed in to change your password.');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

/**
 * Result of requesting an email change
 */
export interface EmailChangeResult {
  requiresVerification: boolean;
  emailSentTo: string;
  immediateUpdate: boolean;
  message: string;
}

/**
 * Safely updates customer email in Firebase Auth and synchronizes with Firestore.
 * Handles reauthentication, Google vs Email/Password providers, and email verification.
 */
export async function changeCustomerEmail(params: {
  newEmail: string;
  currentPassword?: string;
}): Promise<EmailChangeResult> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('You must be signed in to change your email.');
  }

  const cleanNewEmail = params.newEmail.trim().toLowerCase();
  if (!cleanNewEmail || !cleanNewEmail.includes('@') || !cleanNewEmail.includes('.')) {
    throw new Error('Please enter a valid new email address.');
  }

  if (cleanNewEmail === user.email?.toLowerCase()) {
    throw new Error('New email address is the same as your current email address.');
  }

  // Handle Google accounts
  if (isGoogleAuthUser(user)) {
    throw new Error(
      'Your account is secured via Google Sign-In. Email addresses for Google accounts are managed directly through your Google Account settings.'
    );
  }

  // Re-authenticate with current password if password user
  if (isPasswordAuthUser(user)) {
    if (!params.currentPassword) {
      throw new Error('For security, please enter your current password to confirm this change.');
    }
    if (!user.email) {
      throw new Error('Current user has no associated email.');
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, params.currentPassword);
      await reauthenticateWithCredential(user, credential);
    } catch (reauthErr: any) {
      if (reauthErr.code === 'auth/wrong-password' || reauthErr.code === 'auth/invalid-credential') {
        throw new Error('Incorrect current password. Please re-enter your password to proceed.');
      }
      if (reauthErr.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please wait a moment and try again.');
      }
      throw reauthErr;
    }
  }

  // Attempt email update using installed Firebase SDK
  // In modern Firebase SDKs, verifyBeforeUpdateEmail sends a confirmation link to the new address
  try {
    await verifyBeforeUpdateEmail(user, cleanNewEmail);
    return {
      requiresVerification: true,
      emailSentTo: cleanNewEmail,
      immediateUpdate: false,
      message: `A verification link has been sent to ${cleanNewEmail}. Please check your inbox and click the link to confirm your new email address.`
    };
  } catch (err: any) {
    // If operation-not-allowed is thrown by Firebase for verifyBeforeUpdateEmail, fallback to updateEmail
    if (err.code === 'auth/operation-not-allowed') {
      try {
        await updateEmail(user, cleanNewEmail);
        // Synchronize Firestore profile
        const profileRef = doc(db, 'customers', user.uid);
        await updateDoc(profileRef, cleanFirestoreObject({
          email: cleanNewEmail,
          updatedAt: new Date().toISOString()
        }));
        return {
          requiresVerification: false,
          emailSentTo: cleanNewEmail,
          immediateUpdate: true,
          message: `Your email address has been successfully updated to ${cleanNewEmail}.`
        };
      } catch (updateErr: any) {
        if (updateErr.code === 'auth/requires-recent-login') {
          throw new Error('Recent login required. Please enter your current password to verify your account.');
        }
        if (updateErr.code === 'auth/email-already-in-use') {
          throw new Error('This email address is already in use by another account.');
        }
        throw updateErr;
      }
    }

    if (err.code === 'auth/requires-recent-login') {
      throw new Error('Security check required. Please provide your current password to continue.');
    }
    if (err.code === 'auth/email-already-in-use') {
      throw new Error('This email address is already registered with another account.');
    }
    if (err.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    }
    throw err;
  }
}

/**
 * Checks if the user's verified Firebase Auth email differs from Firestore and syncs them.
 */
export async function syncCustomerEmailWithAuth(uid: string): Promise<{
  synced: boolean;
  email: string;
  isVerified: boolean;
}> {
  const user = auth.currentUser;
  if (!user || user.uid !== uid) {
    throw new Error('User is not currently authenticated.');
  }

  // Reload the auth user to pick up email changes verified via link
  await user.reload();
  const currentAuthEmail = user.email?.toLowerCase() || '';

  const profileRef = doc(db, 'customers', uid);
  const snap = await getDoc(profileRef);
  if (!snap.exists()) {
    throw new Error('Customer profile not found.');
  }

  const profileData = snap.data() as CustomerProfile;
  if (currentAuthEmail && currentAuthEmail !== profileData.email?.toLowerCase()) {
    await updateDoc(profileRef, cleanFirestoreObject({
      email: currentAuthEmail,
      updatedAt: new Date().toISOString()
    }));
    return {
      synced: true,
      email: currentAuthEmail,
      isVerified: user.emailVerified
    };
  }

  return {
    synced: false,
    email: profileData.email || currentAuthEmail,
    isVerified: user.emailVerified
  };
}

/**
 * Uploads a customer profile picture to Firebase Storage and updates their Firestore profile.
 * Path: customers/{uid}/avatar_{timestamp}.{ext}
 */
export async function uploadCustomerProfilePicture(
  uid: string,
  file: File,
  previousStoragePath?: string | null
): Promise<{ photoUrl: string; storagePath: string }> {
  const user = auth.currentUser;
  if (!user || user.uid !== uid) {
    throw new Error('You must be signed in to upload a profile picture.');
  }

  // 1. Validate file format
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
    throw new Error('Unsupported image format. Please select a JPG, PNG, or WebP image.');
  }

  // 2. Validate file size (max 5MB)
  const maxSizeBytes = 5 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error('File size exceeds the 5MB limit. Please choose a smaller image.');
  }

  // 3. Determine file extension
  let extension = 'jpg';
  if (file.type.includes('png')) extension = 'png';
  else if (file.type.includes('webp')) extension = 'webp';
  else if (file.name.includes('.')) {
    const extFromName = file.name.split('.').pop()?.toLowerCase();
    if (extFromName && ['jpg', 'jpeg', 'png', 'webp'].includes(extFromName)) {
      extension = extFromName;
    }
  }

  const storagePath = `customers/${uid}/avatar_${Date.now()}.${extension}`;
  const fileRef = ref(storage, storagePath);

  try {
    // 4. Upload to Firebase Storage
    await uploadBytes(fileRef, file, {
      contentType: file.type,
      customMetadata: {
        customerId: uid,
        uploadedAt: new Date().toISOString()
      }
    });

    // 5. Get Download URL
    const downloadUrl = await getDownloadURL(fileRef);

    // 6. Update Firestore customer profile
    const profileRef = doc(db, 'customers', uid);
    await updateDoc(profileRef, cleanFirestoreObject({
      photoUrl: downloadUrl,
      photoStoragePath: storagePath,
      updatedAt: new Date().toISOString()
    }));

    // 7. Update Firebase Auth user photoURL
    try {
      await updateProfile(user, { photoURL: downloadUrl });
    } catch (authProfErr) {
      console.warn('Could not update Firebase Auth photoURL:', authProfErr);
    }

    // 8. Delete previous file if one existed
    if (previousStoragePath && previousStoragePath !== storagePath) {
      try {
        const oldRef = ref(storage, previousStoragePath);
        await deleteObject(oldRef);
      } catch (delErr) {
        console.warn('Old profile picture cleanup note:', delErr);
      }
    }

    return { photoUrl: downloadUrl, storagePath };
  } catch (err: any) {
    console.error('Error uploading profile picture:', err);
    throw new Error(err.message || 'Failed to upload profile picture. Please try again.');
  }
}

/**
 * Removes the customer's profile picture from Firebase Storage and clears their Firestore profile.
 */
export async function removeCustomerProfilePicture(
  uid: string,
  currentStoragePath?: string | null
): Promise<void> {
  const user = auth.currentUser;
  if (!user || user.uid !== uid) {
    throw new Error('You must be signed in to remove your profile picture.');
  }

  // 1. Delete from Firebase Storage if storage path exists
  if (currentStoragePath) {
    try {
      const fileRef = ref(storage, currentStoragePath);
      await deleteObject(fileRef);
    } catch (err) {
      console.warn('Could not remove file from storage (may already be deleted):', err);
    }
  }

  // 2. Update Firestore customer profile
  const profileRef = doc(db, 'customers', uid);
  await updateDoc(profileRef, cleanFirestoreObject({
    photoUrl: null,
    photoStoragePath: null,
    updatedAt: new Date().toISOString()
  }));

  // 3. Clear Firebase Auth user photoURL
  try {
    await updateProfile(user, { photoURL: '' });
  } catch (authProfErr) {
    console.warn('Could not clear Firebase Auth photoURL:', authProfErr);
  }
}

/**
 * Updates basic customer personal info (full name, phone)
 */
export async function updateCustomerProfile(
  uid: string, 
  data: Partial<Pick<CustomerProfile, 'fullName' | 'phone'>>
): Promise<void> {
  const profileRef = doc(db, 'customers', uid);
  const nowIso = new Date().toISOString();

  try {
    await updateDoc(profileRef, cleanFirestoreObject({
      ...data,
      updatedAt: nowIso
    }));

    if (data.fullName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.fullName });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `customers/${uid}`);
    throw err;
  }
}

/**
 * Saves a new delivery address to the customer's profile
 */
export async function addSavedAddress(
  uid: string, 
  newAddress: Omit<SavedAddress, 'id'>
): Promise<SavedAddress[]> {
  const profileRef = doc(db, 'customers', uid);
  const snap = await getDoc(profileRef);
  if (!snap.exists()) {
    throw new Error('Customer profile not found.');
  }

  const profile = snap.data() as CustomerProfile;
  const addressId = `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const createdAddress: SavedAddress = {
    id: addressId,
    ...newAddress,
    isDefault: newAddress.isDefault ?? (profile.savedAddresses.length === 0)
  };

  let updatedList = [...profile.savedAddresses];
  if (createdAddress.isDefault) {
    updatedList = updatedList.map(a => ({ ...a, isDefault: false }));
  }
  updatedList.push(createdAddress);

  await updateDoc(profileRef, cleanFirestoreObject({
    savedAddresses: updatedList,
    updatedAt: new Date().toISOString()
  }));

  return updatedList;
}

/**
 * Updates an existing delivery address
 */
export async function updateSavedAddress(
  uid: string, 
  addressId: string, 
  updatedFields: Partial<SavedAddress>
): Promise<SavedAddress[]> {
  const profileRef = doc(db, 'customers', uid);
  const snap = await getDoc(profileRef);
  if (!snap.exists()) {
    throw new Error('Customer profile not found.');
  }

  const profile = snap.data() as CustomerProfile;
  let updatedList = profile.savedAddresses.map(a => {
    if (a.id === addressId) {
      return { ...a, ...updatedFields };
    }
    if (updatedFields.isDefault) {
      return { ...a, isDefault: false };
    }
    return a;
  });

  await updateDoc(profileRef, cleanFirestoreObject({
    savedAddresses: updatedList,
    updatedAt: new Date().toISOString()
  }));

  return updatedList;
}

/**
 * Deletes a delivery address from the customer's profile
 */
export async function deleteSavedAddress(
  uid: string, 
  addressId: string
): Promise<SavedAddress[]> {
  const profileRef = doc(db, 'customers', uid);
  const snap = await getDoc(profileRef);
  if (!snap.exists()) {
    throw new Error('Customer profile not found.');
  }

  const profile = snap.data() as CustomerProfile;
  const updatedList = profile.savedAddresses.filter(a => a.id !== addressId);

  // If we deleted the default address, promote the first one
  if (updatedList.length > 0 && !updatedList.some(a => a.isDefault)) {
    updatedList[0].isDefault = true;
  }

  await updateDoc(profileRef, cleanFirestoreObject({
    savedAddresses: updatedList,
    updatedAt: new Date().toISOString()
  }));

  return updatedList;
}

/**
 * Fetches the authenticated customer's own orders from Firestore
 */
export async function fetchCustomerOrders(uid: string): Promise<Order[]> {
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(
      ordersCol, 
      where('customerId', '==', uid)
    );
    const snap = await getDocs(q);

    const orders: Order[] = [];
    snap.forEach(d => {
      orders.push(d.data() as Order);
    });

    // Sort newest first
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'orders');
    return [];
  }
}

/**
 * Fetches the customer's own service tickets
 */
export async function fetchCustomerServiceTickets(uid: string): Promise<ServiceTicket[]> {
  try {
    const ticketsCol = collection(db, 'serviceTickets');
    const q = query(ticketsCol, where('customerId', '==', uid));
    const snap = await getDocs(q);
    const list: ServiceTicket[] = [];
    snap.forEach(d => list.push(d.data() as ServiceTicket));
    return list;
  } catch {
    return [];
  }
}

/**
 * Fetches the customer's own Samsung exchanges
 */
export async function fetchCustomerExchanges(uid: string): Promise<ExchangeRequest[]> {
  try {
    const exchangesCol = collection(db, 'exchangeRequests');
    const q = query(exchangesCol, where('customerId', '==', uid));
    const snap = await getDocs(q);
    const list: ExchangeRequest[] = [];
    snap.forEach(d => list.push(d.data() as ExchangeRequest));
    return list;
  } catch {
    return [];
  }
}

/**
 * Fetches the customer's own Hulas Finance applications
 */
export async function fetchCustomerFinanceApplications(uid: string): Promise<FinanceApplication[]> {
  try {
    const financeCol = collection(db, 'financeApplications');
    const q = query(financeCol, where('customerId', '==', uid));
    const snap = await getDocs(q);
    const list: FinanceApplication[] = [];
    snap.forEach(d => list.push(d.data() as FinanceApplication));
    return list;
  } catch {
    return [];
  }
}

/**
 * Fetches the customer's own 0% Interest Finance enquiries
 */
export async function fetchCustomerFinanceEnquiries(uid: string): Promise<FinanceEnquiry[]> {
  try {
    const enquiriesCol = collection(db, 'financeEnquiries');
    const q = query(enquiriesCol, where('customerId', '==', uid));
    const snap = await getDocs(q);
    const list: FinanceEnquiry[] = [];
    snap.forEach(d => list.push(d.data() as FinanceEnquiry));
    return list;
  } catch {
    return [];
  }
}

/**
 * Fetches the customer's own registered warranties from Firestore
 */
export async function fetchCustomerWarranties(uid: string): Promise<RegisteredWarranty[]> {
  try {
    const warrantiesCol = collection(db, 'warranties');
    const q = query(warrantiesCol, where('customerId', '==', uid));
    const snap = await getDocs(q);
    const list: RegisteredWarranty[] = [];
    snap.forEach(d => list.push(d.data() as RegisteredWarranty));
    return list;
  } catch {
    return [];
  }
}

/**
 * Verified guest order linking:
 * Requires exact order reference AND the matching mobile phone number.
 * Never merges based solely on unverified data.
 */
export async function linkGuestOrderToCustomer(
  orderId: string,
  rawPhone: string,
  customerId: string
): Promise<Order> {
  const cleanId = orderId.trim();
  const cleanPhone = normalizePhoneNumber(rawPhone);

  if (!cleanId) {
    throw new Error('Please enter the order reference number (e.g. KE-ORD-2026-12345).');
  }
  if (!cleanPhone || cleanPhone.length < 7) {
    throw new Error('Please enter the 10-digit mobile number provided during checkout.');
  }

  const orderRef = doc(db, 'orders', cleanId);
  let snap;
  try {
    snap = await getDoc(orderRef);
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('permission-denied') || err?.message?.includes('Missing or insufficient permissions')) {
      throw new Error(
        'For security, linking unassigned guest orders cannot be performed directly in browser mode. Please contact showroom support at +977-9852821213 with your order reference and mobile number to associate this order.'
      );
    }
    throw err;
  }

  if (!snap.exists()) {
    throw new Error(`Order "${cleanId}" was not found. Please double-check your order reference.`);
  }

  const orderData = snap.data() as Order;
  if (orderData.customerId && orderData.customerId === customerId) {
    return orderData;
  }
  if (orderData.customerId && orderData.customerId !== customerId) {
    throw new Error('This order reference is already associated with another customer account.');
  }

  const orderPhone = normalizePhoneNumber(orderData.phone || orderData.deliveryAddress?.phone || '');
  const matches = 
    orderPhone === cleanPhone ||
    (orderPhone.length >= 7 && cleanPhone.endsWith(orderPhone.slice(-7))) ||
    (cleanPhone.length >= 7 && orderPhone.endsWith(cleanPhone.slice(-7)));

  if (!matches) {
    throw new Error('Verification failed: Mobile number does not match the details on this order.');
  }

  const nowIso = new Date().toISOString();
  try {
    await updateDoc(orderRef, {
      customerId,
      updatedAt: nowIso
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied' || err?.message?.includes('permission-denied') || err?.message?.includes('Missing or insufficient permissions')) {
      throw new Error(
        'For store protection, claiming guest orders requires showroom assistance. Please call +977-9852821213 with reference ' + cleanId + '.'
      );
    }
    throw err;
  }

  return {
    ...orderData,
    customerId,
    updatedAt: nowIso
  };
}
