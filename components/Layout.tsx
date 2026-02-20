import React from 'react';
import { ShoppingCart, Globe, ExternalLink } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
  cartCount: number;
  swatchCount: number;
  onOpenCart: () => void;
  onOpenSwatches: () => void;
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, any>) => void;
}

const SHOPIFY_URL = 'https://worldwideshades.com/';

const Layout: React.FC<LayoutProps> = ({ children, cartCount, swatchCount, onOpenCart, onOpenSwatches, currentPage, onNavigate }) => {
  const { t, toggleLanguage, language } = useLanguage();

  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-white text-slate-900 overflow-hidden">
      
      {/* Navigation - Fixed Height 64px */}
      <header className="h-16 bg-white border-b border-gray-200 text-slate-900 shrink-0 z-[60] relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href={SHOPIFY_URL} target="_top" className="text-xl font-bold tracking-tight flex items-center gap-1 group">
              World Wide <span style={{ color: '#c8a165' }}>Shades</span>.
              <ExternalLink size={12} className="text-slate-300 group-hover:text-[#c8a165] transition-colors" />
            </a>
            
            {currentPage === 'admin' && (
              <button onClick={() => onNavigate('builder')} className="text-sm font-bold text-[#c8a165] hover:underline">
                Back to Visualizer
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Switcher - Desktop */}
            <button 
                onClick={toggleLanguage}
                className="hidden md:flex items-center gap-1.5 text-slate-600 hover:text-[#c8a165] font-bold text-xs mr-2 border border-gray-200 px-2 py-1 rounded transition-colors"
                title="Change Language"
            >
                <Globe size={14} />
                {language === 'en' ? 'ES' : 'EN'}
            </button>

            <button 
              onClick={onOpenSwatches} 
              className="relative px-4 py-2 rounded-full transition-colors bg-slate-100 hover:bg-slate-200 text-slate-900 flex items-center gap-2"
              title="Order Free Swatches"
            >
               <span className="font-bold text-xs hidden sm:inline">{t('nav.swatches')}</span>
               <span className="font-bold text-xs sm:hidden">Swatches</span>
               {swatchCount > 0 && (
                 <span className="absolute -top-1 -right-1 bg-slate-800 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-in zoom-in font-bold">
                   {swatchCount}
                 </span>
               )}
            </button>

            <button onClick={onOpenCart} className="relative p-2 rounded-full transition-colors hover:bg-gray-100">
               <ShoppingCart className="w-6 h-6 text-slate-700" />
               {cartCount > 0 && (
                 <span className="absolute top-0 right-0 bg-[#c8a165] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-in zoom-in font-bold">
                   {cartCount}
                 </span>
               )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Strictly fills remaining height and prevents all scrolling */}
      <main className="flex-1 min-h-0 bg-gray-50 overflow-hidden relative">
        {children}
      </main>

    </div>
  );
};

export default Layout;