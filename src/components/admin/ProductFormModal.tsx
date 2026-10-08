import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  CreditCard, 
  Repeat, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Wrench, 
  AlertCircle, 
  DollarSign, 
  Package,
  UploadCloud,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { FirestoreProductDoc } from '../../services/productService';
import { ApplianceBrand, ApplianceCategory } from '../../types';
import { 
  uploadProductImage, 
  validateImageFile, 
  deleteProductImage 
} from '../../services/storageService';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Partial<FirestoreProductDoc> & { productName: string; sellingPrice: number }) => Promise<void>;
  productToEdit?: FirestoreProductDoc | null;
  isSaving: boolean;
}

interface UploadTaskState {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const BRANDS: ApplianceBrand[] = [
  'Samsung',
  'CG',
  'Godrej',
  'Konka',
  'Midea',
  'Force',
  'Crompton',
  'Chigo',
  'Khaitan',
  'TCL',
  'Other'
];

const CATEGORIES: ApplianceCategory[] = [
  'Refrigerators',
  'Washing Machines',
  'Televisions',
  'Mixer Grinders',
  'Rice Cookers',
  'Kitchen & Cooking',
  'Cooling & Heating'
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
  isSaving
}) => {
  const [formData, setFormData] = useState<Partial<FirestoreProductDoc>>({
    productId: '',
    brand: 'Samsung',
    category: 'Refrigerators',
    productName: '',
    modelNumber: '',
    shortDescription: '',
    keySpecification: '',
    mrp: 0,
    sellingPrice: 0,
    discountPercent: 0,
    stockQuantity: 5,
    stockStatus: 'In Stock',
    financeAvailable: true,
    exchangeAvailable: true,
    minimumDownPaymentPercent: 40,
    warranty: '1 Year Comprehensive Product Warranty + Direct Authorized Service Center Rajbiraj.',
    delivery: 'Free Doorstep Delivery within 5 km of Rajbiraj Showroom',
    installation: 'Free Unboxing and Power Testing by Showroom Technicians',
    productStatus: 'Active',
    featured: false,
    images: []
  });

  // Images State
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [uploadTasks, setUploadTasks] = useState<UploadTaskState[]>([]);
  const [imageError, setImageError] = useState('');
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);

  // File Inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      const existingImgs = Array.isArray(productToEdit.images) && productToEdit.images.length > 0 
        ? productToEdit.images 
        : [];
      setFormData({
        ...productToEdit,
        minimumDownPaymentPercent: productToEdit.minimumDownPaymentPercent || 40,
        images: existingImgs
      });
      setImagesList(existingImgs);
    } else {
      // Defaults for new product
      const newId = `khan-prod-${Date.now().toString(36)}`;
      setFormData({
        productId: newId,
        brand: 'Samsung',
        category: 'Refrigerators',
        productName: '',
        modelNumber: '',
        shortDescription: '',
        keySpecification: '',
        mrp: 50000,
        sellingPrice: 45000,
        discountPercent: 10,
        stockQuantity: 5,
        stockStatus: 'In Stock',
        financeAvailable: true,
        exchangeAvailable: true,
        minimumDownPaymentPercent: 40,
        warranty: '1 Year Comprehensive Product Warranty + Authorized Service Center Rajbiraj.',
        delivery: 'Free Doorstep Delivery within 5 km of Rajbiraj Showroom',
        installation: 'Free Unboxing and Power Testing by Showroom Technicians',
        productStatus: 'Active',
        featured: false,
        images: []
      });
      setImagesList([]);
    }
    setFormError('');
    setImageError('');
    setUploadTasks([]);
    setManualUrlInput('');
  }, [productToEdit, isOpen]);

  // Recalculate discount whenever MRP or Selling Price changes
  const handlePriceChange = (field: 'mrp' | 'sellingPrice', value: number) => {
    const updated = { ...formData, [field]: value };
    const mrp = field === 'mrp' ? value : Number(updated.mrp || 0);
    const selling = field === 'sellingPrice' ? value : Number(updated.sellingPrice || 0);
    
    let discount = 0;
    if (mrp > selling && mrp > 0) {
      discount = Math.round(((mrp - selling) / mrp) * 100);
    }
    updated.discountPercent = discount;
    setFormData(updated);
  };

  const handleStockQuantityChange = (qty: number) => {
    let status = formData.stockStatus;
    if (qty <= 0) {
      status = 'Out of Stock';
    } else if (qty <= 3 && status !== 'Out of Stock') {
      status = 'Limited Stock';
    } else if (qty > 3 && status === 'Out of Stock') {
      status = 'In Stock';
    }
    setFormData(prev => ({
      ...prev,
      stockQuantity: qty,
      stockStatus: status
    }));
  };

  // -------------------------------------------------------------
  // FIREBASE STORAGE IMAGE MANAGEMENT HANDLERS
  // -------------------------------------------------------------

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageError('');
    const targetProdId = formData.productId || `prod-${Date.now().toString(36)}`;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateImageFile(file);

      if (!validation.valid) {
        setImageError(validation.error || 'Invalid file format or size.');
        continue;
      }

      const taskId = `${Date.now()}-${i}`;
      const newTask: UploadTaskState = {
        id: taskId,
        name: file.name,
        progress: 0,
        status: 'uploading'
      };

      setUploadTasks(prev => [...prev, newTask]);

      try {
        const uploadResult = await uploadProductImage(targetProdId, file, (progressPct) => {
          setUploadTasks(prev => 
            prev.map(t => t.id === taskId ? { ...t, progress: progressPct } : t)
          );
        });

        // Add download URL to product images list
        setImagesList(prev => [...prev, uploadResult.url]);
        setUploadTasks(prev => 
          prev.map(t => t.id === taskId ? { ...t, progress: 100, status: 'completed' } : t)
        );

        // Auto remove completed task badge after 2.5s
        setTimeout(() => {
          setUploadTasks(prev => prev.filter(t => t.id !== taskId));
        }, 2500);
      } catch (err: any) {
        setUploadTasks(prev => 
          prev.map(t => t.id === taskId ? { ...t, status: 'error', error: err?.message || 'Upload failed' } : t)
        );
        setImageError(`Upload failed for "${file.name}": ${err?.message || 'Please ensure you are signed in as an authorized admin.'}`);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Replace a specific image
  const handleReplaceFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || replaceTargetIndex === null) return;

    const file = files[0];
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setImageError(validation.error || 'Invalid file.');
      return;
    }

    const targetIndex = replaceTargetIndex;
    const oldUrl = imagesList[targetIndex];
    const targetProdId = formData.productId || `prod-${Date.now().toString(36)}`;
    const taskId = `replace-${Date.now()}`;

    setUploadTasks(prev => [...prev, {
      id: taskId,
      name: `Replacing: ${file.name}`,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      const result = await uploadProductImage(targetProdId, file, (pct) => {
        setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: pct } : t));
      });

      // Update image at index
      setImagesList(prev => {
        const next = [...prev];
        next[targetIndex] = result.url;
        return next;
      });

      // Cleanup old storage image in background if it was from storage
      if (oldUrl) {
        deleteProductImage(oldUrl).catch(console.warn);
      }

      setUploadTasks(prev => prev.filter(t => t.id !== taskId));
      setReplaceTargetIndex(null);
    } catch (err: any) {
      setUploadTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error', error: err?.message } : t));
      setImageError(`Replacement failed: ${err?.message || 'Please ensure you are signed in as an authorized admin.'}`);
    }

    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
    }
  };

  // Set image as Primary (move to index 0)
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    setImagesList(prev => {
      const selected = prev[index];
      const remainder = prev.filter((_, i) => i !== index);
      return [selected, ...remainder];
    });
  };

  // Reorder Left / Right
  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setImagesList(prev => {
      const next = [...prev];
      const target = direction === 'left' ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  };

  // Remove an image
  const handleRemoveImage = (index: number) => {
    const urlToRemove = imagesList[index];
    setImagesList(prev => prev.filter((_, i) => i !== index));

    // Optionally cleanup from storage if it's a Firebase Storage URL
    if (urlToRemove) {
      deleteProductImage(urlToRemove).catch(console.warn);
    }
  };

  // Add image by manual URL
  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrlInput.trim()) return;
    setImagesList(prev => [...prev, manualUrlInput.trim()]);
    setManualUrlInput('');
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName?.trim()) {
      setFormError('Please enter a Product Name.');
      return;
    }
    if (!formData.sellingPrice || formData.sellingPrice <= 0) {
      setFormError('Please enter a valid Selling Price in NPR.');
      return;
    }

    try {
      setFormError('');

      // Fallback default image if none uploaded
      const finalImages = imagesList.length > 0 
        ? imagesList 
        : ['https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'];

      await onSave({
        ...formData,
        productName: formData.productName.trim(),
        sellingPrice: Number(formData.sellingPrice),
        mrp: Number(formData.mrp || formData.sellingPrice),
        stockQuantity: Number(formData.stockQuantity ?? 1),
        images: finalImages
      });
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product to Firestore');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {productToEdit ? 'Edit Showroom Product' : 'Add New Appliance to Showroom'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {productToEdit 
                ? `Updating Firestore document: ${productToEdit.productId}`
                : 'Creates a new product document directly in Firestore "products" collection'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {formError && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Basic Identifiers */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Package className="w-3.5 h-3.5 text-amber-600" />
              1. Basic Information & Classification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand *</label>
                <select
                  value={formData.brand}
                  onChange={e => {
                    const brand = e.target.value;
                    const exchangeAuto = brand === 'Samsung';
                    setFormData(prev => ({
                      ...prev,
                      brand,
                      exchangeAvailable: exchangeAuto ? true : prev.exchangeAvailable
                    }));
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                >
                  {BRANDS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Model Number *</label>
                <input
                  type="text"
                  placeholder="e.g. RT28T3722S9/NL"
                  value={formData.modelNumber || ''}
                  onChange={e => setFormData(prev => ({ ...prev, modelNumber: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Samsung 253L Digital Inverter Double Door Refrigerator"
                  value={formData.productName || ''}
                  onChange={e => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product ID (Firestore Document ID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. samsung-refrig-253l"
                  value={formData.productId || ''}
                  onChange={e => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                  disabled={Boolean(productToEdit)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 disabled:opacity-60 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {productToEdit ? 'Document ID cannot be changed after creation' : 'Auto-generated or custom'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Key Specifications Summary</label>
              <input
                type="text"
                placeholder="e.g. 253L Capacity • Digital Inverter • 3-Star Energy Rating • Elegant Silver"
                value={formData.keySpecification || ''}
                onChange={e => setFormData(prev => ({ ...prev, keySpecification: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
              <textarea
                rows={2}
                placeholder="Detailed customer overview, inverter features, voltage stability for Nepal..."
                value={formData.shortDescription || ''}
                onChange={e => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Pricing, MRP, Discounts & Stock */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              2. Pricing, Discount & Stock Inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">MRP Price (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.mrp || ''}
                  onChange={e => handlePriceChange('mrp', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (Rs.) *</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.sellingPrice || ''}
                  onChange={e => handlePriceChange('sellingPrice', Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-amber-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none font-bold text-amber-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discount (%)</label>
                <div className="px-3 py-2 bg-slate-100 rounded-xl text-xs font-bold text-emerald-700 border border-slate-200 flex items-center justify-between">
                  <span>{formData.discountPercent || 0}% OFF</span>
                  <span className="text-[10px] font-normal text-slate-500">Auto</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stockQuantity ?? 1}
                  onChange={e => handleStockQuantityChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Status</label>
                <select
                  value={formData.stockStatus}
                  onChange={e => setFormData(prev => ({ ...prev, stockStatus: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="In Stock">In Stock (Available at Showroom)</option>
                  <option value="Limited Stock">Limited Stock (Few Units Left)</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Status</label>
                <select
                  value={formData.productStatus}
                  onChange={e => setFormData(prev => ({ ...prev, productStatus: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none font-semibold"
                >
                  <option value="Active">Active (Visible in Customer Store)</option>
                  <option value="Inactive">Inactive (Hidden from Customer Store)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Finance, Samsung Exchange & Featured Flags */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              3. Finance, Exchange & Promotion Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Finance Available Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-900">Finance Facility</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.financeAvailable}
                    onChange={e => setFormData(prev => ({ ...prev, financeAvailable: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Enables 0% EMI options. Note: Finance is available only for products with selling price ≥ NPR 30,000.
                </p>
                {formData.financeAvailable && (formData.sellingPrice ?? 0) > 0 && (formData.sellingPrice ?? 0) < 30000 && (
                  <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
                    Selling price (NPR {(formData.sellingPrice ?? 0).toLocaleString()}) is below the NPR 30,000 minimum finance requirement.
                  </div>
                )}
                {formData.financeAvailable && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1">Min Downpayment (%)</label>
                    <input
                      type="number"
                      min="10"
                      max="90"
                      value={formData.minimumDownPaymentPercent || 40}
                      onChange={e => setFormData(prev => ({ ...prev, minimumDownPaymentPercent: Number(e.target.value) }))}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Samsung Exchange Toggle */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">Samsung Exchange</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.exchangeAvailable}
                    onChange={e => setFormData(prev => ({ ...prev, exchangeAvailable: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Enables trade-in valuation badges and exchange actions (Samsung products).
                </p>
                <div className="text-[11px] font-semibold text-blue-800">
                  {formData.exchangeAvailable ? '✓ Exchange Enabled' : '— No Exchange'}
                </div>
              </div>

              {/* Featured Flag */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900">Featured Showcase</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={e => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Shows on homepage hero highlights and best sellers grid.
                </p>
                <div className="text-[11px] font-semibold text-purple-800">
                  {formData.featured ? '★ Featured on Homepage' : 'Standard Product'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: PRODUCT IMAGES & FIREBASE STORAGE */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                4. Product Images (Firebase Storage)
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {imagesList.length} image{imagesList.length === 1 ? '' : 's'} attached
              </span>
            </div>

            {/* Error in image uploading */}
            {imageError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Upload Area / Dropzone */}
            <div className="p-4 sm:p-5 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl bg-slate-50/80 transition-colors text-center space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFilesSelected}
                className="hidden"
                id="product-images-upload"
              />

              {/* Hidden input for replace action */}
              <input
                ref={replaceInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleReplaceFileSelected}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <UploadCloud className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <label 
                  htmlFor="product-images-upload"
                  className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-xs cursor-pointer transition-transform hover:scale-101"
                >
                  Upload Product Images
                </label>
                <p className="text-[11px] text-slate-500">
                  Select one or multiple images (JPG, PNG, WEBP &bull; Max 10MB each)
                </p>
                <p className="text-[10px] text-slate-400">
                  Files are saved under <span className="font-mono text-slate-600">products/{formData.productId || 'id'}/</span> in Firebase Storage
                </p>
              </div>
            </div>

            {/* Active Upload Tasks Progress */}
            {uploadTasks.length > 0 && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-700">Uploading to Firebase Storage:</div>
                <div className="space-y-1.5">
                  {uploadTasks.map(task => (
                    <div key={task.id} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="truncate max-w-xs font-mono text-slate-700">{task.name}</span>
                        {task.status === 'uploading' && (
                          <span className="font-bold text-amber-600">{task.progress}%</span>
                        )}
                        {task.status === 'completed' && (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                          </span>
                        )}
                        {task.status === 'error' && (
                          <span className="text-rose-600 font-bold">{task.error || 'Failed'}</span>
                        )}
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            task.status === 'error' ? 'bg-rose-500' : task.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gallery of Uploaded Images with Management Controls */}
            {imagesList.length > 0 ? (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                  <span>Showroom Image Order:</span>
                  <span className="text-[10px] text-slate-400">The first image is the Primary Image shown on cards and catalogue</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imagesList.map((imgUrl, index) => {
                    const isPrimary = index === 0;
                    return (
                      <div 
                        key={`${imgUrl}-${index}`}
                        className={`group relative rounded-2xl overflow-hidden border-2 bg-slate-100 flex flex-col justify-between transition-all ${
                          isPrimary ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Image Preview */}
                        <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={`Product img ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80';
                            }}
                          />

                          {/* Primary Badge */}
                          {isPrimary ? (
                            <div className="absolute top-2 left-2 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm">
                              <Star className="w-3 h-3 fill-slate-950" />
                              <span>Primary Image</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(index)}
                              className="absolute top-2 left-2 bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white px-2 py-0.5 rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                              title="Set as Primary Image"
                            >
                              Make Primary
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white transition-opacity opacity-0 group-hover:opacity-100 shadow-sm cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="p-2 bg-white border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(index, 'left')}
                              disabled={index === 0}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700"
                              title="Move Left / Earlier in gallery"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(index, 'right')}
                              disabled={index === imagesList.length - 1}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700"
                              title="Move Right / Later in gallery"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setReplaceTargetIndex(index);
                              replaceInputRef.current?.click();
                            }}
                            className="text-[10px] font-semibold text-slate-600 hover:text-amber-700 hover:underline flex items-center gap-0.5"
                            title="Replace this image with a new file"
                          >
                            <RefreshCw className="w-2.5 h-2.5" /> Replace
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No images uploaded yet. Upload product photos above or add a URL below.
              </div>
            )}

            {/* Manual URL Fallback Input */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Or Add Image via External URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={manualUrlInput}
                  onChange={e => setManualUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddManualUrl}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add URL
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Service, Warranty, Delivery & Installation */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              5. Warranty, Delivery & Installation Policy
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Warranty Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Year Comprehensive + 20 Years on Inverter Motor"
                  value={formData.warranty || ''}
                  onChange={e => setFormData(prev => ({ ...prev, warranty: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  Delivery Policy
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free Delivery within 5 km in Rajbiraj"
                  value={formData.delivery || ''}
                  onChange={e => setFormData(prev => ({ ...prev, delivery: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  Installation Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free Unboxing & Technician Setup"
                  value={formData.installation || ''}
                  onChange={e => setFormData(prev => ({ ...prev, installation: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all hover:scale-101 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving to Firestore...' : (productToEdit ? 'Save Changes' : 'Create Product in Firestore')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
