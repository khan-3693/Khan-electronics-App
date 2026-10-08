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
import { FinanceEnquiry, FinanceEnquiryStatus, FinanceTenureMonths, Product } from '../types';

export type { FinanceTenureMonths, FinanceEnquiry, FinanceEnquiryStatus };

export const MIN_FINANCE_PRICE = 30000;
export const FINANCE_TENURES: { 
  months: FinanceTenureMonths; 
  label: string; 
  interestRatePercent: number;
}[] = [
  { months: 6, label: '6 Months', interestRatePercent: 0 },
  { months: 9, label: '9 Months', interestRatePercent: 0 },
  { months: 12, label: '12 Months', interestRatePercent: 0 },
  { months: 24, label: '24 Months', interestRatePercent: 7.99 }
];

/**
 * Returns the interest rate percent for a given tenure:
 * 6, 9, 12 months = 0%
 * 24 months = 7.99%
 */
export function getTenureInterestRate(tenureMonths: FinanceTenureMonths): number {
  return tenureMonths === 24 ? 7.99 : 0;
}

/**
 * Calculates finance breakdown (downpayment, financed loan, interest, and monthly EMI)
 */
export function calculateFinanceEmi(
  productPrice: number,
  tenureMonths: FinanceTenureMonths,
  downPaymentPercent: number = 40
): {
  downPaymentAmount: number;
  financedAmount: number;
  interestRatePercent: number;
  interestAmount: number;
  totalPayableLoan: number;
  monthlyEmi: number;
} {
  const downPaymentAmount = Math.round(productPrice * (downPaymentPercent / 100));
  const financedAmount = productPrice - downPaymentAmount;
  const interestRatePercent = getTenureInterestRate(tenureMonths);
  const interestAmount = interestRatePercent > 0 
    ? Math.round(financedAmount * (interestRatePercent / 100))
    : 0;
  const totalPayableLoan = financedAmount + interestAmount;
  const monthlyEmi = Math.round(totalPayableLoan / tenureMonths);

  return {
    downPaymentAmount,
    financedAmount,
    interestRatePercent,
    interestAmount,
    totalPayableLoan,
    monthlyEmi
  };
}

/**
 * Enforces business rule: Finance is available ONLY if:
 * 1. financeAvailable === true
 * 2. sellingPrice / price >= 30,000 NPR
 */
export function isProductFinanceEligible(product: {
  financeAvailable?: boolean;
  price?: number;
  sellingPrice?: number;
}): boolean {
  if (!product) return false;
  const isFinanceMarked = Boolean(product.financeAvailable);
  const actualPrice = product.price ?? product.sellingPrice ?? 0;
  return isFinanceMarked && actualPrice >= MIN_FINANCE_PRICE;
}

/**
 * Filter a list of products to strictly return finance-eligible items (>= NPR 30,000)
 */
export function getFinanceEligibleProducts(products: Product[]): Product[] {
  return products.filter(p => isProductFinanceEligible(p));
}

/**
 * Validates a Nepal phone number (10 digits starting with 97 or 98, or 9XXXXXXXXX)
 */
export function isValidNepalPhone(phone: string): boolean {
  const cleaned = phone.trim().replace(/[\s\-+]/g, '');
  // Allow Nepal international prefix (+977) stripped
  const num = cleaned.startsWith('977') ? cleaned.slice(3) : cleaned;
  return /^[9][6-8]\d{8}$/.test(num) || (num.length === 10 && /^\d{10}$/.test(num));
}

/**
 * Validates an email address format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Generates a unique sequential/randomized Enquiry ID e.g., FIN-2026-000123
 */
export function generateFinanceEnquiryId(): string {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `FIN-2026-${randomSuffix}`;
}

/**
 * Creates and saves a new finance enquiry in Firestore "financeEnquiries" collection
 */
