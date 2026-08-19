import React from 'react';
import { FooterTab } from './EditorialModal';
import { Lock } from 'lucide-react';

interface FooterProps {
  onOpenTab: (tab: FooterTab) => void;
  onLogoClick: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTab, onLogoClick, onOpenAdmin }) => {
  const links: ('Journal' | 'Sustainability' | 'Shipping' | 'Returns' | 'Contact')[] = [
    'Journal',
    'Sustainability',
    'Shipping',
    'Returns',
    'Contact',
  ];

  return (
    <footer
      id="main-footer"
      className="w-full py-16 md:py-20 px-5 md:px-16 mt-auto flex flex-col gap-6 bg-[#fbf9f9] border-t border-[#e5e5e5]"
    >
      <div className="max-w-[1440px] mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <button
          onClick={onLogoClick}
          className="font-display text-[20px] md:text-[22px] uppercase tracking-[0.2em] text-[#1b1c1c] font-medium text-left cursor-pointer hover:opacity-80 transition-opacity"
        >
          MAISON
        </button>

        <nav className="flex flex-wrap items-center gap-6 font-body text-[15px] text-[#5d5f5f]">
          {links.map((link) => (
            <button
              key={link}
              onClick={() => onOpenTab(link)}
              className="hover:text-[#1b1c1c] transition-colors cursor-pointer"
            >
              {link}
            </button>
          ))}
        </nav>
      </div>

      <div className="max-w-[1440px] mx-auto w-full text-[#747878] font-body text-[13px] md:text-[14px] mt-4 pt-4 border-t border-[#e5e5e5]/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <p>© 2024 MAISON EDITORIAL. ALL RIGHTS RESERVED.</p>
          <span className="hidden sm:inline text-[#c4c7c7]">•</span>
          <p className="font-mono text-[11px] text-[#747878]">PARIS • MILAN • TOKYO • NEW YORK</p>
        </div>

        {/* Discreet Staff & Admin Portal Entry */}
        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            id="btn-footer-staff-portal"
            className="text-[11px] font-mono text-[#9a9d9d] hover:text-[#1b1c1c] transition-colors cursor-pointer flex items-center gap-1.5"
            title="Open Atelier Back-Office Portal"
          >
            <Lock className="w-3 h-3" />
            <span>Staff Portal</span>
          </button>
        )}
      </div>
    </footer>
  );
};
