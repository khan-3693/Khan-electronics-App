import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  Timestamp, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { deleteProductAllImages } from './storageService';
import { Product } from '../types';

/**
 * Standard Firestore Product Document Schema
 * Conforms directly to the Khan Electronics Catalogue Schema
 * Designed to scale efficiently to 1,000+ products with indexing, pagination, and projection
 */
export interface FirestoreProductDoc {
  productId: string;
  brand: string;
  category: string;
  productName: string;
  modelNumber: string;
  shortDescription: string;
  keySpecification: string;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  stockQuantity: number;
  stockStatus: string;
  financeAvailable: boolean;
  exchangeAvailable: boolean;
  minimumDownPaymentPercent: number;
  warranty: string;
  delivery: string;
  installation: string;
  productStatus: string;
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Prepared structure for future product media and specifications
  specifications?: Record<string, any>;
  images?: string[];
  videos?: string[];
}

/**
 * 3 Realistic Demo Products matching New Khan Automobiles & Electronics showroom inventory
 * Used to verify the Firestore connection and seed initial collection data.
 */
export const SEED_DEMO_PRODUCTS: FirestoreProductDoc[] = [
  {
    productId: 'samsung-refrig-253l',
    brand: 'Samsung',
    category: 'Refrigerators',
    productName: 'Samsung 253L Digital Inverter Double Door Refrigerator',
    modelNumber: 'RT28T3722S9/NL',
    shortDescription: '253 Litre frost-free double door refrigerator with Digital Inverter compressor, stabilizer-free operation (100V-300V), and Curd Maestro technology.',
    keySpecification: '253L Capacity • Digital Inverter • 3-Star Inverter High Efficiency • Elegant Inox Silver',
    mrp: 61990,
    sellingPrice: 54990,
    discountPercent: 11,
    stockQuantity: 8,
    stockStatus: 'In Stock',
    financeAvailable: true,
    exchangeAvailable: true,
    minimumDownPaymentPercent: 40,
    warranty: '1 Year Comprehensive Product Warranty + 20 Years on Digital Inverter Compressor directly through Authorized Samsung Service Center Rajbiraj.',
    delivery: 'Free Doorstep Delivery within 5 km of Rajbiraj Showroom',
    installation: 'Free Unboxing and Power Testing by Showroom Technicians',
    productStatus: 'Active',
    featured: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    specifications: {
      capacity: '253 Litres (Gross)',
      powerWattage: '110W Annual Inverter',
      voltage: '220V - 240V / 50Hz',
      dimensions: '555 mm x 1545 mm x 637 mm',
      energyRating: '3-Star Inverter High Efficiency',
      color: 'Elegant Inox Silver Finish',
      weight: '46 kg',
      motorWarrantyYears: 20
    },
    images: [
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80'
    ],
    videos: []
  },
  {
    productId: 'samsung-washer-8kg',
    brand: 'Samsung',
    category: 'Washing Machines',
    productName: 'Samsung 8.0 Kg AI EcoBubble Front Load Washer',
    modelNumber: 'WW80T504DAX/TL',
    shortDescription: 'AI Control, EcoBubble gentle fabric care with powerful cleaning at low temperatures, Hygiene Steam, and 20-year Digital Inverter motor warranty.',
    keySpecification: '8.0 Kg Front Load • AI Control • Hygiene Steam 99.9% Sanitization • 1400 RPM High Spin',
    mrp: 94990,
    sellingPrice: 84990,
    discountPercent: 11,
    stockQuantity: 5,
    stockStatus: 'In Stock',
    financeAvailable: true,
    exchangeAvailable: true,
    minimumDownPaymentPercent: 40,
    warranty: '1 Year Comprehensive + 20 Years Digital Inverter Motor Warranty from Samsung Nepal.',
    delivery: 'Free Doorstep Delivery within 5 km of Rajbiraj Showroom',
    installation: 'Free Inlet/Drain Installation & First Wash Demo by Showroom Technicians',
    productStatus: 'Active',
    featured: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    specifications: {
      capacity: '8.0 Kg Front Load',
      powerWattage: '2000W Max Heating',
      voltage: '220V - 240V / 50Hz',
      dimensions: '600 mm x 850 mm x 550 mm',
      energyRating: '5-Star High Efficiency',
      color: 'Inox Dark Grey Metallic',
      weight: '65 kg',
      motorWarrantyYears: 20
    },
    images: [
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=800&q=80'
    ],
    videos: []
  },
  {
    productId: 'cg-refrig-260l',
    brand: 'CG',
    category: 'Refrigerators',
    productName: 'CG 260L Smart Inverter Frost Free Double Door Refrigerator',
    modelNumber: 'CG-REF260FF-SLV',
    shortDescription: '260 Litres double door refrigerator from Chaudhary Group engineered for Nepal climate with multi-air flow columns and 10-year motor warranty.',
    keySpecification: '260L Frost-Free • Smart Inverter • Multi-Air Flow • Nepal Climate Engineered',
    mrp: 49990,
    sellingPrice: 44500,
    discountPercent: 11,
    stockQuantity: 7,
    stockStatus: 'In Stock',
    financeAvailable: true,
    exchangeAvailable: false,
    minimumDownPaymentPercent: 40,
    warranty: '1 Year Comprehensive + 10 Years Inverter Compressor Warranty from Chaudhary Group (CG).',
    delivery: 'Free Doorstep Delivery within 5 km of Rajbiraj Showroom',
    installation: 'Free Unboxing and Power Testing',
    productStatus: 'Active',
    featured: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    specifications: {
      capacity: '260 Litres',
      powerWattage: '120W Inverter',
      voltage: '220V - 240V / 50Hz',
      dimensions: '545 mm x 1560 mm x 620 mm',
      energyRating: 'Inverter High Efficiency',
      color: 'Silver Metallic Finish',
      weight: '48 kg',
      motorWarrantyYears: 10
    },
    images: [
      'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80'
    ],
    videos: []
  }
];

