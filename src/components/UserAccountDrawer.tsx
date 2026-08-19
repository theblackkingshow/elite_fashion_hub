import React, { useState } from 'react';
import {
  X,
  User,
  ShoppingBag,
  MapPin,
  Heart,
  LogOut,
  Package,
  Truck,
  ExternalLink,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
} from 'lucide-react';
import { UserProfile, OrderConfirmation, Product, ShippingAddress } from '../types';
import { authService, cloudDb } from '../lib/firebase';

interface UserAccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  orders: OrderConfirmation[];
  wishlist: Product[];
  onOpenWishlist: () => void;
  onRemoveFromWishlist: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onRefreshProfile?: () => void;
}

type AccountTab = 'orders' | 'addresses' | 'profile';

export const UserAccountDrawer: React.FC<UserAccountDrawerProps> = ({
  isOpen,
  onClose,
  userProfile,
  orders,
  wishlist,
  onOpenWishlist,
  onRemoveFromWishlist,
  onSelectProduct,
  onRefreshProfile,
}) => {
  const [activeTab, setActiveTab] = useState<AccountTab>('orders');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<ShippingAddress>({
    firstName: userProfile?.displayName?.split(' ')[0] || '',
    lastName: userProfile?.displayName?.split(' ')[1] || '',
    email: userProfile?.email || '',
    phone: '+61 400 123 456',
    addressLine1: '72 Collins Street',
    city: 'Melbourne',
    state: 'VIC',
    postalCode: '3000',
    country: 'Australia',
    deliverySpeed: 'auspost_express',
  });

  if (!isOpen) return null;

  // Filter orders made by this user email
  const userOrders = orders.filter(
    (o) =>
      o.shippingAddress.email?.toLowerCase() === userProfile?.email?.toLowerCase() ||
      o.orderId.includes('MSN')
  );

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      onClose();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    const updatedAddresses = [...(userProfile.savedAddresses || []), newAddress];
    const updatedProfile: UserProfile = {
      ...userProfile,
      savedAddresses: updatedAddresses,
    };
    try {
      await cloudDb.saveUserProfile(updatedProfile);
      setIsAddingAddress(false);
      if (onRefreshProfile) onRefreshProfile();
    } catch (err) {
      console.error('Error saving address:', err);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!userProfile) return;
    const updatedAddresses = (userProfile.savedAddresses || []).filter((_, i) => i !== index);
    const updatedProfile: UserProfile = {
      ...userProfile,
      savedAddresses: updatedAddresses,
    };
    try {
      await cloudDb.saveUserProfile(updatedProfile);
      if (onRefreshProfile) onRefreshProfile();
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          id="user-account-drawer"
          className="w-screen max-w-md bg-white border-l border-[#e5e5e5] shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#e5e5e5]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="font-display tracking-[0.2em] text-[16px] uppercase text-[#1b1c1c] font-light">
                  Client Account
                </span>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-mono uppercase px-2 py-0.5 font-semibold">
                  {userProfile?.tier || 'Noir VIP Member'}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close Account Drawer"
                className="text-[#747878] hover:text-[#1b1c1c] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patron Profile Info */}
            <div className="flex items-center gap-3.5 pt-2">
              <div className="w-12 h-12 bg-[#1b1c1c] text-white flex items-center justify-center text-[16px] font-display uppercase tracking-wider">
                {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'P'}
              </div>
              <div>
                <h3 className="font-display font-medium text-[15px] text-[#1b1c1c]">
                  {userProfile?.displayName || 'Atelier Patron'}
                </h3>
                <p className="font-mono text-[11px] text-[#747878]">{userProfile?.email}</p>
                <p className="text-[10px] text-emerald-800 font-mono mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Authenticated via Firebase
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-[#e5e5e5] mt-6 -mb-6">
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 text-[11px] font-display uppercase tracking-[0.15em] border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'orders'
                    ? 'border-[#1b1c1c] text-[#1b1c1c] font-semibold'
                    : 'border-transparent text-[#747878] hover:text-[#1b1c1c]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders ({userOrders.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`pb-3 text-[11px] font-display uppercase tracking-[0.15em] border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'addresses'
                    ? 'border-[#1b1c1c] text-[#1b1c1c] font-semibold'
                    : 'border-transparent text-[#747878] hover:text-[#1b1c1c]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Addresses ({(userProfile?.savedAddresses || []).length})</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-3 text-[11px] font-display uppercase tracking-[0.15em] border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'profile'
                    ? 'border-[#1b1c1c] text-[#1b1c1c] font-semibold'
                    : 'border-transparent text-[#747878] hover:text-[#1b1c1c]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>
            </div>
          </div>

          {/* Drawer Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {userOrders.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Package className="w-8 h-8 text-[#c4c7c7] mx-auto stroke-[1.2]" />
                    <p className="font-display uppercase text-[13px] text-[#1b1c1c] tracking-wider">
                      No order acquisitions logged yet
                    </p>
                    <p className="text-[12px] text-[#747878] max-w-xs mx-auto">
                      Garments purchased through the atelier checkout will appear here with live tracking updates.
                    </p>
                  </div>
                ) : (
                  userOrders.map((order) => (
                    <div
                      key={order.orderId}
                      className="border border-[#e5e5e5] bg-[#fbf9f9] p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between border-b border-[#efeded] pb-2.5">
                        <div>
                          <span className="font-mono text-[12px] font-bold text-[#1b1c1c] block">
                            {order.orderId}
                          </span>
                          <span className="text-[10px] text-[#747878] font-mono">{order.date}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[14px] font-bold text-[#1b1c1c]">
                            ${order.total.toFixed(2)} AUD
                          </span>
                          <span className="block text-[9px] uppercase font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold mt-0.5">
                            Dispatched / Confirmed
                          </span>
                        </div>
                      </div>

                      {/* Tracking / Waybill info */}
                      <div className="bg-white p-2.5 border border-[#efeded] flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-2">
                          <Truck className="w-3.5 h-3.5 text-[#747878]" />
                          <span>{order.carrier || 'Australia Post Express'}</span>
                        </div>
                        <span className="font-bold text-[#1b1c1c]">{order.trackingNumber || 'AU-EXP-9482103'}</span>
                      </div>

                      {/* Items preview */}
                      <div className="space-y-1.5 pt-1">
                        {order.items.map((it) => (
                          <div key={it.id} className="flex items-center justify-between text-[12px]">
                            <span className="font-medium text-[#1b1c1c] truncate max-w-[200px]">
                              {it.product.title} (Size {it.size})
                            </span>
                            <span className="font-mono text-[#5d5f5f]">x{it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[12px] uppercase tracking-wider text-[#747878]">
                    Saved Delivery Destinations
                  </span>
                  <button
                    onClick={() => setIsAddingAddress(!isAddingAddress)}
                    className="text-[11px] font-display uppercase tracking-wider text-[#1b1c1c] underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingAddress ? 'Cancel' : 'Add New Address'}</span>
                  </button>
                </div>

                {isAddingAddress && (
                  <form onSubmit={handleSaveAddress} className="bg-[#fbf9f9] border border-[#e5e5e5] p-4 space-y-3">
                    <span className="font-display uppercase tracking-wider text-[11px] font-semibold text-[#1b1c1c] block">
                      New Australian / Global Address
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="First Name"
                        required
                        value={newAddress.firstName}
                        onChange={(e) => setNewAddress({ ...newAddress, firstName: e.target.value })}
                        className="bg-white border border-[#e5e5e5] px-2.5 py-1.5 text-[12px] text-[#1b1c1c]"
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        required
                        value={newAddress.lastName}
                        onChange={(e) => setNewAddress({ ...newAddress, lastName: e.target.value })}
                        className="bg-white border border-[#e5e5e5] px-2.5 py-1.5 text-[12px] text-[#1b1c1c]"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Street Address"
                      required
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      className="w-full bg-white border border-[#e5e5e5] px-2.5 py-1.5 text-[12px] text-[#1b1c1c]"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="City / Suburb"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="bg-white border border-[#e5e5e5] px-2.5 py-1.5 text-[12px] text-[#1b1c1c]"
                      />
                      <select
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="bg-white border border-[#e5e5e5] px-2.5 py-1.5 text-[12px] text-[#1b1c1c]"
                      >
                        <option value="NSW">NSW</option>
                        <option value="VIC">VIC</option>
                        <option value="QLD">QLD</option>
                        <option value="WA">WA</option>
                        <option value="SA">SA</option>
                        <option value="TAS">TAS</option>
                        <option value="ACT">ACT</option>
                        <option value="NT">NT</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Postcode"
                        required
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        className="bg-white border border-[#e5e5e5] px-2.5 py-1.5 text-[12px] text-[#1b1c1c] font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#1b1c1c] text-white py-2 text-[11px] font-display uppercase tracking-wider hover:bg-[#5d5f5f] transition-colors cursor-pointer"
                    >
                      Save Destination Address
                    </button>
                  </form>
                )}

                {(userProfile?.savedAddresses || []).length === 0 && !isAddingAddress ? (
                  <p className="text-[12px] text-[#747878] italic">No saved addresses yet.</p>
                ) : (
                  (userProfile?.savedAddresses || []).map((addr, idx) => (
                    <div key={idx} className="p-3 bg-[#fbf9f9] border border-[#e5e5e5] flex items-start justify-between">
                      <div className="space-y-0.5 text-[12px]">
                        <p className="font-semibold text-[#1b1c1c]">
                          {addr.firstName} {addr.lastName}
                        </p>
                        <p className="text-[#5d5f5f]">{addr.addressLine1}</p>
                        <p className="text-[#5d5f5f]">
                          {addr.city}, {addr.state} {addr.postalCode} • {addr.country}
                        </p>
                        <p className="text-[11px] font-mono text-[#747878]">{addr.phone}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(idx)}
                        className="text-[#747878] hover:text-rose-700 p-1"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: PROFILE DETAILS */}
            {activeTab === 'profile' && (
              <div className="space-y-4 text-[13px]">
                <div className="p-4 bg-[#fbf9f9] border border-[#e5e5e5] space-y-3">
                  <div className="flex justify-between border-b border-[#efeded] pb-2">
                    <span className="text-[#747878] font-mono text-[11px]">Membership Tier</span>
                    <span className="font-display font-semibold text-[#1b1c1c]">
                      {userProfile?.tier || 'Noir VIP Member'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#efeded] pb-2">
                    <span className="text-[#747878] font-mono text-[11px]">Primary Email</span>
                    <span className="font-mono text-[#1b1c1c]">{userProfile?.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#efeded] pb-2">
                    <span className="text-[#747878] font-mono text-[11px]">Wishlist Garments</span>
                    <span className="font-mono text-[#1b1c1c]">{wishlist.length} Items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#747878] font-mono text-[11px]">Member Since</span>
                    <span className="font-mono text-[#1b1c1c]">
                      {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'August 2026'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="font-display uppercase text-[11px] text-emerald-900 font-semibold block">
                    Exclusive Patron Privileges Active
                  </span>
                  <p className="text-[12px] text-emerald-800">
                    Complimentary Express Dispatch on all Australian orders + Priority 24/7 Concierge.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Sign Out */}
          <div className="p-6 border-t border-[#e5e5e5] bg-[#fbf9f9]">
            <button
              onClick={handleSignOut}
              className="w-full border border-rose-300 text-rose-800 hover:bg-rose-50 py-2.5 px-4 text-[11px] font-display uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Atelier Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
