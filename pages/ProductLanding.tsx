import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, CheckCircle, Star, ShieldCheck, Ruler, Truck, HelpCircle, Zap, Clock, Play, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { LandingPageData } from '../data/landingContent';
import { getDynamicFabrics } from '../utils/storage';
import { getFabricUrl, getGridPrice } from '../constants';
import SEO from '../components/SEO';
import { Fabric } from '../types';

interface ProductLandingProps {
  data: LandingPageData;
  onNavigate: (page: string) => void;
}

const ProductLanding: React.FC<ProductLandingProps> = ({ data, onNavigate }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  
  // Calculator State
  const [calcW, setCalcW] = useState(36);
  const [calcH, setCalcH] = useState(60);

  const isGuidePage = data.category === 'learn' || data.category === 'safety' || data.category === 'tools';
  const isCalculatorPage = data.slug === 'shade-price-calculator';

  // Scroll Listener for Sticky Header
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fix: getDynamicFabrics returns a Promise<Fabric[]>. We use state and useEffect to handle the async fetch.
  const [matchingFabrics, setMatchingFabrics] = useState<Fabric[]>([]);

  useEffect(() => {
    const loadFabrics = async () => {
      const all = await getDynamicFabrics();
      let filtered = data.fabricFilter ? all.filter(data.fabricFilter) : all;
      setMatchingFabrics(filtered.slice(0, 8));
    };
    loadFabrics();
  }, [data]);

  const startingPrice = useMemo(() => {
    return matchingFabrics.length > 0 
      ? getGridPrice(matchingFabrics[0].priceGroup, 24, 36) 
      : 89;
  }, [matchingFabrics]);

  const calcPrice = Math.round(((calcW * calcH) / 144) * 22 + 40);

  // Generate JSON-LD Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.title,
    "description": data.description,
    "brand": { "@type": "Brand", "name": "World Wide Shades" },
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": startingPrice,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": data.stats?.rating || "4.9",
      "reviewCount": data.stats?.reviews || "1000"
    }
  };

  return (
    <div className="bg-white animate-in fade-in duration-500 selection:bg-indigo-100">
      <SEO 
        title={`${data.title} | World Wide Shades`}
        description={data.description}
        image={data.heroImage}
        schema={productSchema}
      />

      {/* --- STICKY CONVERSION BAR --- */}
      <div className={`fixed top-0 left-0 right-0 bg-white shadow-md z-50 transition-transform duration-300 px-6 py-3 flex justify-between items-center border-b border-gray-200 ${isSticky ? 'translate-y-0' : '-translate-y-full'}`}>
         <div className="hidden md:block font-bold text-slate-900">{data.title}</div>
         <div className="flex items-center gap-4 ml-auto">
            {!isGuidePage && (
              <div className="text-right hidden sm:block">
                 <div className="text-[10px] text-green-600 font-bold uppercase tracking-wide">In Stock</div>
                 <div className="text-sm font-bold text-slate-900">Ships in 3 Days</div>
              </div>
            )}
            <button 
              onClick={() => onNavigate('builder')}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
            >
              {isGuidePage ? 'Start Project' : 'Build Quote'}
            </button>
         </div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img src={data.heroImage} alt={data.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 pt-20">
          <div className="space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex flex-wrap items-center gap-3 text-xs font-bold text-white/90">
               <span className="flex items-center gap-1 bg-white/10 backdrop-blur px-3 py-1 rounded-full border border-white/20">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" /> {data.stats?.rating || '4.9'} ({data.stats?.reviews || '2k+'} Reviews)
               </span>
               <span className="flex items-center gap-1">
                  <Truck size={14} /> Free Shipping
               </span>
               <span className="flex items-center gap-1">
                  <ShieldCheck size={14} /> Lifetime Warranty
               </span>
            </div>
            
            {/* Dynamic H1 */}
            <div>
               <h1 className="text-4xl md:text-6xl font-bold text-white leading-[1.1] mb-4">
                 {data.title}
               </h1>
               <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed">
                 {data.subtitle}. {data.description}
               </p>
            </div>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={() => onNavigate('builder')}
                className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-2 group"
              >
                {isGuidePage ? 'Design Custom Shades' : 'Get Instant Quote'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              {isCalculatorPage ? null : (
                <button 
                  onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-2"
                >
                  Learn More
                </button>
              )}
            </div>
            
            {!isGuidePage && (
              <p className="text-xs text-slate-400 font-medium pl-2 border-l-2 border-indigo-500">
                 Starting at ${startingPrice} • Ships in 3 Days • DIY Install in 15 Mins
              </p>
            )}
          </div>
        </div>
      </section>

      {/* --- VIDEO SECTION (If Present) --- */}
      {data.video && (
        <section className="py-20 bg-slate-900 text-white">
           <div className="max-w-6xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                 <div>
                    <h2 className="text-3xl font-bold mb-4">{data.video.title}</h2>
                    <p className="text-slate-400 mb-6">Watch our expert guide. Follow along step-by-step for professional results.</p>
                    <div className="flex items-center gap-4 text-sm font-bold">
                       <span className="flex items-center gap-2"><Clock size={16} /> {data.video.duration}</span>
                       <span className="flex items-center gap-2 text-indigo-400"><Play size={16} /> Watch Now</span>
                    </div>
                 </div>
                 <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-700 group cursor-pointer">
                    <img src={data.video.thumbnail} alt={data.video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play size={24} fill="white" className="ml-1" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* --- INTERACTIVE CALCULATOR (Always shown for calculator page, optional for others) --- */}
      {(isCalculatorPage || !isGuidePage) && (
        <section id="calculator" className={`py-24 ${isCalculatorPage ? 'bg-white' : 'bg-slate-900 text-white'} relative overflow-hidden`}>
           {!isCalculatorPage && <div className="absolute inset-0 bg-indigo-600/10" />}
           <div className="max-w-4xl mx-auto px-6 relative z-10">
              <div className="text-center mb-10">
                 <div className={`inline-flex items-center gap-2 font-bold text-xs uppercase tracking-widest mb-2 ${isCalculatorPage ? 'text-indigo-600' : 'text-indigo-300'}`}>
                    <Zap size={14} /> Instant Estimate
                 </div>
                 <h2 className={`text-3xl md:text-4xl font-bold ${isCalculatorPage ? 'text-slate-900' : 'text-white'}`}>See How Much You Save</h2>
              </div>

              <div className={`${isCalculatorPage ? 'bg-white border-gray-200' : 'bg-white/10 backdrop-blur-lg border-white/10'} rounded-2xl p-8 border shadow-2xl`}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                       <div>
                          <label className={`text-sm font-bold uppercase block mb-2 ${isCalculatorPage ? 'text-slate-500' : 'text-slate-300'}`}>Width: <span className={isCalculatorPage ? 'text-slate-900' : 'text-white'}>{calcW}"</span></label>
                          <input type="range" min="20" max="100" value={calcW} onChange={(e) => setCalcW(Number(e.target.value))} className="w-full accent-indigo-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                       </div>
                       <div>
                          <label className={`text-sm font-bold uppercase block mb-2 ${isCalculatorPage ? 'text-slate-500' : 'text-slate-300'}`}>Height: <span className={isCalculatorPage ? 'text-slate-900' : 'text-white'}>{calcH}"</span></label>
                          <input type="range" min="20" max="100" value={calcH} onChange={(e) => setCalcH(Number(e.target.value))} className="w-full accent-indigo-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                       </div>
                    </div>

                    <div className={`text-center rounded-xl p-6 shadow-lg ${isCalculatorPage ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                       <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isCalculatorPage ? 'text-slate-400' : 'text-slate-400'}`}>Estimated Price</p>
                       <div className="text-5xl font-bold mb-2">${calcPrice}</div>
                       <p className="text-xs text-green-600 font-bold bg-green-100 inline-block px-2 py-1 rounded">
                          Includes Shipping
                       </p>
                       <button 
                          onClick={() => onNavigate('builder')}
                          className={`w-full mt-6 py-3 rounded-lg font-bold transition-colors ${isCalculatorPage ? 'bg-white text-slate-900 hover:bg-gray-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                       >
                          Lock In This Price
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}

      {/* --- BENEFITS GRID (Generic Detail Section) --- */}
      <section id="details" className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {data.benefits.map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={idx} className="flex flex-col items-center text-center">
                       <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                          <Icon size={32} />
                       </div>
                       <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                       <p className="text-slate-600 leading-relaxed max-w-xs">{benefit.desc}</p>
                    </div>
                  )
               })}
            </div>
         </div>
      </section>

      {/* --- PROBLEM / SOLUTION (For Educational Pages) --- */}
      {data.problemSolution && (
         <section className="py-20 bg-slate-50 border-y border-gray-200">
            <div className="max-w-6xl mx-auto px-6">
               <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{data.problemSolution.heading}</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Problem Card */}
                  <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-sm">
                     <h3 className="text-xl font-bold text-red-800 mb-6 flex items-center gap-2">
                        <X size={24} className="bg-red-100 p-1 rounded-full" /> The Problem
                     </h3>
                     <ul className="space-y-4">
                        {data.problemSolution.problems.map((prob, i) => (
                           <li key={i} className="flex items-start gap-3 text-red-900/80 font-medium">
                              <span className="text-xl leading-none">❌</span> {prob}
                           </li>
                        ))}
                     </ul>
                  </div>

                  {/* Solution Card */}
                  <div className="bg-white p-8 rounded-2xl border border-green-100 shadow-lg relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">WINNER</div>
                     <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
                        <Check size={24} className="bg-green-100 p-1 rounded-full" /> {data.problemSolution.solution}
                     </h3>
                     <ul className="space-y-4">
                        {data.problemSolution.benefits.map((ben, i) => (
                           <li key={i} className="flex items-start gap-3 text-green-900/80 font-bold">
                              <span className="text-xl leading-none">✅</span> {ben}
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>
         </section>
      )}

      {/* --- COMPARISON TABLE --- */}
      {data.comparisonTable && (
         <section className="py-24 bg-gray-50">
            <div className="max-w-5xl mx-auto px-6">
               <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">The Smart Choice</h2>
               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-3 bg-slate-50 border-b border-gray-200 p-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-center">
                     <div className="text-left pl-4">Feature</div>
                     <div className="text-indigo-600 text-lg md:text-xl">World Wide Shades</div>
                     <div className="text-gray-400">{data.comparisonTable.competitor}</div>
                  </div>
                  <div className="divide-y divide-gray-100">
                     {data.comparisonTable.rows.map((row, i) => (
                        <div key={i} className={`grid grid-cols-3 p-5 text-center items-center ${row.highlight ? 'bg-indigo-50/30' : ''}`}>
                           <div className="text-left pl-4 font-bold text-slate-700 text-sm md:text-base">{row.feature}</div>
                           <div className="font-bold text-slate-900 text-base md:text-lg flex justify-center items-center gap-2">
                              {row.us.includes('Lifetime') && <ShieldCheck size={16} className="text-indigo-600" />}
                              {row.us}
                           </div>
                           <div className="text-gray-400 text-sm md:text-base">{row.them}</div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </section>
      )}

      {/* --- FABRIC CAROUSEL (Show on Shade pages) --- */}
      {!isGuidePage && (
        <section className="py-24 bg-white">
           <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-between items-end mb-10">
                 <div>
                    <h2 className="text-3xl font-bold text-slate-900">Trending Fabrics</h2>
                    <p className="text-slate-500 mt-2">Hand-selected for modern homes.</p>
                 </div>
                 <button onClick={() => onNavigate('builder')} className="hidden md:flex items-center gap-2 text-indigo-600 font-bold hover:underline">
                    See All {data.category} <ArrowRight size={16} />
                 </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {matchingFabrics.map(fabric => (
                    <div 
                       key={fabric.id} 
                       onClick={() => onNavigate('builder')}
                       className="group cursor-pointer"
                    >
                       <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative mb-3 shadow-sm border border-gray-100">
                          <img 
                             src={getFabricUrl(fabric.cloudinaryId, 'thumb')} 
                             alt={fabric.name}
                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-center">
                             <span className="text-xs font-bold text-slate-900">Customize</span>
                             <ArrowRight size={14} className="text-indigo-600" />
                          </div>
                       </div>
                       <h4 className="font-bold text-slate-900 text-sm">{fabric.name}</h4>
                       <p className="text-xs text-slate-500">{fabric.category}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* --- FAQ SECTION (Structured for SEO) --- */}
      {data.faq && (
         <section className="py-24 bg-white">
            <div className="max-w-3xl mx-auto px-6">
               <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Frequently Asked Questions</h2>
               <div className="space-y-4">
                  {data.faq.map((item, idx) => (
                     <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                        <button 
                           onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                           className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                        >
                           <span className="font-bold text-slate-900 pr-4">{item.question}</span>
                           {activeFaq === idx ? <ChevronUp size={20} className="text-indigo-600" /> : <ChevronDown size={20} className="text-gray-400" />}
                        </button>
                        {activeFaq === idx && (
                           <div className="p-5 pt-0 text-slate-600 leading-relaxed bg-white animate-in slide-in-from-top-2">
                              {item.answer}
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>
         </section>
      )}

      {/* --- FINAL CTA --- */}
      <section className="py-24 bg-slate-900 text-white text-center px-6">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Stop Overpaying for Shades.</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
               Join 50,000+ homeowners who saved 40% by switching to World Wide Shades.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <button 
                  onClick={() => onNavigate('builder')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-xl transform hover:scale-105"
               >
                  Design Your Shade
               </button>
               <button 
                  onClick={() => onNavigate('contact')}
                  className="bg-transparent border border-slate-600 hover:bg-white hover:text-slate-900 text-white px-10 py-4 rounded-full font-bold text-lg transition-all"
               >
                  Order Free Samples
               </button>
            </div>
            <p className="text-sm text-slate-500 mt-8">
               No credit card required for samples.
            </p>
         </div>
      </section>
    </div>
  );
};

export default ProductLanding;