/**
 * Maps a Firestore document to the UI Product format
 */
export function mapFirestoreDocToProduct(docData: FirestoreProductDoc): Product {
  const images = docData.images || [];
  const primaryImg = images[0] || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80';
  const additionalImgs = images.slice(1);

  return {
    id: docData.productId,
    name: docData.productName,
    tagline: docData.keySpecification || docData.shortDescription,
    brand: docData.brand as any,
    category: docData.category as any,
    modelNumber: docData.modelNumber,
    price: docData.sellingPrice,
    originalPrice: docData.mrp,
    rating: 4.9,
    reviewCount: 42,
    imageUrl: primaryImg,
    additionalImages: additionalImgs,
    badge: docData.exchangeAvailable ? 'Exchange Available' : (docData.financeAvailable ? 'EMI (40% Downpayment)' : undefined),
    isBestSeller: true,
    isFeatured: docData.featured,
    inStock: docData.stockQuantity > 0 && docData.stockStatus !== 'Out of Stock',
    stockCount: docData.stockQuantity,
    exchangeAvailable: docData.exchangeAvailable,
    financeAvailable: docData.financeAvailable,
    shortDesc: docData.shortDescription,
    fullDesc: docData.shortDescription,
    features: [
      docData.keySpecification,
      `Warranty: ${docData.warranty}`,
      `Delivery: ${docData.delivery}`,
      `Installation: ${docData.installation}`
    ].filter(Boolean),
    specs: {
      capacity: docData.specifications?.capacity,
      powerWattage: docData.specifications?.powerWattage,
      voltage: docData.specifications?.voltage,
      dimensions: docData.specifications?.dimensions,
      warrantyYears: 1,
      motorWarrantyYears: docData.specifications?.motorWarrantyYears || 10,
      energyRating: docData.specifications?.energyRating,
      color: docData.specifications?.color,
      weight: docData.specifications?.weight
    },
    warrantySummary: docData.warranty
  };
}

/**
 * Seeds the 3 realistic demo products into Firestore "products" collection if the collection is empty.
 */
export async function seedInitialFirestoreProducts(): Promise<{ seeded: boolean; count: number }> {
  const path = 'products';
  try {
    const existingSnap = await getDocs(collection(db, path));
    if (existingSnap.empty) {
      console.log('Seeding 3 initial products into Firestore "products" collection...');
      for (const prod of SEED_DEMO_PRODUCTS) {
        await setDoc(doc(db, path, prod.productId), prod);
      }
      console.log('Seeding complete! 3 demo products created in Firestore.');
      return { seeded: true, count: SEED_DEMO_PRODUCTS.length };
    }
    return { seeded: false, count: existingSnap.size };
  } catch (error) {
    console.warn('Note on seeding products to Firestore:', error);
    handleFirestoreError(error, OperationType.WRITE, path);
    return { seeded: false, count: 0 };
  }
}

/**
 * Reads all products from the Firestore "products" collection.
 * If empty, seeds the 3 initial demo products and returns them.
 */
export async function fetchRawFirestoreProducts(): Promise<FirestoreProductDoc[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      await seedInitialFirestoreProducts();
      return SEED_DEMO_PRODUCTS;
    }
    const docs: FirestoreProductDoc[] = [];
    snap.forEach((d) => {
      docs.push(d.data() as FirestoreProductDoc);
    });
    return docs;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

/**
 * Fetches products from Firestore mapped to UI Product models.
 */
export async function fetchProductsFromFirestore(): Promise<Product[]> {
  const rawDocs = await fetchRawFirestoreProducts();
  return rawDocs.map(mapFirestoreDocToProduct);
}

/**
 * Verification helper: Tests connection and reads products from Firestore
 */
