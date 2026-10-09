export type ApplianceBrand = 
  | 'Samsung' 
  | 'CG' 
  | 'Godrej' 
  | 'Konka' 
  | 'Midea' 
  | 'Force' 
  | 'Crompton' 
  | 'Chigo' 
  | 'Khaitan' 
  | 'TCL' 
  | 'Other';

export type ApplianceCategory = 
  | 'Refrigerators' 
  | 'Washing Machines' 
  | 'Mixer Grinders' 
  | 'Rice Cookers' 
  | 'Kitchen & Cooking' 
  | 'Cooling & Heating' 
  | 'Televisions';

export interface ProductSpec {
  capacity?: string;
  powerWattage?: string;
  voltage?: string;
  dimensions?: string;
  warrantyYears?: number;
  motorWarrantyYears?: number;
  energyRating?: string;
  color?: string;
  weight?: string;
  specialFeatures?: string[];
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  brand: ApplianceBrand;
  category: ApplianceCategory;
  modelNumber?: string;
  price: number; // in NPR
  originalPrice: number; // in NPR
  rating: number;
  reviewCount: number;
  imageUrl: string;
  additionalImages: string[];
  badge?: string;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  stockCount: number;
  exchangeAvailable: boolean; // True for Samsung products
  financeAvailable: boolean; // True for Samsung, CG, Godrej, Crompton, Midea, TCL
  shortDesc: string;
  fullDesc: string;
  features: string[];
  specs: ProductSpec;
  warrantySummary: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  exchangeTradeIn?: {
    brand: string;
    applianceType: string;
    estimatedValue: number;
  };
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  altPhone?: string;
  city: string; // e.g., Rajbiraj
  wardNo: string;
  district: string; // e.g., Saptari
  province: string; // e.g., Madhesh Province
  landmark?: string;
  isWithin5km: boolean; // Free delivery if true
}

export type OrderStatus = 
  | 'New'
  | 'Under Review'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type OrderPaymentStatus = 
  | 'Unpaid'
  | 'Partially Paid'
  | 'Paid'
  | 'Refunded';

export type OrderPaymentMethod = 
  | 'Cash on Delivery'
  | 'Pay at Store';

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  modelNumber?: string;
  brand?: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDeliveryAddress {
  fullName: string;
  phone: string;
  email?: string | null;
  province: string;
  district: string;
  municipality: string;
  wardNo: string;
  streetAddress: string;
  landmark?: string | null;
  isWithin5km: boolean;
  deliveryInstructions?: string | null;
}

export interface Order {
  id: string;
  orderId: string;
  customerId?: string | null;
  customerName: string;
  phone: string;
  email?: string | null;
  deliveryAddress: OrderDeliveryAddress;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryCharge: number | null;
  deliveryChargeNote?: string;
  totalAmount: number;
  paymentMethod: OrderPaymentMethod | string;
  paymentStatus: OrderPaymentStatus | string;
  orderStatus: OrderStatus;
  customerNotes?: string;
  adminNotes?: string;
  confirmedDeliveryInfo?: string;
  createdAt: string;
  updatedAt: string;

  // Compatibility fields
  status?: string;
  total?: number;
  deliveryFee?: number;
  discount?: number;
  shippingAddress?: ShippingAddress;
  deliveryType?: string;
  deliveryNote?: string;
}

export interface ExchangeRequest {
  id: string;
  applianceType: string;
  currentBrand: string;
  modelYear?: string;
  condition: 'Working Good' | 'Minor Issue' | 'Not Working';
  estimatedValuation: number;
  selectedSamsungProductId?: string;
  customerName: string;
  phone: string;
  address: string;
  status: 'Estimated' | 'Inspection Scheduled in Rajbiraj' | 'Approved' | 'Completed';
  createdAt: string;
}

export interface FinanceApplication {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  downPaymentPercent: number; // minimum 40%
  downPaymentAmount: number;
  loanAmount: number;
  tenureMonths: 6 | 12 | 18 | 24;
  interestRatePercent: number; // 0% for <=12 months, 7.99% for >12 months
  interestAmount: number;
  totalLoanPayable: number;
  monthlyEmi: number;
  financePartner: 'Hulas Finance (Authorized Partner)';
  customerName: string;
  phone: string;
  isSimInOwnName: boolean;
  citizenshipNo: string;
  occupation: string;
  monthlyIncome: number;
  status: 'Application Submitted' | 'Under Review with Hulas Finance' | 'Pre-Approved' | 'Documentation Ready';
  createdAt: string;
}

export interface ServiceTicket {
  id: string;
  referenceCode: string;
  applianceType: string;
  brand: string;
  modelNumber?: string;
  issueDescription: string;
  purchasedFromKhan: boolean; // Supports ANY customer even if not bought from Khan!
  customerName: string;
  phone: string;
  address: string;
  preferredDate: string;
  status: 'Registered' | 'Technician Assigned' | 'Under Inspection' | 'Parts Ordered' | 'Service Completed';
  technician?: {
    name: string;
    phone: string;
    badge: string;
  };
  estimatedCost?: string;
  createdAt: string;
}

export interface RegisteredWarranty {
  id: string;
  productName: string;
  brand: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  purchasedFromKhan: boolean;
  status: 'Active Official Warranty' | 'Service Coverage Active' | 'Expired';
}

export interface SavedAddress {
  id: string;
  label: string; // e.g., 'Home', 'Office', 'Store Delivery'
  fullName: string;
  phone: string;
  province: string;
  district: string;
  municipality: string;
  wardNo: string;
  streetAddress: string;
  landmark?: string | null;
  isWithin5km: boolean;
  isDefault?: boolean;
}

export interface CustomerProfile {
  uid: string;
  fullName: string;
  phone: string;
  email: string;
  savedAddresses: SavedAddress[];
  memberTier: 'Regular Customer' | 'Khan Gold Family' | 'Showroom VIP';
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  memberTier: 'Regular Customer' | 'Khan Gold Family' | 'Showroom VIP';
}

export type FinanceTenureMonths = 6 | 9 | 12 | 24;

export type FinanceEnquiryStatus = 
  | 'New'
  | 'Under Review'
  | 'More Information Required'
  | 'Contact Store'
  | 'Approved'
  | 'Rejected'
  | 'Completed';

export interface FinanceEnquiry {
  enquiryId: string;
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
  status: FinanceEnquiryStatus;
  createdAt?: any;
  updatedAt?: any;
}
