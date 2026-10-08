import { Product } from '../types';

// Helper map to ensure consistent model numbers
const PRODUCT_MODEL_MAP: Record<string, string> = {
  'samsung-refrig-253l': 'RT28T3722S9/NL',
  'samsung-refrig-192l': 'RR19A241BGS/NL',
  'cg-refrig-260l': 'CG-REF260FF-SLV',
  'godrej-refrig-236l': 'RD-EDG-236D-INOX',
  'konka-refrig-185l': 'KR-185DC-TITAN',
  'samsung-washer-8kg': 'WW80T504DAX/TL',
  'cg-washer-75kg': 'CG-WM75FL-WHT',
  'midea-washer-7kg': 'MF200W70WB-GRY',
  'godrej-washer-8kg-semi': 'WS-EDGE-800-ROSE',
  'crompton-ameo-mixer': 'AMEO-750-3JAR',
  'cg-powergrind-mixer': 'CG-MG7504-PWR',
  'khaitan-500w-mixer': 'KHAITAN-MGC-500',
  'cg-rice-cooker-28l': 'CG-RC280-DLX',
  'force-rice-cooker-18l': 'FORCE-RC18-SS',
  'midea-induction-cooktop': 'MC-ST2106-TCH',
  'chigo-infrared-cooker': 'CH-IR2000-CER',
  'crompton-aura-fan': 'AURA-1200-TITAN',
  'khaitan-stand-fan': 'KHAITAN-HS-400',
  'midea-ac-15ton': 'MSAGB-18CRN1',
  'tcl-tv-43-4k': '43P635-4K-GGL',
  'samsung-tv-55-crystal': 'UA55CU7700KXXL'
};

const CATEGORY_GALLERY_FALLBACKS: Record<string, string[]> = {
  'Refrigerators': [
    'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'
  ],
  'Washing Machines': [
    'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=800&q=80'
  ],
  'Televisions': [
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80'
  ],
  'Mixer Grinders': [
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80'
  ],
  'Rice Cookers': [
    'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80'
  ],
  'Kitchen & Cooking': [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80'
  ],
  'Cooling & Heating': [
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80'
  ]
};