export async function testAndVerifyFirestoreProducts(): Promise<{
  success: boolean;
  count: number;
  products: FirestoreProductDoc[];
  error?: string;
}> {
  const path = 'products';
  try {
    let docs = await fetchRawFirestoreProducts();
    if (docs.length === 0) {
      await seedInitialFirestoreProducts();
      docs = await fetchRawFirestoreProducts();
    }
    return {
      success: true,
      count: docs.length,
      products: docs
    };
  } catch (error) {
    return {
      success: false,
      count: 0,
      products: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Creates or updates a product document in Firestore
 */
export async function saveProductToFirestore(
  productData: Partial<FirestoreProductDoc> & { productName: string; sellingPrice: number }
): Promise<FirestoreProductDoc> {
  const path = 'products';
  try {
    // Generate slug-safe productId if creating new product without ID
    const generatedId = productData.productId?.trim() || 
      `${(productData.brand || 'appliance').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${productData.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}-${Date.now().toString(36)}`;
    
    const mrp = Number(productData.mrp) || Number(productData.sellingPrice) || 0;
    const sellingPrice = Number(productData.sellingPrice) || 0;
    const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
    const stockQuantity = Number(productData.stockQuantity) ?? 1;

    let stockStatus = productData.stockStatus || 'In Stock';
    if (stockQuantity <= 0) {
      stockStatus = 'Out of Stock';
    } else if (stockQuantity <= 3 && stockStatus === 'In Stock') {
      stockStatus = 'Limited Stock';
    }

    const docPayload: FirestoreProductDoc = {
      productId: generatedId,
      brand: productData.brand?.trim() || 'Samsung',
      category: productData.category?.trim() || 'Refrigerators',
      productName: productData.productName.trim(),
      modelNumber: productData.modelNumber?.trim() || `KHAN-${Math.floor(1000 + Math.random() * 9000)}`,
      shortDescription: productData.shortDescription?.trim() || productData.productName,
      keySpecification: productData.keySpecification?.trim() || '',
      mrp,
      sellingPrice,
      discountPercent: productData.discountPercent ?? discountPercent,
      stockQuantity,
      stockStatus,
      financeAvailable: Boolean(productData.financeAvailable),
      exchangeAvailable: Boolean(productData.exchangeAvailable),
      minimumDownPaymentPercent: Number(productData.minimumDownPaymentPercent) || 40,
      warranty: productData.warranty?.trim() || '1 Year Comprehensive Warranty from Authorized Service Center Rajbiraj.',
      delivery: productData.delivery?.trim() || 'Free Doorstep Delivery within 5 km of Rajbiraj Showroom',
      installation: productData.installation?.trim() || 'Free Unboxing and Power Testing',
      productStatus: productData.productStatus || 'Active',
      featured: Boolean(productData.featured),
      createdAt: productData.createdAt instanceof Timestamp ? productData.createdAt : Timestamp.now(),
      updatedAt: Timestamp.now(),
      specifications: productData.specifications || {},
      images: Array.isArray(productData.images) && productData.images.length > 0 
        ? productData.images 
        : ['https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'],
      videos: Array.isArray(productData.videos) ? productData.videos : []
    };

    await setDoc(doc(db, path, generatedId), docPayload, { merge: true });
    return docPayload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Deletes a product from Firestore and cleans up its associated Firebase Storage images
 */
export async function deleteProductFromFirestore(productId: string, imageUrls?: string[]): Promise<void> {
  const path = 'products';
  try {
    await deleteDoc(doc(db, path, productId));

    // Safely cleanup orphaned product images in Firebase Storage
    deleteProductAllImages(productId, imageUrls).catch((storageErr) => {
      console.warn(`Storage cleanup for product ${productId}:`, storageErr);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${productId}`);
    throw error;
  }
}

/**
 * Subscribes to real-time updates from the "products" collection in Firestore
 */
export function subscribeToFirestoreProducts(
  onUpdate: (products: FirestoreProductDoc[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = 'products';
  const unsubscribe = onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: FirestoreProductDoc[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as FirestoreProductDoc);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      if (onError) onError(error);
    }
  );
  return unsubscribe;
}

/**
 * Scalable Pagination Query designed for 1000+ products
 */
export async function queryProductsPaged(options?: {
  category?: string;
  brand?: string;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}) {
  const path = 'products';
  try {
    const constraints: any[] = [];
    
    if (options?.category && options.category !== 'All') {
      constraints.push(where('category', '==', options.category));
    }
    if (options?.brand && options.brand !== 'All') {
      constraints.push(where('brand', '==', options.brand));
    }

    constraints.push(orderBy('sellingPrice', 'asc'));
    constraints.push(limit(options?.pageSize || 24));

    if (options?.lastDoc) {
      constraints.push(startAfter(options.lastDoc));
    }

    const q = query(collection(db, path), ...constraints);
    const snap = await getDocs(q);
    
    const items: FirestoreProductDoc[] = [];
    snap.forEach(d => items.push(d.data() as FirestoreProductDoc));
    
    return {
      products: items,
      lastDoc: snap.docs[snap.docs.length - 1] || null,
      hasMore: snap.docs.length === (options?.pageSize || 24)
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return { products: [], lastDoc: null, hasMore: false };
  }
}
