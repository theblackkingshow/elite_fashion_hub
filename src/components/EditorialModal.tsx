import React from 'react';
import { X, ArrowRight, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { EDITORIAL_ARTICLES } from '../data/products';

export type FooterTab = 'Journal' | 'Sustainability' | 'Shipping' | 'Returns' | 'Contact' | null;

interface EditorialModalProps {
  activeTab: FooterTab;
  onClose: () => void;
}

export const EditorialModal: React.FC<EditorialModalProps> = ({ activeTab, onClose }) => {
  if (!activeTab) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        id="editorial-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div
        id="editorial-dialog"
        role="dialog"
        aria-modal="true"
        className="relative bg-[#fbf9f9] border border-[#e5e5e5] max-w-3xl w-full p-6 md:p-10 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-5 border-b border-[#e5e5e5]">
          <div>
            <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#747878] font-semibold">
              MAISON Editorial Archive
            </span>
            <h2 className="font-display text-[26px] md:text-[32px] uppercase tracking-[0.05em] text-[#1b1c1c] font-medium mt-1">
              {activeTab}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[#1b1c1c] hover:opacity-60 transition-opacity p-2 -mr-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on Tab */}
        <div className="py-6">
          {activeTab === 'Journal' && (
            <div className="space-y-8">
              {EDITORIAL_ARTICLES.map((article) => (
                <article key={article.id} className="border-b border-[#e5e5e5] pb-8 last:border-0">
                  <div className="aspect-[16/9] w-full bg-[#efeded] mb-4 overflow-hidden">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#747878] font-mono mb-2">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="font-display text-[20px] font-medium text-[#1b1c1c] mb-2">
                    {article.title}
                  </h3>
                  <p className="text-[14px] text-[#5d5f5f] italic mb-4">
                    {article.subtitle}
                  </p>
                  <div className="space-y-3 text-[14px] text-[#444748] leading-relaxed">
                    {article.content.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'Sustainability' && (
            <div className="space-y-6 text-[#444748] text-[14px] leading-relaxed">
              <p className="font-display text-[18px] text-[#1b1c1c]">
                Circular Craftsmanship & Zero-Compromise Materiality
              </p>
              <p>
                At MAISON, sustainability is not an afterthought or marketing label—it is the foundational constraint of our pattern cutting and material sourcing.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="p-4 bg-[#f5f3f3] border border-[#e5e5e5]">
                  <h4 className="font-display uppercase text-[12px] tracking-wider text-[#1b1c1c] font-semibold mb-1">
                    Traceable Mills
                  </h4>
                  <p className="text-[13px] text-[#5d5f5f]">
                    100% of our virgin wools and cashmeres originate from certified humane European farms with verified regenerative land practices.
                  </p>
                </div>
                <div className="p-4 bg-[#f5f3f3] border border-[#e5e5e5]">
                  <h4 className="font-display uppercase text-[12px] tracking-wider text-[#1b1c1c] font-semibold mb-1">
                    Garment Lifetime Care
                  </h4>
                  <p className="text-[13px] text-[#5d5f5f]">
                    Every purchase includes lifetime complimentary button replacements and repair consultations at our atelier studios.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Shipping' && (
            <div className="space-y-4 text-[14px] text-[#444748] leading-relaxed">
              <p className="font-display text-[18px] text-[#1b1c1c]">Global Express Dispatch</p>
              <p>
                All orders are dispatched from our European fulfillment centers within 24 hours of confirmation.
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#5d5f5f] pt-2 text-[13px]">
                <li><strong>Complimentary Domestic Express:</strong> 2–4 business days with carbon-offset tracking.</li>
                <li><strong>International Priority:</strong> 3–5 business days via DHL Express archival courier.</li>
                <li><strong>Packaging:</strong> Shipped in 100% recycled unbleached fiber boxes with archival garment dust bags.</li>
              </ul>
            </div>
          )}

          {activeTab === 'Returns' && (
            <div className="space-y-4 text-[14px] text-[#444748] leading-relaxed">
              <p className="font-display text-[18px] text-[#1b1c1c]">Complimentary 30-Day Returns</p>
              <p>
                We accept returns and size exchanges within 30 days of delivery. Items must remain in their original unworn condition with all designer tags and hanger packaging intact.
              </p>
              <p className="text-[13px] text-[#5d5f5f]">
                Pre-printed prepaid courier labels are included in every order parcel for instantaneous return booking.
              </p>
            </div>
          )}

          {activeTab === 'Contact' && (
            <div className="space-y-6">
              <p className="text-[14px] text-[#5d5f5f]">
                Our private client advisors are available Monday through Saturday to assist with styling inquiries, measurements, and bespoke appointments.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#e5e5e5]">
                  <Mail className="w-5 h-5 text-[#1b1c1c] mb-2" />
                  <p className="font-display text-[12px] uppercase tracking-wider text-[#1b1c1c] font-semibold">
                    Client Concierge
                  </p>
                  <p className="font-mono text-[13px] text-[#5d5f5f] mt-1">concierge@maison-editorial.com</p>
                </div>
                <div className="p-4 bg-white border border-[#e5e5e5]">
                  <Phone className="w-5 h-5 text-[#1b1c1c] mb-2" />
                  <p className="font-display text-[12px] uppercase tracking-wider text-[#1b1c1c] font-semibold">
                    Atelier Studio
                  </p>
                  <p className="font-mono text-[13px] text-[#5d5f5f] mt-1">+33 (0)1 42 68 55 00</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