const RAW_KHAN_PRODUCTS: Product[] = [
  {
    id: 'samsung-refrig-253l',
    name: 'Samsung 253L Digital Inverter Double Door Refrigerator',
    tagline: 'Curd Maestro, Smart Connect Inverter & Toughened Glass Shelves',
    brand: 'Samsung',
    category: 'Refrigerators',
    price: 54990,
    originalPrice: 61990,
    rating: 4.9,
    reviewCount: 88,
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    additionalImages: [
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80'
    ],
    badge: 'Samsung Exchange Special',
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 8,
    exchangeAvailable: true,
    financeAvailable: true,
    shortDesc: '253 Litre frost-free double door refrigerator with Digital Inverter compressor, stabilizer-free operation (100V-300V), and Curd Maestro technology.',
    fullDesc: 'The Samsung 253L Double Door Refrigerator is designed specifically for South Asian households with Curd Maestro to prepare fresh curd in all seasons. Digital Inverter Technology automatically adjusts compressor speed across 7 cooling levels, saving up to 50% power and backed by a 20-year warranty on the compressor. Eligible for instant old appliance exchange at Khan Electronics Rajbiraj showroom.',
    features: [
      'Curd Maestro: Make fresh, hygienic curd consistently',
      'Digital Inverter with 20-Year Compressor Warranty',
      'All-Around Cooling vents for uniform temperature',
      'Stabilizer-Free Operation (100V - 300V) for Nepal power fluctuations',
      'Deodorizing Filter preserves natural food aromas',
      'Toughened Glass Shelves holding up to 175 kg'
    ],
    specs: {
      capacity: '253 Litres (Gross)',
      powerWattage: '110W Annual Inverter',
      voltage: '220V - 240V / 50Hz',
      dimensions: '555 mm x 1545 mm x 637 mm',
      warrantyYears: 1,
      motorWarrantyYears: 20,
      energyRating: '3-Star Inverter High Efficiency',
      color: 'Elegant Inox Silver Finish',
      weight: '46 kg',
      specialFeatures: ['Curd Maestro', 'Easy Slide Shelf', 'Movable Ice Maker']
    },
    warrantySummary: '1 Year Comprehensive Product Warranty + 20 Years on Digital Inverter Compressor directly through Authorized Samsung Service Center Rajbiraj.'
  },
  {
    id: 'samsung-refrig-192l',
    name: 'Samsung 192L Direct Cool Single Door Refrigerator with Base Drawer',
    tagline: 'Crown Door Design, Deep Door Guard & Base Stand Drawer',
    brand: 'Samsung',
    category: 'Refrigerators',
    price: 34990,
    originalPrice: 38990,
    rating: 4.8,
    reviewCount: 114,
    imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Exchange Available',
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 12,
    exchangeAvailable: true,
    financeAvailable: true,
    shortDesc: '192L single door refrigerator featuring base stand drawer for non-refrigerated dry vegetables (potatoes/onions), runs on home inverter.',
    fullDesc: 'Perfect for modern Nepali families. Comes with a stylish Grande Door design and fine curved lines. The extra large base stand drawer provides convenient storage for root vegetables without taking up counter space. Compatible with solar and inverter backup during load shedding.',
    features: [
      'Base Stand Drawer for room-temperature vegetables',
      'Connects seamlessly to home inverter during power cuts',
      'Toughened Glass Shelves safely hold heavy handis and watermelons',
      'Anti-Bacterial Gasket prevents fungal spores',
      'Deep door guard stores up to 4 large 2-liter bottles'
    ],
    specs: {
      capacity: '192 Litres',
      powerWattage: '90W Inverter',
      voltage: '130V - 290V Stabilizer Free',
      dimensions: '532 mm x 1330 mm x 594 mm',
      warrantyYears: 1,
      motorWarrantyYears: 20,
      energyRating: '4-Star Equivalent Energy Saver',
      color: 'Paradise Camellia Blue Floral Print',
      weight: '34 kg'
    },
    warrantySummary: '1 Year Product Warranty + 20 Years Inverter Compressor Warranty from Samsung Nepal.'
  },
  {
    id: 'cg-refrig-260l',
    name: 'CG 260L Smart Inverter Frost Free Double Door Refrigerator',
    tagline: 'Chaudhary Group Precision Cooling with Multi-Air Flow',
    brand: 'CG',
    category: 'Refrigerators',
    price: 44500,
    originalPrice: 49990,
    rating: 4.7,
    reviewCount: 62,
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Nepal Pride / CG Brand',
    isBestSeller: false,
    isFeatured: true,
    inStock: true,
    stockCount: 7,
    exchangeAvailable: false,
    financeAvailable: true,
    shortDesc: '260 Litres double door refrigerator from Chaudhary Group (CG) engineered for Nepal climate with multi-air flow columns and 10-year motor warranty.',
    fullDesc: 'Proudly backed by Nepal\'s largest consumer brand, Chaudhary Group. Featuring Smart Inverter technology that delivers precise temperature control, anti-bacterial air filters, and heavy-duty wire shelves. Accessible servicing at Khan Electronics Rajbiraj.',
    features: [
      'Multi-Air Flow 360-degree cooling',
      'Super Freeze express ice-making cycle',
      'Eco-friendly R600a refrigerant',
      'Large Vegetable Crisper with humidity regulator',
      '10-Year Inverter Compressor Warranty'
    ],
    specs: {
      capacity: '260 Litres',
      powerWattage: '105W',
      voltage: '160V - 260V 50Hz',
      dimensions: '550 mm x 1560 mm x 600 mm',
      warrantyYears: 1,
      motorWarrantyYears: 10,
      energyRating: 'High Efficiency 3-Star',
      color: 'Metallic Hairline Grey',
      weight: '44 kg'
    },
    warrantySummary: '1 Year Full Warranty + 10 Years Inverter Compressor Warranty supported by CG Service Network in Rajbiraj.'
  },
  {
    id: 'godrej-refrig-236l',
    name: 'Godrej 236L Edge Neo Inverter Frost Free Refrigerator',
    tagline: 'Cool Shower Technology, 95L Largest Freezer Space & Aroma Lock',
    brand: 'Godrej',
    category: 'Refrigerators',
    price: 42900,
    originalPrice: 47500,
    rating: 4.7,
    reviewCount: 43,
    imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'EMI Available',
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 6,
    exchangeAvailable: false,
    financeAvailable: true,
    shortDesc: 'Frost free double door refrigerator with unique Cool Shower ceiling vents and largest freezer compartment in its segment.',
    fullDesc: 'Godrej Edge Neo comes equipped with ceiling-mounted air ducts that shower cold air directly over produce to maintain farm freshness up to 30 days. Includes Aroma Lock technology to eliminate unpleasant garlic and onion odours.',
    features: [
      'Cool Shower Technology for 360-degree top-down airflow',
      'Largest 95L Freezer compartment for ice cream and frozen meats',
      'Zinc Oxide Anti-Bacterial coating on air vents',
      '10-Year Inverter Compressor Warranty'
    ],
    specs: {
      capacity: '236 Litres',
      voltage: '140V - 260V',
      dimensions: '577 mm x 1437 mm x 667 mm',
      warrantyYears: 1,
      motorWarrantyYears: 10,
      energyRating: 'Inverter Grade 3-Star',
      color: 'Pacific Wine Floral Texture'
    },
    warrantySummary: '1 Year Comprehensive + 10 Years on Compressor through Godrej Authorized Service.'
  },
  {
    id: 'konka-refrig-185l',
    name: 'Konka 185L Ultra-Save Single Door Refrigerator',
    tagline: 'Reliable Direct Cool, Thick PUF Insulation & Value King',
    brand: 'Konka',
    category: 'Refrigerators',
    price: 24900,
    originalPrice: 28500,
    rating: 4.6,
    reviewCount: 38,
    imageUrl: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Best Value Budget Pick',
    isBestSeller: true,
    isFeatured: false,
    inStock: true,
    stockCount: 15,
    exchangeAvailable: false,
    financeAvailable: false,
    shortDesc: 'Affordable and durable 185L single door refrigerator featuring thick PUF insulation that keeps food cold for 9 hours during power cuts.',
    fullDesc: 'An exceptional value choice for student hostels, small shops, and budget-conscious homes in Saptari district. Built with high-density cyclopentane insulation and low noise compressor.',
    features: [
      'High density 65mm insulation retains cooling up to 9 hours',
      'Rapid Ice Making in 45 minutes',
      'Low power consumption (less than 1 unit/day)',
      'Heavy-duty adjustable wire shelves'
    ],
    specs: {
      capacity: '185 Litres',
      powerWattage: '85W',
      voltage: '220V / 50Hz',
      dimensions: '520 mm x 1180 mm x 530 mm',
      warrantyYears: 1,
      motorWarrantyYears: 5,
      color: 'Ruby Red Glossy'
    },
    warrantySummary: '1 Year Warranty on Parts + 5 Years on Compressor at Khan Electronics Service Center.'
  },
  {
    id: 'samsung-washer-8kg',
    name: 'Samsung 8.0 Kg AI EcoBubble Front Load Washing Machine',
    tagline: 'Hygiene Steam 99.9%, AI Control & Digital Inverter Motor',
    brand: 'Samsung',
    category: 'Washing Machines',
    price: 84990,
    originalPrice: 94990,
    rating: 4.9,
    reviewCount: 76,
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Samsung Exchange Special',
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 5,
    exchangeAvailable: true,
    financeAvailable: true,
    shortDesc: '8.0 Kg front load washer with AI Control, EcoBubble bubbles that penetrate fabric 40x faster, and Hygiene Steam for 99.9% allergen removal.',
    fullDesc: 'The flagship Samsung AI EcoBubble front load washer cleans clothes with precision while saving energy. EcoBubble converts detergent into micro-bubbles so it quickly penetrates fabrics even in cold water. Hygiene Steam releases steam from the bottom of the drum to sanitize garments thoroughly. Eligible for old washing machine exchange at Khan Electronics.',
    features: [
      'EcoBubble Technology: cleans effectively even at 15°C',
      'Hygiene Steam Cycle sanitizes clothes, killing 99.9% bacteria',
      'Digital Inverter Motor with 20-Year Warranty',
      'Drum Clean+ removes 99.9% of odor-causing bacteria from drum',
      '1400 RPM spin speed for faster drying during Terai monsoons'
    ],
    specs: {
      capacity: '8.0 Kg Dry Load',
      powerWattage: '2000W with Built-in Heater',
      voltage: '220V - 240V / 50Hz',
      dimensions: '600 mm x 850 mm x 550 mm',
      warrantyYears: 1,
      motorWarrantyYears: 20,
      color: 'Platinum Inox Steel',
      weight: '65 kg'
    },
    warrantySummary: '1 Year Full Machine Warranty + 20 Years Digital Inverter Motor Warranty from Samsung Nepal.'
  },
  {
    id: 'cg-washer-75kg',
    name: 'CG 7.5 Kg Fully Automatic Top Load Washing Machine',
    tagline: 'Fuzzy Logic, Waterfall Wash & Soft-Close Glass Lid',
    brand: 'CG',
    category: 'Washing Machines',
    price: 38900,
    originalPrice: 43500,
    rating: 4.8,
    reviewCount: 51,
    imageUrl: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'EMI Available',
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 9,
    exchangeAvailable: false,
    financeAvailable: true,
    shortDesc: '7.5 Kg top loader with one-touch Fuzzy Logic that measures laundry weight, auto-regulates water level, and delivers 3D Waterfall scrubbing.',
    fullDesc: 'Engineered for simplicity and durability. The stainless steel diamond drum protects delicate fabrics, while dual lint magic filters catch threads. The hydraulic soft-close glass lid prevents slam damages.',
    features: [
      'One-Touch Fuzzy Logic automatic program selection',
      '3D Waterfall Pulsator removes stubborn clay and mud stains',
      'Child Lock & Memory Power Backup',
      'Rust-proof fiber body suitable for humid Terai climate'
    ],
    specs: {
      capacity: '7.5 Kg',
      powerWattage: '400W Wash Motor',
      voltage: '220V / 50Hz',
      dimensions: '540 mm x 920 mm x 550 mm',
      warrantyYears: 2,
      motorWarrantyYears: 10,
      color: 'Charcoal Grey with Black Tempered Glass Lid'
    },
    warrantySummary: '2 Years Comprehensive Warranty + 10 Years on Motor with authorized CG technician support in Rajbiraj.'
  },
  {
    id: 'midea-washer-7kg',
    name: 'Midea 7.0 Kg Smart Inverter Front Load Washing Machine',
    tagline: 'Lunar Dial Display, 15-Minute Quick Wash & Health Shield 90°C',
    brand: 'Midea',
    category: 'Washing Machines',
    price: 52900,
    originalPrice: 59900,
    rating: 4.7,
    reviewCount: 29,
    imageUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Finance Available',
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 6,
    exchangeAvailable: false,
    financeAvailable: true,
    shortDesc: '7 Kg front load washer with integrated Lunar Dial program selector, high-temp 90°C sterilization, and BLDC inverter motor.',
    fullDesc: 'World-renowned Midea engineering featuring an ultra-quiet BLDC inverter motor, high temperature boil-wash for bedsheets and towels, and a 15-minute quick refresh cycle for everyday shirts.',
    features: [
      'Lunar Dial: knob with built-in digital screen display',
      '90°C High Temperature Sterilization Cycle',
      'BLDC Quiet Inverter Motor cuts noise below 56 dB',
      '1200 RPM high speed spin'
    ],
    specs: {
      capacity: '7.0 Kg',
      powerWattage: '1950W Heater',
      voltage: '220V - 240V',
      dimensions: '595 mm x 850 mm x 495 mm',
      warrantyYears: 2,
      motorWarrantyYears: 10,
      color: 'Titanium Grey'
    },
    warrantySummary: '2 Years Comprehensive Warranty + 10 Years Inverter Motor Warranty from Midea Authorized Distributor.'
  },
  {
    id: 'godrej-washer-8kg-semi',
    name: 'Godrej 8.0 Kg Semi-Automatic Toughened Glass Twin Tub Washer',
    tagline: 'Tri-Roto Pulsator, 460W Power Max Motor & Toughened Glass Lids',
    brand: 'Godrej',
    category: 'Washing Machines',
    price: 26500,
    originalPrice: 29900,
    rating: 4.8,
    reviewCount: 94,
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Popular Household Choice',
    isBestSeller: true,
    isFeatured: false,
    inStock: true,
    stockCount: 14,
    exchangeAvailable: false,
    financeAvailable: true,
    shortDesc: 'Durable 8.0 Kg twin-tub semi-automatic washer with 460W high-torque motor, dual water inlet, and scratch-resistant borderless glass lids.',
    fullDesc: 'The quintessential heavy-duty washer for Terai homes. Handles thick blankets, jeans, and daily laundry with low water usage and runs easily on small generator or inverter backup.',
    features: [
      'Tri-Roto Pulsator with 3 directional water swirls',
      'Toughened Glass Lids with soft-close damping',
      'Active Soak feature loosens tough dirt before wash',
      'Rust-proof polypropylene body'
    ],
    specs: {
      capacity: '8.0 Kg Wash / 5.5 Kg Spin',
      powerWattage: '460W Wash / 180W Spin',
      voltage: '230V / 50Hz',
      dimensions: '820 mm x 970 mm x 485 mm',
      warrantyYears: 2,
      motorWarrantyYears: 5,
      color: 'Graphite Black with Floral Glass'
    },
    warrantySummary: '2 Years Comprehensive Warranty + 5 Years on Wash Motor directly serviced in Rajbiraj.'
  },
  {
    id: 'crompton-ameo-mixer',
    name: 'Crompton Ameo 750W Heavy Duty 4-Jar Mixer Grinder',
    tagline: 'MaxiGrind Technology, 100% Copper Motor & Chrome Finish',
    brand: 'Crompton',
    category: 'Mixer Grinders',
    price: 7490,
    originalPrice: 8590,
    rating: 4.9,
    reviewCount: 122,
    imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Top Rated Kitchen Pick',
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 22,
    exchangeAvailable: false,
    financeAvailable: true,
    shortDesc: '750 Watt 100% copper motor with MaxiGrind technology for fine turmeric grinding, idli batter, and fruit juices with 4 stainless steel jars.',
    fullDesc: 'Engineered with overload protection and heavy gauge flow breaker jars. Effortlessly grinds tough whole spices, roasted coriander, hard turmeric root, and blends milkshakes with its dedicated 1.5L juicer extractor jar.',
    features: [
      '750W 100% Copper Winding Motor for continuous grinding',
      'MaxiGrind technology keeps motors cooler for longer life',
      '4 Ergonomic Jars: 1.5L Wet, 1.0L Dry, 0.4L Chutney, 1.5L Blender',
      '3-Speed Control with Incher pulse function',
      'Overload Protection trip switch'
    ],
    specs: {
      powerWattage: '750W High Torque',
      voltage: '220V - 240V / 50Hz',
      warrantyYears: 2,
      motorWarrantyYears: 5,
      color: 'Royal Black with Chrome Knob Accents',
      specialFeatures: ['Leak-proof Jar Lids', 'Suction Rubber Feet']
    },
    warrantySummary: '2 Years Product Warranty + 5 Years Motor Warranty supported at Khan Electronics Rajbiraj.'
  },
  {
    id: 'cg-powergrind-mixer',
    name: 'CG PowerGrind 750W Turbo Motor Mixer Grinder (3 Jars)',
    tagline: 'High Speed Stainless Steel Blades & Sturdy Shockproof Body',
    brand: 'CG',
    category: 'Mixer Grinders',
    price: 5890,
    originalPrice: 6750,
    rating: 4.7,
    reviewCount: 68,
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Popular CG Kitchen',
    isBestSeller: true,
    isFeatured: false,
    inStock: true,
    stockCount: 18,
    exchangeAvailable: false,
    financeAvailable: true,
    shortDesc: '750W high-speed mixer grinder with 3 stainless steel heavy jars, razor-sharp multi-angle blades, and non-slip rubber base.',
    fullDesc: 'A staple in Nepali kitchens. Perfect for wet masalas, ginger-garlic paste, dry cumin powder, and coconut chutneys. Built with durable ABS housing.',
    features: [
      '750W Heavy-duty motor running at 20,000 RPM',
      'Food Grade 304 Stainless Steel Jars and Blades',
      'Self-lubricating bronze sintered bushes',
      'Ergonomic handles for firm grip'
    ],
    specs: {
      powerWattage: '750W',
      voltage: '220V / 50Hz',
      warrantyYears: 2,
      motorWarrantyYears: 3,
      color: 'Bright White with Cyan Trim'
    },
    warrantySummary: '2 Years Full Warranty + 3 Years Motor Warranty backed by CG Service Center.'
  },
  {
    id: 'khaitan-500w-mixer',
    name: 'Khaitan 500W Copper Motor 3-Jar Mixer Grinder',
    tagline: 'Compact, Energy-Efficient & Dependable Everyday Grinding',
    brand: 'Khaitan',
    category: 'Mixer Grinders',
    price: 3690,
    originalPrice: 4290,
    rating: 4.6,
    reviewCount: 45,
    imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Budget Friendly',
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 25,
    exchangeAvailable: false,
    financeAvailable: false,
    shortDesc: 'Affordable 500W mixer grinder with 3 stainless steel jars. Ideal for daily family chutney, garam masala, and puree grinding.',
    fullDesc: 'Compact footprint that fits neatly on small kitchen slabs. Low power consumption with dependable copper motor and automatic thermal reset.',
    features: [
      '500W Copper motor with thermal overload cutoff',
      '3 Stainless Steel Jars (1.2L Liquidizing, 0.8L Dry, 0.3L Chutney)',
      'Sharp stainless steel cutting blades',
      'Durable ABS shockproof plastic body'
    ],
    specs: {
      powerWattage: '500W',
      voltage: '220V',
      warrantyYears: 1,
      color: 'Classic White & Maroon'
    },
    warrantySummary: '1 Year Brand Warranty with quick local service at Khan Electronics Rajbiraj.'
  },
  {
    id: 'cg-rice-cooker-28l',
    name: 'CG 2.8 Liter Deluxe Automatic Electric Rice Cooker with Steamer',
    tagline: 'Keep Warm Function, Non-Stick Inner Pot & Steaming Basket Included',
    brand: 'CG',
    category: 'Rice Cookers',
    price: 4290,
    originalPrice: 4890,
    rating: 4.8,
    reviewCount: 104,
    imageUrl: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Family Size / 8-12 Persons',
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 30,
    exchangeAvailable: false,
    financeAvailable: true,
    shortDesc: '2.8L capacity deluxe automatic rice cooker that cooks up to 1.5 kg of raw rice. Includes aluminum steam tray for momos and vegetables.',
    fullDesc: 'Cooks fluffy Basmati or Sona Masoori rice automatically and switches to Keep Warm mode for up to 5 hours. Complete with measuring cup, rice spoon, and heavy gauge anodized cooking pot.',
    features: [
      '2.8 Litre large capacity for families and gatherings',
      'Automatic Cook-to-Warm transition sensor',
      'Includes food-grade aluminum Steamer Basket (great for Momos)',
      'Durable heating plate with thermal fuse safety'
    ],
    specs: {
      capacity: '2.8 Litres (Raw Rice up to 1.5 kg)',
      powerWattage: '1000W High Speed Heating',
      voltage: '220V - 240V',
      warrantyYears: 1,
      color: 'Stainless Steel Pattern with Glass Lid'
    },
    warrantySummary: '1 Year Comprehensive Warranty from Chaudhary Group (CG).'
  },
  {
    id: 'force-rice-cooker-18l',
    name: 'Force 1.8 Liter Heavy Gauge Inner Pot Electric Rice Cooker',
    tagline: 'Easy Single Switch Operation, Anodized Pot & Cool Touch Handles',
    brand: 'Force',
    category: 'Rice Cookers',
    price: 2990,
    originalPrice: 3490,
    rating: 4.7,
    reviewCount: 79,
    imageUrl: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Popular Everyday Cooker',
    isBestSeller: true,
    isFeatured: false,
    inStock: true,
    stockCount: 40,
    exchangeAvailable: false,
    financeAvailable: false,
    shortDesc: '1.8L capacity electric rice cooker suitable for 4 to 6 people. Reliable, energy-saving, and built with an extra-thick aluminum pot.',
    fullDesc: 'Force appliances are known across eastern Nepal for solid heating elements and dependable day-in day-out cooking. Prepares rice, khichdi, or porridge effortlessly.',
    features: [
      '1.8L capacity ideal for standard 4-6 member families',
      'One-touch automatic cook and warm operation',
      'Sturdy stainless steel lid with steam vent',
      'High-grade aluminum heating coil for even heat distribution'
    ],
    specs: {
      capacity: '1.8 Litres',
      powerWattage: '700W',
      voltage: '220V',
      warrantyYears: 1,
      color: 'White Floral Decorative Pattern'
    },
    warrantySummary: '1 Year Warranty supported at Khan Electronics.'
  },
  {
    id: 'midea-induction-cooktop',
    name: 'Midea 2000W Feather Touch Smart Induction Cooktop',
    tagline: '8 Preset Cooking Menus, Crystal Black Glass & Flame-Free Safety',
    brand: 'Midea',
    category: 'Kitchen & Cooking',
    price: 5490,
    originalPrice: 6490,
    rating: 4.8,
    reviewCount: 83,
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'LPG Gas Saver',
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 16,
    exchangeAvailable: false,
    financeAvailable: true,
    shortDesc: '2000W feather touch induction cooktop with A-grade polished black crystal glass, child lock, timer, and 8 preset Nepali cooking modes.',
    fullDesc: 'Cut LPG cooking gas cylinder costs in half. Heats magnetic cookware directly with magnetic waves for fast boiling and frying. Safe from open flame and auto shut-off if no pan is detected.',
    features: [
      '2000W PowerBoost boils 1L water in 2.5 minutes',
      '8 Indian/Nepali cooking presets: Roti, Curry, Milk, Dosa, Fry, Boil',
      'A-Grade Crystal Ceramic Glass scratch resistant and wipe-clean',
      'Digital LED display with 3-hour programmable timer',
      'Voltage surge protection (up to 2500V surge)'
    ],
    specs: {
      powerWattage: '2000W Variable (120W - 2000W)',
      voltage: '220V - 240V',
      dimensions: '290 mm x 360 mm x 45 mm',
      warrantyYears: 1,
      color: 'Glossy Piano Black Glass'
    },
    warrantySummary: '1 Year Official Warranty from Midea Authorized Distributor.'
  },
  {
    id: 'chigo-infrared-cooker',
    name: 'Chigo 2200W Multi-Cooker Infrared Stove (Works with All Pots)',
    tagline: 'Compatible with Any Cookware (Steel, Clay, Glass, Aluminum)',
    brand: 'Chigo',
    category: 'Kitchen & Cooking',
    price: 4990,
    originalPrice: 5790,
    rating: 4.7,
    reviewCount: 57,
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Universal Pots Support',
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 20,
    exchangeAvailable: false,
    financeAvailable: false,
    shortDesc: '2200W infrared ceramic burner that works with ALL types of cookware including standard aluminum karahi, clay pots, stainless steel, and copper.',
    fullDesc: 'Unlike induction cookers which only work with magnetic pots, the Chigo Infrared Cooker heats using halogen thermal coils so you can use your existing traditional aluminum and steel cookware without buying new pots.',
    features: [
      'Universal Cookware: Works with aluminum, stainless, copper, ceramic, glass',
      'High power 2200W heating with dial and touch buttons',
      'Direct BBQ grilling capability with stainless grill plate',
      'Child lock and overheating sensor'
    ],
    specs: {
      powerWattage: '2200W High Heat',
      voltage: '220V / 50Hz',
      warrantyYears: 1,
      color: 'Black with Gold Trim'
    },
    warrantySummary: '1 Year Warranty supported at Khan Electronics Rajbiraj.'
  },
  {
    id: 'crompton-aura-fan',
    name: 'Crompton Aura 1200mm High Speed Anti-Dust Decorative Ceiling Fan',
    tagline: 'Anti-Dust Coating (50% Less Dust), 380 RPM & 100% Copper Winding',
    brand: 'Crompton',
    category: 'Cooling & Heating',
    price: 4490,
    originalPrice: 5190,
    rating: 4.9,
    reviewCount: 140,
    imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Terai Summer Essential',
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 45,
    exchangeAvailable: false,
    financeAvailable: true,
    shortDesc: '1200mm (48-inch) high speed decorative ceiling fan with hydrophobic anti-dust coating that attracts 50% less dust, delivering 230 CMM air delivery.',
    fullDesc: 'Stay cool in Rajbiraj\'s warm summers. The Crompton Aura features aerodynamically balanced aluminum blades and double ball bearings for whisper quiet operation and high air spread.',
    features: [
      'Anti-Dust Nanotechnology paint attracts 50% less dust',
      'High speed 380 RPM motor delivers 230 m³/min air delivery',
      '100% Copper winding double ball bearing motor',
      'Metallic trim ring on motor and blade shank'
    ],
    specs: {
      powerWattage: '74W Energy Efficient',
      voltage: '220V - 240V',
      dimensions: '1200 mm Sweep (48 inches)',
      warrantyYears: 2,
      color: 'Titanium Metallic Brown / Ivory Gold'
    },
    warrantySummary: '2 Years Manufacturer Replacement Warranty from Crompton Nepal.'
  },
  {
    id: 'khaitan-stand-fan',
    name: 'Khaitan 16-Inch High Velocity Oscillation Stand Fan',
    tagline: 'Aerodynamic 5-Blade Design, Telescopic Height & 90° Oscillation',
    brand: 'Khaitan',
    category: 'Cooling & Heating',
    price: 3890,
    originalPrice: 4490,
    rating: 4.7,
    reviewCount: 66,
    imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Summer Saver',
    isBestSeller: false,
    isFeatured: false,
    inStock: true,
    stockCount: 28,
    exchangeAvailable: false,
    financeAvailable: false,
    shortDesc: '16-inch adjustable pedestal stand fan with 5 AS transparent blades, heavy round base for anti-topple stability, and thermal fuse motor protection.',
    fullDesc: 'Ideal for verandas, shops, living rooms, and bedrooms. Provides wide-angle cooling breeze with easy height adjustment and 3 speed touch buttons.',
    features: [
      '16" 5-Blade aerodynamic propeller for strong air throw',
      'Adjustable height up to 135 cm and tilt angle',
      'Smooth 90-degree motorized oscillation',
      'Heavy weighted base prevents tipping'
    ],
    specs: {
      powerWattage: '55W',
      voltage: '220V',
      warrantyYears: 1,
      color: 'Charcoal Black with Blue Blades'
    },
    warrantySummary: '1 Year Brand Warranty from Khaitan.'
  },
  {
    id: 'midea-ac-15ton',
    name: 'Midea 1.5 Ton Inverter Split Air Conditioner with Fast Cooling',
    tagline: 'Golden Fin Anti-Corrosion, Dual Filtration & Turbo Cool in 30s',
    brand: 'Midea',
    category: 'Cooling & Heating',
    price: 78900,
    originalPrice: 87900,
    rating: 4.8,
    reviewCount: 31,
    imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'EMI Available / 40% Downpayment',
    isBestSeller: false,
    isFeatured: true,
    inStock: true,
    stockCount: 4,
    exchangeAvailable: false,
    financeAvailable: true,
    shortDesc: '1.5 Ton high efficiency inverter split AC with Golden Fin heat exchangers that resist corrosion from humid air and dust in Saptari region.',
    fullDesc: 'Engineered for extreme heat up to 52°C ambient temperatures. Rapidly cools rooms within 30 seconds of turning on Turbo mode. 100% copper condenser tubes and high density dust filter.',
    features: [
      'Full Inverter Quattro compressor saves up to 60% electricity',
      'Golden Fin Anti-Corrosion treatment on outdoor and indoor coils',
      'Follow-Me sensor in remote detects temperature around you',
      'Hidden LED display and silent Sleep Mode'
    ],
    specs: {
      capacity: '1.5 Ton (18,000 BTU/h)',
      powerWattage: '1450W Nominal Inverter',
      voltage: '220V - 240V / 50Hz',
      warrantyYears: 1,
      motorWarrantyYears: 10,
      color: 'Pure White with Chrome Strip'
    },
    warrantySummary: '1 Year Full Machine Warranty + 10 Years on Inverter Compressor through Midea Nepal.'
  },
  {
    id: 'tcl-tv-43-4k',
    name: 'TCL 43" 4K HDR Google Smart LED TV with Dolby Audio',
    tagline: 'Bezel-Less Metallic Frame, Google TV OS, Hands-Free Voice Control',
    brand: 'TCL',
    category: 'Televisions',
    price: 43900,
    originalPrice: 49900,
    rating: 4.8,
    reviewCount: 54,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Finance Available',
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 8,
    exchangeAvailable: false,
    financeAvailable: true,
    shortDesc: '43-inch 4K Ultra HD smart Google TV with HDR 10, Micro Dimming, Dolby Audio 24W speakers, dual-band Wi-Fi, and Google Play Store.',
    fullDesc: 'Enjoy crystal clear YouTube, Netflix, Prime Video, and DishHome TV in true 4K resolution. Features a slim borderless metallic chassis, Chromecast built-in, and authorized TCL Nepal warranty.',
    features: [
      '4K UHD (3840 x 2160) with HDR 10 enhancement',
      'Official Google TV interface with personalized recommendations',
      'Dolby Audio 24W stereo speakers with crystal clarity',
      'Dual-Band Wi-Fi (2.4GHz / 5GHz) and Bluetooth 5.0'
    ],
    specs: {
      dimensions: '43 Inch Diagonal Display',
      voltage: '100V - 240V 50/60Hz',
      warrantyYears: 3,
      color: 'Brushed Dark Metallic'
    },
    warrantySummary: '3 Years Panel and Service Warranty backed by TCL Authorized Network in Nepal.'
  },
  {
    id: 'samsung-tv-55-crystal',
    name: 'Samsung 55" Crystal 4K UHD Smart TV (Dynamic Color)',
    tagline: 'Crystal Processor 4K, AirSlim Profile, Q-Symphony & PC Mode',
    brand: 'Samsung',
    category: 'Televisions',
    price: 88990,
    originalPrice: 99990,
    rating: 4.9,
    reviewCount: 47,
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
    additionalImages: [],
    badge: 'Samsung Exchange Special',
    isBestSeller: true,
    isFeatured: true,
    inStock: true,
    stockCount: 5,
    exchangeAvailable: true,
    financeAvailable: true,
    shortDesc: '55-inch Crystal 4K UHD smart TV featuring ultra-slim AirSlim design, lifelike color expression, and SolarCell remote control.',
    fullDesc: 'Transform your living room into a private cinema. The Samsung Crystal Processor 4K upscales all your favorite local and international broadcasts into sharp 4K definition. Exchange your old CRT, LCD, or smaller TV at Khan Electronics for an instant cash-equivalent discount.',
    features: [
      'Dynamic Crystal Color with 1 billion true shades',
      'AirSlim Design: ultra-thin profile that fits flush against wall',
      'Q-Symphony sound syncs TV and soundbar speakers together',
      'SolarCell Remote charges by indoor room lighting'
    ],
    specs: {
      dimensions: '55 Inch Diagonal Display (138 cm)',
      voltage: '220V - 240V',
      warrantyYears: 3,
      color: 'Titan Grey TitanSlim Frame'
    },
    warrantySummary: '3 Years Full Panel & Board Warranty directly from Samsung Nepal.'
  }
];

