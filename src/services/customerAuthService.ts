import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
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
import { auth, db, handleFirestoreError, OperationType } from './firebase';
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
 * Helper to fetch or bootstrap a customer's profile upon sign-in
 */
export async function getOrCreateCustomerProfile(user: FirebaseUser): Promise<CustomerProfile> {
  const profileRef = doc(db, 'customers', user.uid);
  try {
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      return snap.data() as CustomerProfile;
    }

    // Bootstrap profile if document does not exist yet
    const nowIso = new Date().toISOString();
    const newProfile: CustomerProfile = {
      uid: user.uid,
      fullName: user.displayName || 'Valued Customer',
      phone: user.phoneNumber || '',
      email: user.email?.toLowerCase() || '',
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
  const snap = await getDoc(orderRef);
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
  await updateDoc(orderRef, {
    customerId,
    updatedAt: nowIso
  });

  return {
    ...orderData,
    customerId,
    updatedAt: nowIso
  };
}
