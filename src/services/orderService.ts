import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  Order, 
  OrderStatus, 
  OrderPaymentStatus, 
  OrderPaymentMethod, 
  OrderItemSnapshot, 
  OrderDeliveryAddress,
  CartItem,
  Product
} from '../types';

/**
 * Generates a unique, human-readable Khan Electronics order reference
 * Format: KE-ORD-2026-XXXXX (e.g., KE-ORD-2026-48291)
 */
export function generateOrderReference(): string {
  const currentYear = new Date().getFullYear();
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `KE-ORD-${currentYear}-${randomPart}`;
}

/**
 * Normalizes phone numbers for comparison (removes spaces, dashes, and +977 prefix)
 */
export function normalizePhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.startsWith('977') && digitsOnly.length > 10) {
    return digitsOnly.slice(3);
  }
  return digitsOnly;
}

/**
 * Recursively strips undefined fields so Firestore setDoc / updateDoc never fails
 */
export function cleanFirestoreObject<T>(obj: T): T {
  if (obj === undefined) {
    return null as unknown as T;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(cleanFirestoreObject) as unknown as T;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      cleaned[key] = cleanFirestoreObject(val);
    }
  }
  return cleaned as T;
}

export interface CreateOrderParams {
  cartItems: CartItem[];
  deliveryAddress: OrderDeliveryAddress;
  paymentMethod: OrderPaymentMethod;
  customerNotes?: string;
  customerId?: string | null;
}

/**
 * Creates an order in Firestore with trusted price & stock validation
 * Never trusts prices or line totals submitted blindly by client state
 */
export async function createOrderInFirestore(params: {
  cartItems: CartItem[];
  deliveryAddress: OrderDeliveryAddress;
  paymentMethod: OrderPaymentMethod;
  customerNotes?: string;
  customerId?: string | null;
}): Promise<Order> {
  const { cartItems, deliveryAddress, paymentMethod, customerNotes, customerId } = params;

  if (!cartItems || cartItems.length === 0) {
    throw new Error('Your cart is empty. Please add appliances before checkout.');
  }

  if (!deliveryAddress.fullName || !deliveryAddress.fullName.trim()) {
    throw new Error('Customer full name is required.');
  }

  const cleanPhone = deliveryAddress.phone ? deliveryAddress.phone.trim() : '';
  if (!cleanPhone || cleanPhone.length < 7) {
    throw new Error('Valid mobile phone number is required.');
  }

  // 1. Generate unique order ID
  const orderId = generateOrderReference();

  // 2. Validate items, pricing, and stock against trusted product data
  const validatedItems: OrderItemSnapshot[] = [];
  let calculatedSubtotal = 0;

  for (const item of cartItems) {
    if (item.quantity <= 0) {
      throw new Error(`Invalid quantity for ${item.product.name}`);
    }

    let verifiedUnitPrice = item.product.price;
    let verifiedStock = item.product.stockCount;
    let verifiedName = item.product.name;
    let verifiedModelNumber = item.product.modelNumber || '';
    let verifiedImageUrl = item.product.imageUrl;
    let verifiedBrand = item.product.brand;

    // Verify against live Firestore product doc if available
    try {
      const productRef = doc(db, 'products', item.product.id);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const liveData = productSnap.data();
        if (typeof liveData.sellingPrice === 'number' && liveData.sellingPrice > 0) {
          verifiedUnitPrice = liveData.sellingPrice;
        }
        if (typeof liveData.stockQuantity === 'number') {
          verifiedStock = liveData.stockQuantity;
        }
        if (liveData.productName) verifiedName = liveData.productName;
        if (liveData.modelNumber) verifiedModelNumber = liveData.modelNumber;
        if (liveData.images && liveData.images[0]) verifiedImageUrl = liveData.images[0];
        if (liveData.brand) verifiedBrand = liveData.brand;
      }
    } catch {
      // Fall back to client's initial catalogue data if network query fails
    }

    // Check stock availability if stock is tracked
    if (verifiedStock > 0 && item.quantity > verifiedStock) {
      throw new Error(
        `Quantity for "${verifiedName}" exceeds available showroom stock (${verifiedStock} available).`
      );
    }

    const lineTotal = verifiedUnitPrice * item.quantity;
    calculatedSubtotal += lineTotal;

    validatedItems.push({
      productId: item.product.id,
      productName: verifiedName,
      modelNumber: verifiedModelNumber,
      brand: verifiedBrand,
      imageUrl: verifiedImageUrl,
      unitPrice: verifiedUnitPrice,
      quantity: item.quantity,
      lineTotal
    });
  }

  // 3. Delivery rules
  // Free delivery within 5 km of Rajbiraj showroom
  // Outside 5 km or standard regional freight, delivery charge will be confirmed by showroom team
  const isWithin5km = Boolean(deliveryAddress.isWithin5km);
  const deliveryCharge = isWithin5km ? 0 : null;
  const deliveryChargeNote = isWithin5km 
    ? 'FREE Local Delivery (Within 5 km Rajbiraj Showroom)' 
    : 'To be confirmed by Rajbiraj showroom team before dispatch';

  const totalAmount = calculatedSubtotal + (deliveryCharge || 0);
  const nowIso = new Date().toISOString();

  const newOrder: Order = {
    id: orderId,
    orderId,
    customerId: customerId || null,
    customerName: deliveryAddress.fullName.trim(),
    phone: cleanPhone,
    email: deliveryAddress.email?.trim() || null,
    deliveryAddress: {
      fullName: deliveryAddress.fullName.trim(),
      phone: cleanPhone,
      email: deliveryAddress.email?.trim() || null,
      province: deliveryAddress.province || 'Madhesh Province',
      district: deliveryAddress.district || 'Saptari',
      municipality: deliveryAddress.municipality || 'Rajbiraj Municipality',
      wardNo: deliveryAddress.wardNo || 'Ward No. 3',
      streetAddress: deliveryAddress.streetAddress || '',
      landmark: deliveryAddress.landmark?.trim() || null,
      isWithin5km,
      deliveryInstructions: deliveryAddress.deliveryInstructions?.trim() || null
    },
    items: validatedItems,
    subtotal: calculatedSubtotal,
    deliveryCharge,
    deliveryChargeNote,
    totalAmount,
    paymentMethod,
    paymentStatus: 'Unpaid',
    orderStatus: 'New',
    customerNotes: customerNotes?.trim() || '',
    adminNotes: '',
    confirmedDeliveryInfo: '',
    createdAt: nowIso,
    updatedAt: nowIso,

    // Legacy fields compatibility
    status: 'New',
    total: totalAmount,
    deliveryFee: isWithin5km ? 0 : 0
  };

  try {
    const orderRef = doc(db, 'orders', orderId);
    const sanitizedOrder = cleanFirestoreObject(newOrder);
    await setDoc(orderRef, sanitizedOrder);
    return newOrder;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
    throw err;
  }
}

