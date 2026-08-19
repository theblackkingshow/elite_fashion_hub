import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onContinueShopping: () => void;
  onOpenPaymentModal: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onContinueShopping,
  onOpenPaymentModal,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (['MAISON10', 'ELITE10'].includes(promoCode.trim().toUpperCase())) {
      setDiscountPercent(10);
      setPromoMessage('10% editorial privilege discount applied.');
    } else if (promoCode.trim().toUpperCase() === 'ARCHIVE') {
      setDiscountPercent(15);
      setPromoMessage('15% archive preview discount applied.');
    } else if (promoCode.trim()) {
      setPromoMessage('Invalid voucher or invitation code.');
    }
  };

  const handleProceedToPayment = () => {
    onClose();
    onOpenPaymentModal();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        id="cart-backdrop"
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Cart Drawer */}
      <aside
        id="cart-drawer"
        aria-label="Shopping Bag Drawer"
        className={`fixed inset-y-0 right-0 z-[70] flex flex-col p-6 md:p-8 h-full w-full max-w-[380px] md:max-w-[440px] bg-[#fbf9f9] border-l border-[#e5e5e5] shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-5 border-b border-[#e5e5e5]">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-[20px] md:text-[24px] tracking-[0.1em] uppercase text-[#1b1c1c] font-medium">
              Shopping Bag
            </h2>
            <span className="text-[13px] font-mono text-[#747878]">
              ({items.reduce((sum, item) => sum + item.quantity, 0)})
            </span>
          </div>
          <button
            id="close-cart-btn"
            aria-label="Close cart"
            onClick={onClose}
            className="text-[#1b1c1c] hover:opacity-60 transition-opacity p-2 -mr-2 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="w-12 h-12 border border-[#e5e5e5] flex items-center justify-center mb-4 text-[#747878]">
              <X className="w-6 h-6 stroke-[1]" />
            </div>
            <p className="font-display text-[18px] text-[#1b1c1c] uppercase tracking-wider mb-2">
              Your bag is empty
            </p>
            <p className="text-[14px] text-[#747878] leading-relaxed mb-8 max-w-[240px]">
              Explore our current collection of tailored garments and architectural essentials.
            </p>
            <button
              onClick={() => {
                onClose();
                onContinueShopping();
              }}
              className="w-full border border-[#1b1c1c] text-[#1b1c1c] font-display text-[12px] uppercase tracking-[0.1em] py-4 hover:bg-[#1b1c1c] hover:text-white transition-colors cursor-pointer"
            >
              View Collections
            </button>
          </div>
        ) : (
          <>
            {/* Complimentary shipping bar */}
            <div className="py-3 px-3 bg-[#efeded] my-4 text-[12px] text-[#1b1c1c] flex items-center justify-between">
              <span className="font-medium tracking-wide">Complimentary Express Shipping</span>
              <span className="font-mono text-[#5d5f5f]">Applied</span>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2 divide-y divide-[#e5e5e5]">
              {items.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  <div className="w-20 h-26 bg-[#efeded] flex-shrink-0 overflow-hidden">
                    <img
                      src={item.product.images[0].src}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-display text-[14px] font-medium text-[#1b1c1c] pr-2">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          aria-label="Remove item"
                          className="text-[#747878] hover:text-[#1b1c1c] transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </div>
                      <p className="text-[12px] text-[#747878] mt-1 font-mono">
                        Size: <span className="font-semibold text-[#1b1c1c]">{item.size}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#e5e5e5] bg-white">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                          className="p-1.5 text-[#1b1c1c] hover:bg-[#efeded] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-[12px] font-mono font-medium text-[#1b1c1c]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                          className="p-1.5 text-[#1b1c1c] hover:bg-[#efeded] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-mono text-[14px] font-medium text-[#1b1c1c]">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Voucher code form */}
            <form onSubmit={handleApplyPromo} className="pt-3 border-t border-[#e5e5e5]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="PROMO CODE (ELITE10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-white border border-[#e5e5e5] px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c]"
                />
                <button
                  type="submit"
                  className="bg-[#efeded] hover:bg-[#e3e2e2] text-[#1b1c1c] px-4 py-2 text-[11px] font-display uppercase tracking-wider font-semibold cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className={`text-[11px] mt-1.5 font-mono ${discountPercent > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {promoMessage}
                </p>
              )}
            </form>

            {/* Summary & Checkout Footer */}
            <div className="pt-4 border-t border-[#e5e5e5] space-y-2">
              <div className="flex justify-between text-[13px] text-[#5d5f5f]">
                <span>Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-[13px] text-emerald-700">
                  <span>Privilege Savings ({discountPercent}%)</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px] text-[#5d5f5f]">
                <span>Shipping</span>
                <span className="font-mono uppercase text-[11px] text-[#1b1c1c] font-medium">
                  Complimentary
                </span>
              </div>
              <div className="flex justify-between text-[16px] font-medium text-[#1b1c1c] pt-2 border-t border-[#e5e5e5]">
                <span className="font-display uppercase tracking-wide">Total</span>
                <span className="font-mono font-semibold">${total.toFixed(2)}</span>
              </div>

              <button
                id="btn-checkout"
                onClick={handleProceedToPayment}
                className="w-full mt-4 bg-[#000000] text-white font-display text-[12px] uppercase tracking-[0.15em] py-4.5 hover:bg-[#5d5f5f] transition-all flex justify-center items-center gap-3 cursor-pointer shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[#747878]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Encrypted 256-bit checkout • Free 30-day returns</span>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
};
