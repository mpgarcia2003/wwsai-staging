
import React, { useState, useEffect } from 'react';
import { ArrowRight, ScanLine, Star, Zap } from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../LanguageContext';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const MAGIC_BEFORE_IMAGE = "https://res.cloudinary.com/dcmlcfynd/image/upload/v1764111963/ChatGPT_Image_Nov_25_2025_05_18_08_PM_skhgej.png";
const MAGIC_AFTER_IMAGE = "https://res.cloudinary.com/dcmlcfynd/image/upload/v1764111965/ChatGPT_Image_Nov_25_2025_05_20_43_PM_cxbewt.png";

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [scrollY, setScrollY] = useState(0);
  const [calcW, setCalcW] = useState(36);
  const [calcH, setCalcH] = useState(60);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const estimatedPrice = Math.round(((calcW * calcH) / 144) * 22 + 40);

  return (
    <div className="bg-white text-slate-900 overflow-hidden">
      <SEO title={t('hero.title')} description="Custom AI shades" />
      
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ transform: `translateY(${scrollY * 0.3}px)` }}>
           <img src="https://res.cloudinary.com/dcmlcfynd/image/upload/v1763601993/a-a-stylishly-modern-living-room-249b2d17-7a92-4780-bb3f-8de51e7ae658_omzhlk.webp" alt="Modern Room" className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-white/40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-10 pt-16">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm font-bold shadow-sm">
              <Zap size={14} className="fill-indigo-600 text-indigo-600" /> 
              <span>AI-Powered Design</span>
           </div>
           
           <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-slate-900 leading-none">
              {t('hero.title')} — <br/>
              <span className="text-indigo-600">{t('hero.subtitle')}</span>
           </h1>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => onNavigate('builder')} className="group px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-xl hover:scale-105 transition-all shadow-2xl flex items-center gap-3">
                <ScanLine size={24} className="text-indigo-300" />
                {t('hero.cta')}
                <ArrowRight size={24} />
            </button>
            <button onClick={() => onNavigate('contact')} className="px-10 py-5 bg-white border border-gray-200 text-slate-900 rounded-full font-bold text-xl hover:bg-gray-50 transition-all shadow-sm">
                {t('hero.consult')}
            </button>
           </div>

           <div className="pt-4 flex flex-col items-center gap-2">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Trusted by <span className="text-slate-900 font-bold">25,000+</span> happy homeowners
              </p>
           </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50 border-y border-gray-200">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
               <h2 className="text-4xl font-bold mb-4">{t('home.magic.title')}</h2>
               <p className="text-slate-500 max-w-2xl mx-auto">{t('home.magic.desc')}</p>
            </div>
            <div className="relative w-full max-w-6xl mx-auto aspect-video rounded-3xl overflow-hidden shadow-2xl border-[12px] border-white grid grid-cols-2 bg-white">
               <div className="relative h-full overflow-hidden border-r-2 border-white">
                  <img src={MAGIC_BEFORE_IMAGE} alt="Before" className="w-full h-full object-cover" />
                  <div className="absolute top-8 left-0 right-0 text-center z-30">
                    <h3 className="text-4xl md:text-7xl font-bold text-white tracking-widest drop-shadow-xl">BEFORE</h3>
                  </div>
               </div>
               <div className="relative h-full overflow-hidden">
                  <img src={MAGIC_AFTER_IMAGE} alt="After" className="w-full h-full object-cover" />
                  <div className="absolute top-8 left-0 right-0 text-center z-30">
                    <h3 className="text-4xl md:text-7xl font-bold text-white tracking-widest drop-shadow-xl">AFTER</h3>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <section className="py-24 bg-white">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-12">{t('home.calc.title')}</h2>
            <div className="bg-indigo-50 rounded-3xl p-10 border border-indigo-100 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
               <div className="space-y-6 text-left">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('home.calc.width')}: {calcW}"</label>
                    <input type="range" min="20" max="100" value={calcW} onChange={(e) => setCalcW(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-white rounded-lg appearance-none cursor-pointer mt-2" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('home.calc.height')}: {calcH}"</label>
                    <input type="range" min="20" max="120" value={calcH} onChange={(e) => setCalcH(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-white rounded-lg appearance-none cursor-pointer mt-2" />
                  </div>
               </div>
               <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                  <div className="text-xs text-slate-400 uppercase font-bold mb-2">{t('home.calc.estimate')}</div>
                  <div className="text-6xl font-bold mb-4">${estimatedPrice}</div>
                  <div className="bg-green-500 text-slate-900 text-xs font-black px-3 py-1 rounded-full inline-block">{t('home.calc.save')}</div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;
