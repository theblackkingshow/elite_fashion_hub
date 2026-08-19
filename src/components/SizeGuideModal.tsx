import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: string) => void;
  currentSize: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectSize,
  currentSize,
}) => {
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  if (!isOpen) return null;

  const dataCm = [
    { size: 'S', us: '36', eu: '46', chest: '96 - 100', shoulder: '45', sleeve: '64', length: '118' },
    { size: 'M', us: '38', eu: '48', chest: '101 - 106', shoulder: '47', sleeve: '65', length: '120' },
    { size: 'L', us: '40', eu: '50', chest: '107 - 112', shoulder: '49', sleeve: '66', length: '122' },
    { size: 'XL', us: '42', eu: '52', chest: '113 - 118', shoulder: '51', sleeve: '67', length: '124' },
  ];

  const dataIn = [
    { size: 'S', us: '36', eu: '46', chest: '37.8 - 39.4', shoulder: '17.7', sleeve: '25.2', length: '46.5' },
    { size: 'M', us: '38', eu: '48', chest: '39.8 - 41.7', shoulder: '18.5', sleeve: '25.6', length: '47.2' },
    { size: 'L', us: '40', eu: '50', chest: '42.1 - 44.1', shoulder: '19.3', sleeve: '26.0', length: '48.0' },
    { size: 'XL', us: '42', eu: '52', chest: '44.5 - 46.5', shoulder: '20.1', sleeve: '26.4', length: '48.8' },
  ];

  const currentData = unit === 'cm' ? dataCm : dataIn;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        id="size-guide-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div
        id="size-guide-dialog"
        role="dialog"
        aria-modal="true"
        className="relative bg-[#fbf9f9] border border-[#e5e5e5] max-w-2xl w-full p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#e5e5e5]">
          <div>
            <h2 className="font-display text-[22px] md:text-[26px] uppercase tracking-[0.05em] text-[#1b1c1c] font-medium">
              Garment Sizing & Dimensions
            </h2>
            <p className="text-[13px] text-[#747878] mt-0.5">
              Architectural Oversized Tailoring Standard
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close size guide"
            className="text-[#1b1c1c] hover:opacity-60 transition-opacity p-2 -mr-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit Toggle & Model Info */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 my-6">
          <div className="text-[12px] text-[#5d5f5f]">
            <span className="font-semibold text-[#1b1c1c]">Editorial Fit Note:</span> Model is 178 cm / 5'10" wearing size S.
          </div>

          <div className="flex items-center border border-[#1b1c1c] self-start sm:self-auto">
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider cursor-pointer ${
                unit === 'cm' ? 'bg-[#1b1c1c] text-white' : 'text-[#1b1c1c] hover:bg-[#efeded]'
              }`}
            >
              Centimeters (cm)
            </button>
            <button
              onClick={() => setUnit('in')}
              className={`px-3 py-1 text-[11px] font-mono uppercase tracking-wider cursor-pointer ${
                unit === 'in' ? 'bg-[#1b1c1c] text-white' : 'text-[#1b1c1c] hover:bg-[#efeded]'
              }`}
            >
              Inches (in)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#e5e5e5] bg-white">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#efeded] text-[#1b1c1c] font-display uppercase tracking-wider text-[11px] border-b border-[#e5e5e5]">
              <tr>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-3">US / UK</th>
                <th className="py-3 px-3">EU</th>
                <th className="py-3 px-3">Chest ({unit})</th>
                <th className="py-3 px-3">Shoulder</th>
                <th className="py-3 px-3">Length</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5] font-mono text-[12px]">
              {currentData.map((row) => {
                const isCurrent = currentSize === row.size;
                return (
                  <tr
                    key={row.size}
                    className={`hover:bg-[#fbf9f9] transition-colors ${
                      isCurrent ? 'bg-[#efeded]/50 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-display font-bold text-[#1b1c1c] text-[13px]">
                      {row.size}
                    </td>
                    <td className="py-3 px-3 text-[#5d5f5f]">{row.us}</td>
                    <td className="py-3 px-3 text-[#5d5f5f]">{row.eu}</td>
                    <td className="py-3 px-3 text-[#1b1c1c]">{row.chest}</td>
                    <td className="py-3 px-3 text-[#1b1c1c]">{row.shoulder}</td>
                    <td className="py-3 px-3 text-[#1b1c1c]">{row.length}</td>
                    <td className="py-3 px-3 text-right">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-display uppercase tracking-wider text-[#1b1c1c] bg-[#e3e2e2] px-2 py-0.5">
                          <Check className="w-3 h-3" /> Selected
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onSelectSize(row.size);
                            onClose();
                          }}
                          className="text-[11px] font-display uppercase tracking-wider underline hover:text-[#1b1c1c] text-[#747878] cursor-pointer"
                        >
                          Select
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* How to measure */}
        <div className="mt-6 p-4 bg-[#f5f3f3] border border-[#e5e5e5] text-[12px] text-[#5d5f5f] leading-relaxed">
          <p className="font-display font-semibold uppercase tracking-wider text-[#1b1c1c] mb-1 text-[11px]">
            Measuring Protocol
          </p>
          <p>
            • <strong>Chest:</strong> Measure across the fullest part of the chest, keeping tape horizontal.<br />
            • <strong>Shoulder:</strong> Measure from seam edge across back to opposite shoulder bone point.<br />
            • <strong>Length:</strong> Measured from highest center neck seam down to the bottom hemline.
          </p>
        </div>
      </div>
    </div>
  );
};
