import { Order, ServiceTicket, ExchangeRequest, FinanceApplication, RegisteredWarranty, CustomerUser } from '../types';

export const INITIAL_USER: CustomerUser = {
  id: 'usr-rajbiraj-01',
  name: 'Bikash Kumar Chaudhary',
  phone: '9804781290',
  email: 'bikash.chaudhary@gmail.com',
  address: 'Main Road, Ward No. 3, Near Mahavir Chowk',
  city: 'Rajbiraj, Saptari',
  memberTier: 'Khan Gold Family'
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'KE-2026-8819',
    createdAt: 'Yesterday, 2:30 PM',
    status: 'Out for Delivery',
    items: [
      {
        productId: 'samsung-refrig-253l',
        productName: 'Samsung 253L Digital Inverter Double Door Refrigerator',
        productImage: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80',
        brand: 'Samsung',
        price: 54990,
        quantity: 1
      }
    ],
    subtotal: 54990,
    deliveryFee: 0, // Free local within 5 km
    discount: 2000,
    total: 52990,
    shippingAddress: {
      fullName: 'Bikash Kumar Chaudhary',
      phone: '9804781290',
      city: 'Rajbiraj',
      wardNo: 'Ward No. 3',
      district: 'Saptari',
      province: 'Madhesh Province',
      landmark: 'Opposite District Hospital Gate',
      isWithin5km: true
    },
    deliveryType: 'Free Local Delivery (within 5 km Rajbiraj)',
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Pending',
    deliveryNote: 'Please call before arriving. 2-person handling team assigned.'
  },
  {
    id: 'KE-2026-6410',
    createdAt: 'Sep 21, 2026',
    status: 'Delivered',
    items: [
      {
        productId: 'crompton-ameo-mixer',
        productName: 'Crompton Ameo 750W Heavy Duty 4-Jar Mixer Grinder',
        productImage: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=400&q=80',
        brand: 'Crompton',
        price: 7490,
        quantity: 1
      },
      {
        productId: 'cg-rice-cooker-28l',
        productName: 'CG 2.8 Liter Deluxe Automatic Electric Rice Cooker',
        productImage: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=400&q=80',
        brand: 'CG',
        price: 4290,
        quantity: 1
      }
    ],
    subtotal: 11780,
    deliveryFee: 0,
    discount: 500,
    total: 11280,
    shippingAddress: {
      fullName: 'Bikash Kumar Chaudhary',
      phone: '9804781290',
      city: 'Rajbiraj',
      wardNo: 'Ward No. 3',
      district: 'Saptari',
      province: 'Madhesh Province',
      isWithin5km: true
    },
    deliveryType: 'Free Local Delivery (within 5 km Rajbiraj)',
    paymentMethod: 'Fonepay QR / Mobile Banking',
    paymentStatus: 'Paid'
  }
];

export const INITIAL_SERVICE_TICKETS: ServiceTicket[] = [
  {
    id: 'srv-01',
    referenceCode: 'SR-8821',
    applianceType: 'Refrigerator (Double Door)',
    brand: 'Whirlpool', // Notice: bought from another shop/city, but Khan Electronics repairs it!
    modelNumber: 'Neo-Fresh 265L',
    issueDescription: 'Cooling in freezer is fine, but bottom vegetable crisper compartment is not cooling adequately.',
    purchasedFromKhan: false, // EXPLICIT REQUIREMENT: Supports customers even if not purchased from Khan!
    customerName: 'Bikash Kumar Chaudhary',
    phone: '9804781290',
    address: 'Near Mahavir Chowk, Rajbiraj',
    preferredDate: 'Today (Priority Home Visit)',
    status: 'Technician Assigned',
    technician: {
      name: 'Rameshwar Yadav (Senior Technician)',
      phone: '9812345678',
      badge: 'Certified Multi-Brand Specialist • 9 Yrs Exp'
    },
    estimatedCost: 'Rs. 450 (Inspection Fee) + Parts if required',
    createdAt: 'Today, 9:15 AM'
  },
  {
    id: 'srv-02',
    referenceCode: 'SR-7409',
    applianceType: 'Washing Machine (Semi-Automatic)',
    brand: 'CG',
    issueDescription: 'Spin tub vibrates during high speed spin cycle. Drainage hose cleaned.',
    purchasedFromKhan: true,
    customerName: 'Bikash Kumar Chaudhary',
    phone: '9804781290',
    address: 'Ward No. 3, Rajbiraj',
    preferredDate: 'Last Week',
    status: 'Service Completed',
    technician: {
      name: 'Santosh Sharma',
      phone: '9809876543',
      badge: 'CG Authorized Technician'
    },
    estimatedCost: 'Free under Official Warranty',
    createdAt: 'Sep 28, 2026'
  }
];

export const INITIAL_EXCHANGE_REQUESTS: ExchangeRequest[] = [
  {
    id: 'EX-9921',
    applianceType: 'Old Single Door Refrigerator',
    currentBrand: 'LG 180L (2018 Model)',
    modelYear: '2018',
    condition: 'Working Good',
    estimatedValuation: 7500, // NPR 7,500 off on new Samsung
    selectedSamsungProductId: 'samsung-refrig-253l',
    customerName: 'Bikash Kumar Chaudhary',
    phone: '9804781290',
    address: 'Rajbiraj-3, Saptari',
    status: 'Inspection Scheduled in Rajbiraj',
    createdAt: 'Yesterday'
  }
];

export const INITIAL_FINANCE_APPLICATIONS: FinanceApplication[] = [
  {
    id: 'FIN-HULAS-4412',
    productId: 'samsung-washer-8kg',
    productName: 'Samsung 8.0 Kg AI EcoBubble Front Load Washer',
    productPrice: 84990,
    downPaymentPercent: 40, // Minimum 40%
    downPaymentAmount: 33996,
    loanAmount: 50994,
    tenureMonths: 12,
    interestRatePercent: 0,
    interestAmount: 0,
    totalLoanPayable: 50994,
    monthlyEmi: 4250,
    financePartner: 'Hulas Finance (Authorized Partner)',
    customerName: 'Bikash Kumar Chaudhary',
    phone: '9804781290',
    isSimInOwnName: true,
    citizenshipNo: '15-01-72-04891',
    occupation: 'Government Service / Business',
    monthlyIncome: 65000,
    status: 'Pre-Approved',
    createdAt: 'Oct 02, 2026'
  }
];

export const INITIAL_REGISTERED_WARRANTIES: RegisteredWarranty[] = [
  {
    id: 'warr-01',
    productName: 'Samsung 253L Digital Inverter Double Door Refrigerator',
    brand: 'Samsung',
    serialNumber: 'SAM-RF-2026-99210B',
    purchaseDate: 'Yesterday',
    warrantyExpiry: 'Oct 2046 (20-Year Compressor Warranty)',
    purchasedFromKhan: true,
    status: 'Active Official Warranty'
  },
  {
    id: 'warr-02',
    productName: 'Whirlpool Neo-Fresh 265L Refrigerator',
    brand: 'Whirlpool',
    serialNumber: 'WP-IND-44102-X',
    purchaseDate: 'June 2023',
    warrantyExpiry: 'Registered for Multi-Brand AMC Support in Rajbiraj',
    purchasedFromKhan: false, // Enrolled in Khan Electronics Service Coverage
    status: 'Service Coverage Active'
  }
];