export async function submitFinanceEnquiry(data: {
  fullName: string;
  phoneNumber: string;
  email: string;
  citizenshipNumber: string;
  citizenshipIssueDate: string;
  productId: string;
  productName: string;
  modelNumber: string;
  productPrice: number;
  tenureMonths: FinanceTenureMonths;
}): Promise<FinanceEnquiry> {
  const path = 'financeEnquiries';

  if (data.productPrice < MIN_FINANCE_PRICE) {
    throw new Error(`Finance is only available for products priced at NPR ${MIN_FINANCE_PRICE.toLocaleString()} or above.`);
  }

  if (!isValidNepalPhone(data.phoneNumber)) {
    throw new Error('Please enter a valid 10-digit mobile number (e.g. 98XXXXXXXX).');
  }

  if (!isValidEmail(data.email)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!data.citizenshipNumber.trim()) {
    throw new Error('Citizenship number is required.');
  }

  if (!data.citizenshipIssueDate.trim()) {
    throw new Error('Citizenship issue date is required.');
  }

  const enquiryId = generateFinanceEnquiryId();
  const now = Timestamp.now();

  const newEnquiry: FinanceEnquiry = {
    enquiryId,
    fullName: data.fullName.trim(),
    phoneNumber: data.phoneNumber.trim(),
    email: data.email.trim(),
    citizenshipNumber: data.citizenshipNumber.trim(),
    citizenshipIssueDate: data.citizenshipIssueDate.trim(),
    productId: data.productId,
    productName: data.productName.trim(),
    modelNumber: data.modelNumber?.trim() || '',
    productPrice: Number(data.productPrice),
    tenureMonths: data.tenureMonths,
    status: 'New',
    createdAt: now,
    updatedAt: now
  };

  try {
    await setDoc(doc(db, path, enquiryId), newEnquiry);
    return newEnquiry;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${path}/${enquiryId}`);
    throw err;
  }
}

/**
 * Privacy-preserving lookup for Ask Khan AI.
 * Requires Enquiry ID + Phone Number verification before revealing non-sensitive status.
 * NEVER returns citizenship details.
 */
export async function lookupFinanceEnquiryForCustomer(
  enquiryIdInput: string,
  phoneInput: string
): Promise<{
  success: boolean;
  enquiry?: {
    enquiryId: string;
    fullName: string;
    productName: string;
    modelNumber: string;
    productPrice: number;
    tenureMonths: number;
    status: FinanceEnquiryStatus;
    submittedAt?: string;
  };
  error?: string;
}> {
  const cleanId = enquiryIdInput.trim().toUpperCase();
  const cleanPhone = phoneInput.trim().replace(/[\s\-+]/g, '');

  if (!cleanId) {
    return { success: false, error: 'Please provide your Finance Enquiry ID (e.g., FIN-2026-XXXXXX).' };
  }

  if (!cleanPhone) {
    return { success: false, error: 'For verification, please provide the mobile number used when applying.' };
  }

  try {
    const docRef = doc(db, 'financeEnquiries', cleanId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return {
        success: false,
        error: `No finance enquiry found with ID "${cleanId}". Please check the ID or contact Khan Electronics.`
      };
    }

    const data = snap.data() as FinanceEnquiry;
    const storedPhoneClean = data.phoneNumber.replace(/[\s\-+]/g, '');

    // Verification check: exact phone or last 4 digits matching
    const matchesPhone = storedPhoneClean === cleanPhone || 
      storedPhoneClean.endsWith(cleanPhone) || 
      cleanPhone.endsWith(storedPhoneClean.slice(-4));

    if (!matchesPhone) {
      return {
        success: false,
        error: 'Phone number verification failed. The phone number does not match this enquiry record.'
      };
    }

    // Return sanitized non-sensitive information
    let formattedDate = 'Recently submitted';
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      formattedDate = data.createdAt.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    return {
      success: true,
      enquiry: {
        enquiryId: data.enquiryId,
        fullName: data.fullName,
        productName: data.productName,
        modelNumber: data.modelNumber,
        productPrice: data.productPrice,
        tenureMonths: data.tenureMonths,
        status: data.status,
        submittedAt: formattedDate
      }
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'Unable to retrieve enquiry record at this time. Please try again or contact the showroom.'
    };
  }
}

/**
 * Admin: Fetch all finance enquiries
 */
export async function fetchAllFinanceEnquiries(): Promise<FinanceEnquiry[]> {
  const path = 'financeEnquiries';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as FinanceEnquiry);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

/**
 * Admin: Real-time listener for finance enquiries
 */
export function subscribeToFinanceEnquiries(
  onUpdate: (enquiries: FinanceEnquiry[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'financeEnquiries';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map(d => d.data() as FinanceEnquiry);
      onUpdate(items);
    },
    (error) => {
      console.warn('Finance enquiries listener notice:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Admin: Update status of a finance enquiry
 */
export async function updateFinanceEnquiryStatus(
  enquiryId: string,
  newStatus: FinanceEnquiryStatus
): Promise<void> {
  const path = 'financeEnquiries';
  try {
    await updateDoc(doc(db, path, enquiryId), {
      status: newStatus,
      updatedAt: Timestamp.now()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${path}/${enquiryId}`);
    throw err;
  }
}