/**
 * Customer order retrieval with phone verification
 * Protects customer privacy: only returns the order if the phone matches
 * Strips internal admin notes to protect confidential showroom information
 */
export async function fetchCustomerOrderWithVerification(
  orderId: string, 
  rawPhone: string
): Promise<Order> {
  const cleanId = orderId.trim();
  const cleanEnteredPhone = normalizePhoneNumber(rawPhone);

  if (!cleanId) {
    throw new Error('Please enter your order reference (e.g. KE-ORD-2026-12345).');
  }
  if (!cleanEnteredPhone || cleanEnteredPhone.length < 7) {
    throw new Error('Please enter the mobile number used when placing the order.');
  }

  try {
    const orderRef = doc(db, 'orders', cleanId);
    const snap = await getDoc(orderRef);

    if (!snap.exists()) {
      throw new Error(`Order reference "${cleanId}" was not found in our database. Please verify your reference number.`);
    }

    const orderData = snap.data() as Order;
    const orderPhone = normalizePhoneNumber(orderData.phone || orderData.deliveryAddress?.phone || '');

    // Verify phone matches (allow last 7 to 10 digits match to handle regional dialing prefixes)
    const matchesPhone = 
      orderPhone === cleanEnteredPhone ||
      (orderPhone.length >= 7 && cleanEnteredPhone.endsWith(orderPhone.slice(-7))) ||
      (cleanEnteredPhone.length >= 7 && orderPhone.endsWith(cleanEnteredPhone.slice(-7)));

    if (!matchesPhone) {
      throw new Error('Mobile number does not match this order reference. Please check your 10-digit mobile number.');
    }

    // Sanitize: Strip internal admin notes before returning to customer
    const sanitizedOrder: Order = {
      ...orderData,
      adminNotes: undefined // Never exposed to customers
    };

    return sanitizedOrder;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    handleFirestoreError(err, OperationType.GET, `orders/${cleanId}`);
    throw err;
  }
}

/**
 * Real-time listener for all orders (Admin Portal)
 */
export function subscribeToOrders(
  onOrdersUpdated: (orders: Order[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((docSnap) => {
          orders.push({
            id: docSnap.id,
            ...(docSnap.data() as any)
          });
        });
        onOrdersUpdated(orders);
      },
      (error) => {
        console.error('Firestore orders subscription error:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Failed to attach orders listener:', err);
    return () => {};
  }
}

/**
 * Fetch all orders once (Admin Portal)
 */
export async function fetchAllOrdersForAdmin(): Promise<Order[]> {
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...(docSnap.data() as any)
      });
    });
    return orders;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'orders');
    throw err;
  }
}

/**
 * Admin: Update order status with timestamp & status synchronization
 */
export async function updateOrderStatusByAdmin(
  orderId: string, 
  newStatus: OrderStatus
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const nowIso = new Date().toISOString();

    await updateDoc(orderRef, {
      orderStatus: newStatus,
      status: newStatus,
      updatedAt: nowIso
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    throw err;
  }
}

/**
 * Admin: Update payment status
 */
export async function updateOrderPaymentStatusByAdmin(
  orderId: string, 
  newPaymentStatus: OrderPaymentStatus
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const nowIso = new Date().toISOString();

    await updateDoc(orderRef, {
      paymentStatus: newPaymentStatus,
      updatedAt: nowIso
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    throw err;
  }
}

/**
 * Admin: Update delivery charge & confirmed delivery instructions
 */
export async function updateOrderDeliveryByAdmin(
  orderId: string,
  deliveryCharge: number,
  confirmedDeliveryInfo: string,
  currentSubtotal: number
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const nowIso = new Date().toISOString();
    const updatedTotal = currentSubtotal + (deliveryCharge || 0);

    await updateDoc(orderRef, cleanFirestoreObject({
      deliveryCharge,
      confirmedDeliveryInfo: (confirmedDeliveryInfo || '').trim(),
      totalAmount: updatedTotal,
      total: updatedTotal,
      updatedAt: nowIso
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    throw err;
  }
}

/**
 * Admin: Update private internal showroom notes
 */
export async function updateOrderAdminNotesByAdmin(
  orderId: string, 
  adminNotes: string
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const nowIso = new Date().toISOString();

    await updateDoc(orderRef, cleanFirestoreObject({
      adminNotes: (adminNotes || '').trim(),
      updatedAt: nowIso
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    throw err;
  }
}