// Normalize and attach model numbers and gallery views
export const KHAN_PRODUCTS: Product[] = RAW_KHAN_PRODUCTS.map(p => {
  const modelNumber = PRODUCT_MODEL_MAP[p.id] || p.id.toUpperCase();
  const fallbacks = CATEGORY_GALLERY_FALLBACKS[p.category] || [
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'
  ];
  const additionalImages = (p.additionalImages && p.additionalImages.length > 0) 
    ? p.additionalImages 
    : fallbacks.filter(img => img !== p.imageUrl);

  return {
    ...p,
    modelNumber,
    additionalImages
  };
});

export const BRANDS_LIST = [
  { name: 'Samsung', logo: 'SAMSUNG', desc: 'Global Leader in Smart Appliances • Official Exchange Available', count: 4, hasExchange: true, hasFinance: true },
  { name: 'CG', logo: 'CG', desc: 'Chaudhary Group • Nepal\'s Most Trusted Brand', count: 4, hasExchange: false, hasFinance: true },
  { name: 'Godrej', logo: 'Godrej', desc: 'Indian Engineering Excellence • 10-Yr Inverter Guarantee', count: 2, hasExchange: false, hasFinance: true },
  { name: 'Crompton', logo: 'Crompton', desc: 'Pioneers in Heavy Duty Motors, Mixers & Fans', count: 2, hasExchange: false, hasFinance: true },
  { name: 'Midea', logo: 'Midea', desc: 'World #1 Major Appliances Brand • Smart Inverter', count: 3, hasExchange: false, hasFinance: true },
  { name: 'Konka', logo: 'KONKA', desc: 'High Quality Value Refrigerators & Home Tech', count: 1, hasExchange: false, hasFinance: false },
  { name: 'TCL', logo: 'TCL', desc: 'Top Global Smart QLED & 4K TVs', count: 1, hasExchange: false, hasFinance: true },
  { name: 'Khaitan', logo: 'Khaitan', desc: 'Dependable Everyday Appliances & Fans', count: 2, hasExchange: false, hasFinance: false },
  { name: 'Force', logo: 'FORCE', desc: 'Heavy Gauge Kitchen Appliances & Rice Cookers', count: 1, hasExchange: false, hasFinance: false },
  { name: 'Chigo', logo: 'CHIGO', desc: 'Smart Infrared Cookers & Air Solutions', count: 1, hasExchange: false, hasFinance: false }
];
