import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Package, 
  ShieldCheck, 
  Wrench, 
  Repeat, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Phone,
  Mail,
  Lock,
  LogOut,
  KeyRound,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ArrowRight,
  Truck,
  RefreshCw,
  Check,
  Building,
  HelpCircle,
  FileText
} from 'lucide-react';
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
import { 
  registerCustomer, 
  loginCustomer, 
  logoutCustomer, 
  sendCustomerPasswordReset, 
  changeCustomerPassword, 
  updateCustomerProfile, 
  addSavedAddress, 
  updateSavedAddress, 
  deleteSavedAddress, 
  fetchCustomerOrders, 
  fetchCustomerServiceTickets, 
  fetchCustomerExchanges, 
  fetchCustomerFinanceApplications, 
  fetchCustomerFinanceEnquiries,
  fetchCustomerWarranties,
  linkGuestOrderToCustomer,
  getOrCreateCustomerProfile
} from '../services/customerAuthService';
import { auth } from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface CustomerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrderTracking: (orderId?: string) => void;
  onNavigateToCatalog?: () => void;
  onNavigateToService?: () => void;
  onNavigateToExchange?: () => void;
  onNavigateToFinance?: () => void;
}

export const CustomerDashboardModal: React.FC<CustomerDashboardModalProps> = ({
  isOpen,
  onClose,
  onOpenOrderTracking,
  onNavigateToCatalog,
  onNavigateToService,
  onNavigateToExchange,
  onNavigateToFinance
}) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Auth form state (when logged out)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Logged-in Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'orders' | 'profile' | 'addresses' | 'warranties' | 'service' | 'exchange' | 'finance' | 'link'
  >('orders');

  // Customer Records state (strictly belonging to this customer UID)
  const [orders, setOrders] = useState<Order[]>([]);
  const [warranties, setWarranties] = useState<RegisteredWarranty[]>([]);
  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>([]);
  const [exchangeRequests, setExchangeRequests] = useState<ExchangeRequest[]>([]);
  const [financeApplications, setFinanceApplications] = useState<FinanceApplication[]>([]);
  const [financeEnquiries, setFinanceEnquiries] = useState<FinanceEnquiry[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Edit Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change Password form state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Saved Addresses form state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrProvince, setAddrProvince] = useState('Madhesh Province');
  const [addrDistrict, setAddrDistrict] = useState('Saptari');
  const [addrMunicipality, setAddrMunicipality] = useState('Rajbiraj Municipality');
  const [addrWardNo, setAddrWardNo] = useState('Ward No. 3');
  const [addrStreetAddress, setAddrStreetAddress] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrIsWithin5km, setAddrIsWithin5km] = useState(true);
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Link Guest Order form state
  const [linkOrderId, setLinkOrderId] = useState('');
  const [linkPhone, setLinkPhone] = useState('');
  const [isLinkingOrder, setIsLinkingOrder] = useState(false);
  const [linkMsg, setLinkMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getOrCreateCustomerProfile(user);
          setCustomerProfile(profile);
          setEditFullName(profile.fullName);
          setEditPhone(profile.phone);
        } catch (err) {
          console.error('Error fetching customer profile:', err);
        }
      } else {
        setCustomerProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch customer records whenever authenticated user changes or modal opens
  const loadCustomerRecords = async (uid: string) => {
    setIsLoadingRecords(true);
    try {
      const [
        fetchedOrders,
        fetchedTickets,
        fetchedExchanges,
        fetchedFinanceApps,
        fetchedFinanceEnqs,
        fetchedWarranties
      ] = await Promise.all([
        fetchCustomerOrders(uid),
        fetchCustomerServiceTickets(uid),
        fetchCustomerExchanges(uid),
        fetchCustomerFinanceApplications(uid),
        fetchCustomerFinanceEnquiries(uid),
        fetchCustomerWarranties(uid)
      ]);

      setOrders(fetchedOrders);
      setServiceTickets(fetchedTickets);
      setExchangeRequests(fetchedExchanges);
      setFinanceApplications(fetchedFinanceApps);
      setFinanceEnquiries(fetchedFinanceEnqs);

      // Synthesize official warranties: from explicit warranties collection PLUS items purchased in confirmed orders
      const synthesizedWarranties: RegisteredWarranty[] = [...fetchedWarranties];
      
      // Auto-extract warranty snapshots from verified orders
      fetchedOrders.forEach(ord => {
        if (ord.orderStatus !== 'Cancelled' && ord.items) {
          ord.items.forEach((item, idx) => {
            const isSamsung = item.brand === 'Samsung' || item.productName.toLowerCase().includes('samsung');
            const isFridge = item.productName.toLowerCase().includes('refrigerator') || item.productName.toLowerCase().includes('inverter');
            
            // Check if not already in list
            const existingMatch = synthesizedWarranties.some(w => 
              w.productName.toLowerCase() === item.productName.toLowerCase()
            );

            if (!existingMatch) {
              synthesizedWarranties.push({
                id: `warr-${ord.id}-${idx}`,
                productName: item.productName,
                brand: item.brand || (isSamsung ? 'Samsung' : 'Khan Official'),
                serialNumber: item.modelNumber ? `${item.modelNumber}-SN${ord.orderId.slice(-4)}` : `KE-SN-${ord.orderId.slice(-5)}`,
                purchaseDate: new Date(ord.createdAt).toLocaleDateString(),
                warrantyExpiry: isFridge 
                  ? 'Official 20-Year Compressor Warranty + 1-Year Comprehensive'
                  : 'Official 1-Year Manufacturer Warranty (Nepal Authorized)',
                purchasedFromKhan: true,
                status: 'Active Official Warranty'
              });
            }
          });
        }
      });

      setWarranties(synthesizedWarranties);
    } catch (err) {
      console.error('Error loading customer records:', err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      loadCustomerRecords(currentUser.uid);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle Authentication (Sign In, Sign Up, Reset Password)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsSubmittingAuth(true);

    try {
      if (authMode === 'login') {
        if (!authEmail.trim() || !authPassword) {
          throw new Error('Please enter both your email address and password.');
        }
        const profile = await loginCustomer(authEmail.trim(), authPassword);
        setCustomerProfile(profile);
        setEditFullName(profile.fullName);
        setEditPhone(profile.phone);
        await loadCustomerRecords(profile.uid);
      } else if (authMode === 'register') {
        if (!authFullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!authPhone.trim() || authPhone.trim().length < 7) {
          throw new Error('Please enter a valid 10-digit mobile number.');
        }
        if (!authEmail.trim() || !authEmail.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }
        if (authPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        if (authPassword !== authConfirmPassword) {
          throw new Error('Passwords do not match. Please re-enter.');
        }

        const profile = await registerCustomer({
          email: authEmail.trim(),
          password: authPassword,
          fullName: authFullName.trim(),
          phone: authPhone.trim()
        });
        setCustomerProfile(profile);
        setEditFullName(profile.fullName);
        setEditPhone(profile.phone);
        await loadCustomerRecords(profile.uid);
      } else if (authMode === 'forgot-password') {
        if (!authEmail.trim() || !authEmail.includes('@')) {
          throw new Error('Please enter your registered email address.');
        }
        await sendCustomerPasswordReset(authEmail.trim());
        setAuthSuccess('Password reset link sent to your email. Please check your inbox and spam folder.');
      }
    } catch (err: any) {
      let message = err?.message || 'An error occurred during authentication.';
      if (err?.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please sign in instead or reset your password.';
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        message = 'Invalid email or password. Please verify your credentials.';
      } else if (err?.code === 'auth/user-not-found') {
        message = 'No customer account found with this email. Please sign up for a new account.';
      } else if (err?.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      }
      setAuthError(message);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutCustomer();
      setCurrentUser(null);
      setCustomerProfile(null);
      setOrders([]);
      setWarranties([]);
      setServiceTickets([]);
      setExchangeRequests([]);
      setFinanceApplications([]);
      setFinanceEnquiries([]);
      setAuthMode('login');
      setAuthPassword('');
      setAuthConfirmPassword('');
    } catch (err: any) {
      console.error('Error logging out:', err);
    }
  };

  // Handle Edit Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !customerProfile) return;
    setProfileMsg(null);
    setProfileSaving(true);

    try {
      if (!editFullName.trim()) {
        throw new Error('Full name cannot be blank.');
      }
      if (!editPhone.trim() || editPhone.trim().length < 7) {
        throw new Error('Please provide a valid phone number.');
      }

      await updateCustomerProfile(currentUser.uid, {
        fullName: editFullName.trim(),
        phone: editPhone.trim()
      });

      const updatedProfile: CustomerProfile = {
        ...customerProfile,
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        updatedAt: new Date().toISOString()
      };
      setCustomerProfile(updatedProfile);
      setIsEditingProfile(false);
      setProfileMsg({ type: 'success', text: 'Personal information updated successfully.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Change Password Save
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordSaving(true);

    try {
      if (!currentPassword) {
        throw new Error('Please enter your current password.');
      }
      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long.');
      }
      if (newPassword !== confirmNewPassword) {
        throw new Error('New passwords do not match.');
      }

      await changeCustomerPassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangingPassword(false);
    } catch (err: any) {
      let msg = err.message || 'Failed to update password.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect current password. Please try again.';
      }
      setPasswordMsg({ type: 'error', text: msg });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Saved Address Operations
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrLabel('Home');
    setAddrFullName(customerProfile?.fullName || '');
    setAddrPhone(customerProfile?.phone || '');
    setAddrProvince('Madhesh Province');
    setAddrDistrict('Saptari');
    setAddrMunicipality('Rajbiraj Municipality');
    setAddrWardNo('Ward No. 3');
    setAddrStreetAddress('');
    setAddrLandmark('');
    setAddrIsWithin5km(true);
    setAddrIsDefault(customerProfile?.savedAddresses.length === 0);
    setAddressError(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label);
    setAddrFullName(addr.fullName);
    setAddrPhone(addr.phone);
    setAddrProvince(addr.province);
    setAddrDistrict(addr.district);
    setAddrMunicipality(addr.municipality);
    setAddrWardNo(addr.wardNo);
    setAddrStreetAddress(addr.streetAddress);
    setAddrLandmark(addr.landmark || '');
    setAddrIsWithin5km(addr.isWithin5km);
    setAddrIsDefault(Boolean(addr.isDefault));
    setAddressError(null);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !customerProfile) return;
    setAddressError(null);
    setAddressSaving(true);

    try {
      if (!addrFullName.trim()) throw new Error('Please enter recipient full name.');
      if (!addrPhone.trim() || addrPhone.length < 7) throw new Error('Please enter a valid mobile number.');
      if (!addrStreetAddress.trim()) throw new Error('Street address or locality is required.');

      let updatedAddresses: SavedAddress[];

      if (editingAddressId) {
        updatedAddresses = await updateSavedAddress(currentUser.uid, editingAddressId, {
          label: addrLabel,
          fullName: addrFullName.trim(),
          phone: addrPhone.trim(),
          province: addrProvince,
          district: addrDistrict,
          municipality: addrMunicipality.trim(),
          wardNo: addrWardNo.trim(),
          streetAddress: addrStreetAddress.trim(),
          landmark: addrLandmark.trim() || null,
          isWithin5km: addrIsWithin5km,
          isDefault: addrIsDefault
        });
      } else {
        updatedAddresses = await addSavedAddress(currentUser.uid, {
          label: addrLabel,
          fullName: addrFullName.trim(),
          phone: addrPhone.trim(),
          province: addrProvince,
          district: addrDistrict,
          municipality: addrMunicipality.trim(),
          wardNo: addrWardNo.trim(),
          streetAddress: addrStreetAddress.trim(),
          landmark: addrLandmark.trim() || null,
          isWithin5km: addrIsWithin5km,
          isDefault: addrIsDefault
        });
      }

      setCustomerProfile({
        ...customerProfile,
        savedAddresses: updatedAddresses
      });
      setIsAddressModalOpen(false);
    } catch (err: any) {
      setAddressError(err.message || 'Failed to save address.');
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!currentUser || !customerProfile) return;
    if (!window.confirm('Are you sure you want to delete this saved delivery address?')) return;

    try {
      const updatedAddresses = await deleteSavedAddress(currentUser.uid, addressId);
      setCustomerProfile({
        ...customerProfile,
        savedAddresses: updatedAddresses
      });
    } catch (err: any) {
      alert(err.message || 'Failed to delete address.');
    }
  };

  // Link Guest Order to Customer Account
  const handleLinkGuestOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLinkMsg(null);
    setIsLinkingOrder(true);

    try {
      const linkedOrder = await linkGuestOrderToCustomer(linkOrderId, linkPhone, currentUser.uid);
      setLinkMsg({
        type: 'success',
        text: `Success! Order "${linkedOrder.orderId}" has been linked to your Khan Electronics account.`
      });
      setLinkOrderId('');
      setLinkPhone('');
      await loadCustomerRecords(currentUser.uid);
    } catch (err: any) {
      setLinkMsg({
        type: 'error',
        text: err.message || 'Could not link order. Please check reference and mobile number.'
      });
    } finally {
      setIsLinkingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-extrabold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold text-slate-900">
                  {currentUser ? (customerProfile?.fullName || 'Customer Account') : 'Customer Account Portal'}
                </h2>
                {currentUser && customerProfile && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                    {customerProfile.memberTier || 'Regular Customer'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {currentUser ? (
                  <span>{customerProfile?.email || currentUser.email} &bull; {customerProfile?.phone || 'Rajbiraj, Saptari'}</span>
                ) : (
                  <span>New Khan Automobiles & Electronics &bull; Rajbiraj Showroom</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={handleLogout}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-semibold transition-colors"
                title="Sign out of customer account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {isAuthLoading ? (
          <div className="p-16 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Connecting to Khan Electronics Customer Portal...</p>
          </div>
        ) : !currentUser ? (
          /* ========================================================================= */
          /* 1. LOGGED OUT STATE: SIGN IN / REGISTER / FORGOT PASSWORD                  */
          /* ========================================================================= */
          <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50">
            <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Auth Mode Toggle Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(null); setAuthSuccess(null); }}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    authMode === 'login' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(null); setAuthSuccess(null); }}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    authMode === 'register' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('forgot-password'); setAuthError(null); setAuthSuccess(null); }}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    authMode === 'forgot-password' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  Reset
                </button>
              </div>

              {/* Error & Success Alerts */}
              {authError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                {authMode === 'register' && (
                  <>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Full Name *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={authFullName}
                          onChange={(e) => setAuthFullName(e.target.value)}
                          placeholder="e.g. Bikash Kumar Chaudhary"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Mobile Number (Nepal) *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          required
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          placeholder="98XXXXXXXX"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-slate-800"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-slate-800"
                    />
                  </div>
                </div>

                {authMode !== 'forgot-password' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">Password *</label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => setAuthMode('forgot-password')}
                          className="text-[11px] font-semibold text-amber-700 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {authMode === 'register' && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-slate-800"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingAuth ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : authMode === 'login' ? (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : authMode === 'register' ? (
                    <>
                      <span>Create Customer Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Send Password Reset Link</span>
                      <Mail className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Guest order note */}
              <div className="pt-4 border-t border-slate-100 text-center space-y-2">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Want to track a guest purchase without signing in?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOrderTracking();
                  }}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Order with Order Reference & Phone</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 2. LOGGED IN STATE: FULL CUSTOMER PORTAL                                   */
          /* ========================================================================= */
          <>
            {/* Tab Navigation */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 overflow-x-auto flex items-center gap-2 text-xs font-semibold py-2.5 scrollbar-none">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'orders' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>My Orders ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'profile' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Personal Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'addresses' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Saved Addresses ({customerProfile?.savedAddresses?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('warranties')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'warranties' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>My Warranties ({warranties.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('service')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'service' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Service Tickets ({serviceTickets.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('exchange')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'exchange' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Samsung Exchanges ({exchangeRequests.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('finance')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'finance' ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Finance Enquiries ({financeApplications.length + financeEnquiries.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('link')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'link' ? 'bg-slate-800 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Link Guest Order</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs bg-slate-50/50">
              {/* TAB 1: MY ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Your Appliance Purchase Orders</h3>
                      <p className="text-slate-500 text-[11px]">
                        Showing orders tied securely to your Khan Electronics account.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => currentUser && loadCustomerRecords(currentUser.uid)}
                        disabled={isLoadingRecords}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRecords ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('link')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold hover:bg-amber-100"
                      >
                        <span>Link Guest Order</span>
                      </button>
                    </div>
                  </div>

                  {isLoadingRecords ? (
                    <div className="py-12 text-center text-slate-500 space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                      <p>Loading your showroom orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto text-amber-600">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-sm">No Orders Found</h4>
                        <p className="text-slate-500 text-xs max-w-sm mx-auto">
                          You haven't placed any appliance orders with this account yet. Did you order as a guest?
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        {onNavigateToCatalog && (
                          <button
                            onClick={() => {
                              onClose();
                              onNavigateToCatalog();
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
                          >
                            Explore Appliance Catalogue
                          </button>
                        )}
                        <button
                          onClick={() => setActiveTab('link')}
                          className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-colors"
                        >
                          Link an Existing Guest Order
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <div
                            key={order.id}
                            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-amber-200 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-bold text-amber-700">{order.orderId || order.id}</span>
                                <span className="text-slate-300">&bull;</span>
                                <span className="text-slate-500 text-[11px]">{orderDate}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                                  {order.orderStatus || order.status}
                                </span>
                                <button
                                  onClick={() => {
                                    onClose();
                                    onOpenOrderTracking(order.orderId || order.id);
                                  }}
                                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Track Live</span>
                                </button>
                              </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-2">
                              {order.items.map((item, idx) => {
                                const itemPrice = item.unitPrice || (item as any).price || 0;
                                const lineTotal = item.lineTotal || itemPrice * item.quantity;
                                return (
                                  <div key={idx} className="flex items-center justify-between text-slate-800 gap-3">
                                    <div className="flex items-center gap-2 truncate">
                                      {item.imageUrl && (
                                        <img
                                          src={item.imageUrl}
                                          alt={item.productName}
                                          className="w-9 h-9 rounded-lg object-contain bg-slate-50 border border-slate-100 shrink-0"
                                        />
                                      )}
                                      <div className="truncate">
                                        <div className="font-bold truncate">{item.quantity}x {item.productName}</div>
                                        {item.modelNumber && (
                                          <div className="text-[10px] text-slate-400 font-mono">{item.modelNumber}</div>
                                        )}
                                      </div>
                                    </div>
                                    <span className="font-bold shrink-0">Rs. {lineTotal.toLocaleString()}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Delivery & Payment Summary */}
                            <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-600">
                              <div className="space-y-0.5 text-[11px]">
                                <div>
                                  <span>Payment: </span>
                                  <strong className="text-slate-900">{order.paymentMethod}</strong> &bull;{' '}
                                  <span className={`font-semibold ${order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {order.paymentStatus}
                                  </span>
                                </div>
                                <div className="text-slate-500">
                                  Delivery to: {order.deliveryAddress?.streetAddress || order.deliveryAddress?.municipality || 'Rajbiraj'}, {order.deliveryAddress?.district || 'Saptari'}
                                </div>
                              </div>
                              <div className="text-left sm:text-right">
                                <span className="text-[10px] block text-slate-500 uppercase font-bold tracking-wider">Total Amount</span>
                                <span className="text-sm font-black text-slate-900">
                                  Rs. {(order.totalAmount || order.total || 0).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PERSONAL PROFILE & SECURITY */}
              {activeTab === 'profile' && (
                <div className="space-y-6 max-w-2xl">
                  {/* Feedback Message */}
                  {profileMsg && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                        profileMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  {/* Profile Info Card */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Customer Personal Details</h3>
                        <p className="text-slate-500 text-[11px]">
                          Saved in Khan Electronics Firestore database linked to your account.
                        </p>
                      </div>

                      {!isEditingProfile && (
                        <button
                          onClick={() => {
                            setEditFullName(customerProfile?.fullName || '');
                            setEditPhone(customerProfile?.phone || '');
                            setIsEditingProfile(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 hover:text-amber-900 font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>Edit Profile</span>
                        </button>
                      )}
                    </div>

                    {!isEditingProfile ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Full Name</span>
                          <span className="font-bold text-slate-900 text-sm">{customerProfile?.fullName || 'Not provided'}</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Mobile Number</span>
                          <span className="font-bold text-slate-900 text-sm">{customerProfile?.phone || 'Not provided'}</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Email Address</span>
                          <span className="font-bold text-slate-900 text-sm">{customerProfile?.email || currentUser?.email}</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                          <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Membership Tier</span>
                          <span className="font-bold text-amber-800 text-sm">{customerProfile?.memberTier || 'Regular Customer'}</span>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Mobile Phone *</label>
                          <input
                            type="tel"
                            required
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="submit"
                            disabled={profileSaving}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            {profileSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Save Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Change Password Section */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Account Security</h3>
                        <p className="text-slate-500 text-[11px]">Update your customer portal password.</p>
                      </div>

                      {!isChangingPassword && (
                        <button
                          onClick={() => {
                            setPasswordMsg(null);
                            setIsChangingPassword(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 hover:text-amber-900 font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span>Change Password</span>
                        </button>
                      )}
                    </div>

                    {passwordMsg && (
                      <div
                        className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                          passwordMsg.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                        <span>{passwordMsg.text}</span>
                      </div>
                    )}

                    {isChangingPassword && (
                      <form onSubmit={handleChangePassword} className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Current Password *</label>
                          <input
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">New Password (min 6 chars) *</label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-slate-700">Confirm New Password *</label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="submit"
                            disabled={passwordSaving}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            {passwordSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Update Password</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsChangingPassword(false)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SAVED DELIVERY ADDRESSES */}
              {activeTab === 'addresses' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Saved Delivery Addresses</h3>
                      <p className="text-slate-500 text-[11px]">
                        Save your home and office addresses for 1-click showroom checkout.
                      </p>
                    </div>

                    <button
                      onClick={handleOpenAddAddress}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  {(!customerProfile?.savedAddresses || customerProfile.savedAddresses.length === 0) ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">No Saved Addresses</h4>
                      <p className="text-slate-500 text-xs max-w-sm mx-auto">
                        Add your primary delivery address in Rajbiraj or Saptari for faster checkout.
                      </p>
                      <button
                        onClick={handleOpenAddAddress}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {customerProfile.savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 relative hover:border-amber-300 transition-colors"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-amber-600" />
                                {addr.label}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    Default
                                  </span>
                                )}
                                {addr.isWithin5km && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                                    Free Local Delivery
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="font-bold text-slate-800 text-[11px]">{addr.fullName} &bull; {addr.phone}</p>
                            <p className="text-slate-600 text-[11px]">
                              {addr.streetAddress}, {addr.wardNo}, {addr.municipality}
                            </p>
                            <p className="text-slate-500 text-[10px]">
                              {addr.district}, {addr.province}
                              {addr.landmark && ` (Near: ${addr.landmark})`}
                            </p>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3 text-slate-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-red-50 hover:border-red-200 text-red-600 font-semibold flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add / Edit Address Modal Dialog */}
                  {isAddressModalOpen && (
                    <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
                      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h4 className="font-bold text-slate-900 text-sm">
                            {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                          </h4>
                          <button
                            onClick={() => setIsAddressModalOpen(false)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {addressError && (
                          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{addressError}</span>
                          </div>
                        )}

                        <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Label (e.g. Home, Office) *</label>
                              <input
                                type="text"
                                required
                                value={addrLabel}
                                onChange={(e) => setAddrLabel(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Recipient Name *</label>
                              <input
                                type="text"
                                required
                                value={addrFullName}
                                onChange={(e) => setAddrFullName(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Mobile Phone *</label>
                              <input
                                type="tel"
                                required
                                value={addrPhone}
                                onChange={(e) => setAddrPhone(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Province *</label>
                              <select
                                value={addrProvince}
                                onChange={(e) => setAddrProvince(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 bg-white"
                              >
                                <option value="Madhesh Province">Madhesh Province</option>
                                <option value="Koshi Province">Koshi Province</option>
                                <option value="Bagmati Province">Bagmati Province</option>
                                <option value="Gandaki Province">Gandaki Province</option>
                                <option value="Lumbini Province">Lumbini Province</option>
                                <option value="Karnali Province">Karnali Province</option>
                                <option value="Sudurpashchim Province">Sudurpashchim Province</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">District *</label>
                              <input
                                type="text"
                                required
                                value={addrDistrict}
                                onChange={(e) => setAddrDistrict(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Municipality / City *</label>
                              <input
                                type="text"
                                required
                                value={addrMunicipality}
                                onChange={(e) => setAddrMunicipality(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Ward Number *</label>
                              <input
                                type="text"
                                required
                                value={addrWardNo}
                                onChange={(e) => setAddrWardNo(e.target.value)}
                                placeholder="Ward No. 3"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Nearest Landmark</label>
                              <input
                                type="text"
                                value={addrLandmark}
                                onChange={(e) => setAddrLandmark(e.target.value)}
                                placeholder="Opposite Hospital Gate"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Street / Locality Address *</label>
                            <input
                              type="text"
                              required
                              value={addrStreetAddress}
                              onChange={(e) => setAddrStreetAddress(e.target.value)}
                              placeholder="Main Road, Near Mahavir Chowk"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={addrIsWithin5km}
                                onChange={(e) => setAddrIsWithin5km(e.target.checked)}
                                className="rounded text-amber-500 focus:ring-amber-500"
                              />
                              <span className="text-slate-700 font-semibold text-[11px]">
                                Address is within 5 km of Khan Electronics Rajbiraj showroom (Free Local Delivery)
                              </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={addrIsDefault}
                                onChange={(e) => setAddrIsDefault(e.target.checked)}
                                className="rounded text-amber-500 focus:ring-amber-500"
                              />
                              <span className="text-slate-700 font-semibold text-[11px]">
                                Set as default delivery address for future orders
                              </span>
                            </label>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setIsAddressModalOpen(false)}
                              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={addressSaving}
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50"
                            >
                              {addressSaving ? 'Saving...' : editingAddressId ? 'Update Address' : 'Save Address'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MY WARRANTIES */}
              {activeTab === 'warranties' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-200/80 pb-3">
                    <h3 className="font-bold text-slate-900 text-sm">Official Manufacturer Warranties</h3>
                    <p className="text-slate-500 text-[11px]">
                      Registered warranties for Samsung, CG, Godrej, Crompton, and multi-brand appliances serviced at Khan Electronics.
                    </p>
                  </div>

                  {warranties.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto text-amber-600">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">No Registered Warranties Yet</h4>
                      <p className="text-slate-500 text-xs max-w-sm mx-auto">
                        Appliances purchased from Khan Electronics automatically appear here with their 100% genuine Nepal manufacturer warranty.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {warranties.map((warr) => (
                        <div
                          key={warr.id}
                          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-200 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-amber-700 font-bold uppercase font-display">{warr.brand}</span>
                              <span className="text-slate-300">&bull;</span>
                              <span className="font-mono text-slate-500 text-[11px]">{warr.serialNumber}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-0.5">{warr.productName}</h4>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Coverage Expiry: <strong className="text-slate-700">{warr.warrantyExpiry}</strong> &bull; Purchased: {warr.purchaseDate}
                            </p>
                          </div>

                          <div className="text-left sm:text-right shrink-0">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {warr.status}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              {warr.purchasedFromKhan ? 'Khan Store Purchase' : 'Multi-Brand Serviced Unit'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: SERVICE TICKETS */}
              {activeTab === 'service' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Appliance Service & Repair Tickets</h3>
                      <p className="text-slate-500 text-[11px]">
                        Active complaint references & assigned technician home visits in Rajbiraj / Saptari.
                      </p>
                    </div>

                    {onNavigateToService && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToService();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-xs"
                      >
                        Book Home Service Visit
                      </button>
                    )}
                  </div>

                  {serviceTickets.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto text-emerald-600">
                        <Wrench className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">No Active Service Tickets</h4>
                      <p className="text-slate-500 text-xs max-w-sm mx-auto">
                        Have a refrigerator, washing machine, or TV that needs repair? We service all brands even if bought elsewhere!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {serviceTickets.map((t) => (
                        <div key={t.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-700">{t.referenceCode}</span>
                              <span className="text-slate-300">&bull;</span>
                              <span className="font-bold text-slate-900">{t.brand} {t.applianceType}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {t.status}
                            </span>
                          </div>

                          <p className="text-slate-600">{t.issueDescription}</p>

                          {t.technician && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <span className="text-slate-500 block text-[10px]">Assigned Technician</span>
                                <span className="font-bold text-slate-900">{t.technician.name}</span>
                              </div>
                              <a href={`tel:${t.technician.phone}`} className="text-amber-700 font-bold hover:underline">
                                Call: {t.technician.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: SAMSUNG EXCHANGES */}
              {activeTab === 'exchange' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Samsung Smart Exchange Valuations</h3>
                      <p className="text-slate-500 text-[11px]">
                        Trade-in credit estimates for upgrading any old appliance brand to a new Samsung.
                      </p>
                    </div>

                    {onNavigateToExchange && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToExchange();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-xs"
                      >
                        Calculate Old Appliance Credit
                      </button>
                    )}
                  </div>

                  {exchangeRequests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto text-blue-600">
                        <Repeat className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">No Active Samsung Exchange Requests</h4>
                      <p className="text-slate-500 text-xs max-w-sm mx-auto">
                        Upgrade any old refrigerator, washing machine, or TV to genuine Samsung with instant trade-in credit at our Rajbiraj showroom.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {exchangeRequests.map((ex) => (
                        <div key={ex.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-blue-700">{ex.id}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {ex.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900">Trade-In: {ex.currentBrand} &bull; {ex.applianceType}</h4>
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-slate-500">Condition: <strong className="text-slate-700">{ex.condition}</strong></span>
                            <span className="text-amber-700 font-bold text-sm">Estimated Credit: Rs. {ex.estimatedValuation.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: HULAS FINANCE ENQUIRIES */}
              {activeTab === 'finance' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Hulas Finance 0% Interest Applications</h3>
                      <p className="text-slate-500 text-[11px]">
                        Appliance financing applications with 40% downpayment & verified Nepali citizenship.
                      </p>
                    </div>

                    {onNavigateToFinance && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToFinance();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-xs"
                      >
                        Apply for 0% Interest Finance
                      </button>
                    )}
                  </div>

                  {financeApplications.length === 0 && financeEnquiries.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto text-amber-600">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">No Finance Applications Found</h4>
                      <p className="text-slate-500 text-xs max-w-sm mx-auto">
                        Finance any appliance over Rs. 30,000 at 0% interest for up to 12 months with only your citizenship certificate.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {financeApplications.map((fin) => (
                        <div key={fin.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-amber-700">{fin.id}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {fin.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900">{fin.productName}</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-600">
                            <div>Price: <strong className="text-slate-900">Rs. {fin.productPrice.toLocaleString()}</strong></div>
                            <div>Down: <strong className="text-amber-700">{fin.downPaymentPercent}% (Rs. {fin.downPaymentAmount.toLocaleString()})</strong></div>
                            <div>Tenure: <strong className="text-slate-900">{fin.tenureMonths} Mo</strong></div>
                            <div>Monthly EMI: <strong className="text-amber-700">Rs. {fin.monthlyEmi.toLocaleString()}/mo</strong></div>
                          </div>
                          <div className="text-[11px] text-slate-500 pt-1">
                            Citizenship: <strong className="text-slate-700">{fin.citizenshipNo ? `***${fin.citizenshipNo.slice(-4)}` : 'Verified'}</strong> &bull; Hulas Finance Partner
                          </div>
                        </div>
                      ))}

                      {financeEnquiries.map((enq) => (
                        <div key={enq.enquiryId} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-amber-700">{enq.enquiryId}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {enq.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900">{enq.productName}</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-slate-600">
                            <div>Price: <strong className="text-slate-900">Rs. {enq.productPrice.toLocaleString()}</strong></div>
                            <div>Tenure: <strong className="text-slate-900">{enq.tenureMonths} Months (0% Int)</strong></div>
                            <div>Status: <strong className="text-amber-700">{enq.status}</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: LINK GUEST ORDER */}
              {activeTab === 'link' && (
                <div className="space-y-4 max-w-lg">
                  <div className="border-b border-slate-200/80 pb-3">
                    <h3 className="font-bold text-slate-900 text-sm">Link an Existing Guest Order</h3>
                    <p className="text-slate-500 text-[11px]">
                      Did you check out as a guest before creating your account? Enter the exact order reference and mobile number to associate it with your account.
                    </p>
                  </div>

                  {linkMsg && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                        linkMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {linkMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                      <span>{linkMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleLinkGuestOrder} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Order Reference Number *</label>
                      <input
                        type="text"
                        required
                        value={linkOrderId}
                        onChange={(e) => setLinkOrderId(e.target.value)}
                        placeholder="e.g. KE-ORD-2026-48291"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-mono text-slate-900 uppercase"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Mobile Phone Used on Order *</label>
                      <input
                        type="tel"
                        required
                        value={linkPhone}
                        onChange={(e) => setLinkPhone(e.target.value)}
                        placeholder="98XXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 font-medium text-slate-900"
                      />
                    </div>

                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 leading-relaxed">
                      &bull; For your privacy, orders can only be linked when the verified mobile phone matches the phone number entered during checkout.
                    </div>

                    <button
                      type="submit"
                      disabled={isLinkingOrder}
                      className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLinkingOrder ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying & Linking Order...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Link Order to Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
