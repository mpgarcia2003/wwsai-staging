import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Ruler, FileText, Hash, Truck, ArrowRight, ArrowLeft, Palette, Wrench } from 'lucide-react';
import Visualizer from '../components/Visualizer';
import Stepper from '../components/Stepper';
import ConsultationModal from '../components/ConsultationModal';
import { ShadeConfig, Fabric, WindowSelection, CartItem, RoomAnalysis, ShapeType } from '../types';
import { DEFAULT_ROOM_IMAGE, getGridPrice, SHAPE_CONFIGS, VALANCE_OPTIONS, SIDE_CHANNEL_OPTIONS, STEPS } from '../constants';
import { getDynamicFabrics } from '../utils/storage';
import { useLanguage } from '../LanguageContext';
import { trackEvent } from '../utils/analytics';

interface BuilderProps {
  addToCart: (item: CartItem) => void;
  addToSwatches: (fabric: Fabric) => void;
  swatches: Fabric[];
}

const parseFraction = (fraction: string): number => {
  if (!fraction || fraction === '0') return 0;
  if (fraction.includes('/')) {
    const [num, den] = fraction.split('/').map(Number);
    return num / den;
  }
  return Number(fraction) || 0;
};

const formatDim = (value: number, fraction: string) => {
  if (!fraction || fraction === '0') return `${value}`;
  return `${value} ${fraction}`;
};

// ─── SWATCH-ONLY PATH COMPONENT ──────────────────────────
const SwatchPath: React.FC<{
  fabrics: Fabric[];
  loadingFabrics: boolean;
  onAddSwatch: (fabric: Fabric) => void;
  existingSwatches: Fabric[];
  onBack: () => void;
}> = ({ fabrics, loadingFabrics, onAddSwatch, existingSwatches, onBack }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(existingSwatches.map(s => s.id)));
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleSwatch = (fabric: Fabric) => {
    const next = new Set(selectedIds);
    if (next.has(fabric.id)) {
      next.delete(fabric.id);
    } else if (next.size < 5) {
      next.add(fabric.id);
      onAddSwatch(fabric);
    }
    setSelectedIds(next);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center" style={{ animation: 'fadeUp 0.5s ease forwards' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg, #c8a165, #d4b07a)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M4 12L10 18L20 6" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Swatches on the Way!</h2>
        <p className="text-sm text-slate-500 mb-1 max-w-xs">
          Your {selectedIds.size} free swatch{selectedIds.size > 1 ? 'es' : ''} will arrive in 3–5 business days.
        </p>
        <p className="text-xs text-slate-400 mb-6">We'll include a 10% off coupon with your swatches</p>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #c8a165, #b8914f)', boxShadow: '0 4px 15px rgba(200,161,101,0.3)' }}
        >
          Ready to Build Your Shade?
        </button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-4" style={{ animation: 'fadeUp 0.4s ease forwards' }}>
        <div className="flex gap-2 flex-wrap mb-4 p-3 rounded-xl" style={{ backgroundColor: '#faf8f4' }}>
          {fabrics.filter(f => selectedIds.has(f.id)).map(f => (
            <div key={f.id} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-100 text-[11px] font-bold text-slate-600">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: `rgb(${f.rgb.r},${f.rgb.g},${f.rgb.b})` }} />
              {f.name}
            </div>
          ))}
        </div>

        <h3 className="text-lg font-black text-slate-900 mb-1">Where should we send them?</h3>
        <p className="text-xs text-slate-400 mb-4">100% free — no credit card required</p>

        {[
          { label: 'Full Name', placeholder: 'Jane Smith', type: 'text' },
          { label: 'Email', placeholder: 'jane@example.com', type: 'email' },
          { label: 'Street Address', placeholder: '123 Main St', type: 'text' },
          { label: 'City, State, ZIP', placeholder: 'New York, NY 10001', type: 'text' },
        ].map((field, i) => (
          <div key={i} className="mb-3">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">{field.label}</label>
            <input
              type={field.type}
              placeholder={field.placeholder}
              className="w-full p-3 rounded-lg border border-gray-200 text-sm font-medium outline-none transition-colors"
              style={{ fontFamily: 'inherit' }}
              onFocus={(e) => e.target.style.borderColor = '#c8a165'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        ))}

        <button
          onClick={() => {
            setSubmitted(true);
            trackEvent('swatch_order_submitted', { swatch_count: selectedIds.size });
          }}
          className="w-full mt-2 py-3 rounded-xl text-white font-black text-sm uppercase tracking-wider transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #c8a165, #b8914f)', boxShadow: '0 4px 15px rgba(200,161,101,0.3)' }}
        >
          Send My Free Swatches
        </button>
        <button onClick={() => setShowForm(false)} className="w-full mt-2 py-2 text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors">
          ← Back to fabric selection
        </button>
      </div>
    );
  }

  // Fabric selection
  const categories = ['Light Filtering', 'Blackout'] as const;

  return (
    <div className="p-4" style={{ animation: 'fadeUp 0.4s ease forwards' }}>
      <div className="text-center mb-5">
        <h2 className="text-lg font-black text-slate-900 mb-1">Choose Your Free Swatches</h2>
        <p className="text-xs text-slate-400">Select up to 5 fabrics — we'll ship them free</p>
      </div>

      {loadingFabrics ? (
        <div className="text-center py-8 text-slate-400 text-sm">Loading fabrics...</div>
      ) : (
        categories.map(cat => {
          const catFabrics = fabrics.filter(f => f.category === cat);
          if (catFabrics.length === 0) return null;
          return (
            <div key={cat} className="mb-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{cat}</p>
              <div className="flex gap-2 flex-wrap">
                {catFabrics.map(f => {
                  const isSelected = selectedIds.has(f.id);
                  const isDisabled = !isSelected && selectedIds.size >= 5;
                  return (
                    <div
                      key={f.id}
                      onClick={() => !isDisabled && toggleSwatch(f)}
                      className={`relative flex flex-col items-center gap-1 cursor-pointer transition-all ${isDisabled ? 'opacity-30' : 'hover:scale-105'}`}
                      style={isSelected ? { transform: 'scale(1.05)' } : {}}
                    >
                      <div
                        className="w-12 h-12 rounded-lg border-2 transition-all"
                        style={{
                          backgroundColor: `rgb(${f.rgb.r},${f.rgb.g},${f.rgb.b})`,
                          borderColor: isSelected ? '#c8a165' : 'transparent',
                          boxShadow: isSelected ? '0 0 0 2px #c8a165, 0 4px 12px rgba(200,161,101,0.2)' : 'none'
                        }}
                      >
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8a165', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        )}
                      </div>
                      <span className={`text-[8px] font-bold text-center max-w-[52px] leading-tight ${isSelected ? 'text-[#8b6d3f]' : 'text-slate-500'}`}>{f.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      <div className="text-center text-xs text-slate-400 mb-3">
        {selectedIds.size}/5 swatches selected
        {selectedIds.size >= 5 && <span className="text-amber-600 font-bold"> (maximum reached)</span>}
      </div>

      <button
        onClick={() => selectedIds.size > 0 && setShowForm(true)}
        disabled={selectedIds.size === 0}
        className="w-full py-3 rounded-xl text-white font-black text-xs uppercase tracking-widest transition-all disabled:opacity-30"
        style={selectedIds.size > 0 ? { background: 'linear-gradient(135deg, #c8a165, #b8914f)', boxShadow: '0 4px 15px rgba(200,161,101,0.3)' } : { backgroundColor: '#e0dcd5' }}
      >
        {selectedIds.size > 0 ? `Get ${selectedIds.size} Free Swatch${selectedIds.size > 1 ? 'es' : ''}` : 'Select at least one swatch'}
      </button>
      <button onClick={onBack} className="w-full mt-2 py-2 text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors">
        ← Actually, I'm ready to build my shade
      </button>
    </div>
  );
};


// ─── MAIN BUILDER COMPONENT ──────────────────────────────
const Builder: React.FC<BuilderProps> = ({ addToCart, addToSwatches, swatches }) => {
  const { t } = useLanguage();
  const [path, setPath] = useState<null | 'build' | 'swatch'>(null);
  const [imageSrc, setImageSrc] = useState(DEFAULT_ROOM_IMAGE);
  const [selection, setSelection] = useState<WindowSelection | null>(null);
  const [analysis, setAnalysis] = useState<RoomAnalysis | undefined>(undefined);
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [isLoadingFabrics, setIsLoadingFabrics] = useState(false);

  // Progressive accordion state
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const [config, setConfig] = useState<ShadeConfig>({
    step: 1, shape: 'Standard', shadeType: '', material: null, mountType: 'Inside Mount',
    width: 0, widthFraction: '0', height: 0, heightFraction: '0', customDims: {},
    controlType: 'Metal Chain', motorPower: 'Rechargeable', controlPosition: 'Right',
    rollType: 'Standard', bottomBar: 'Fabric Wrapped', quantity: 1, motorizedController: false,
    motorizedHub: false, motorizedCharger: false, sunSensor: false, zipCode: '', installer: null, measureService: true,
    installService: true, isMeasurementOnly: false, valanceType: 'standard', sideChannelType: 'none'
  });

  useEffect(() => {
    const loadFabrics = async () => {
      setIsLoadingFabrics(true);
      try {
        const dynamicFabrics = await getDynamicFabrics();
        setFabrics(dynamicFabrics);
      } catch (error) {
        console.error("Failed to load fabrics:", error);
      } finally {
        setIsLoadingFabrics(false);
      }
    };
    loadFabrics();
  }, []);

  useEffect(() => {
    if (config.shape === 'Standard') setImageSrc(DEFAULT_ROOM_IMAGE);
    else {
        const shapeConfig = SHAPE_CONFIGS[config.shape];
        if (shapeConfig && shapeConfig.mask) setImageSrc(shapeConfig.mask);
    }
  }, [config.shape]);

  const priceBreakdown = useMemo(() => {
    if (config.isMeasurementOnly && config.installer) return { product: 24.99, install: config.installer.fees.measure, total: 24.99 + config.installer.fees.measure };
    
    const isSpecialty = config.shape !== 'Standard';
    const dims = (config.customDims || {}) as Record<string, number>;
    const hasCustomVal = Object.values(dims).some(v => v > 0);
    const hasSpecialtyDims = isSpecialty && (config.width > 0 || config.height > 0 || hasCustomVal);
    const hasStandardDims = !isSpecialty && config.width > 0 && config.height > 0;

    if (!(hasSpecialtyDims || hasStandardDims) || !config.material) return { product: 0, install: 0, total: 0 };
    
    let w = Number(config.width) + parseFraction(config.widthFraction);
    let h = Number(config.height) + parseFraction(config.heightFraction);
    
    if (isSpecialty) {
        const wKeys = ['width', 'bottomWidth', 'topWidth'];
        const hKeys = ['height', 'leftHeight', 'rightHeight', 'centerHeight', 'leftAngledLength', 'rightAngledLength'];
        
        w = wKeys.reduce((max, key) => Math.max(max, dims[key] || 0), w);
        h = hKeys.reduce((max, key) => Math.max(max, dims[key] || 0), h);
        
        if (w === 0 || h === 0) {
            const vals = Object.values(dims);
            w = Math.max(...vals, w);
            h = Math.max(...vals, h);
        }
    }
    
    const basePrice = getGridPrice(config.material.priceGroup, w, h, config.shape);
    
    let motorAddons = config.controlType === 'Motorized' ? (config.shape === 'Standard' ? 200 : 0) + (config.motorizedController ? 50 : 0) + (config.motorizedHub ? 50 : 0) + (config.motorizedCharger ? 70 : 0) + (config.sunSensor ? 150 : 0) : 0;
    
    const valanceOption = VALANCE_OPTIONS.find(v => v.id === config.valanceType);
    const valancePrice = (valanceOption?.pricePerInch || 0) * w;

    const bannerOption = SIDE_CHANNEL_OPTIONS.find(s => s.id === config.sideChannelType);
    const sideChannelPrice = (bannerOption?.pricePerFoot || 0) * (h / 12) * 2;

    const unitPrice = basePrice + motorAddons + valancePrice + sideChannelPrice;
    const productTotal = unitPrice * config.quantity;

    let installCost = 0;
    if (config.installer) {
      const measureFee = config.measureService ? config.installer.fees.measure : 0;
      const installFee = config.installService ? config.installer.fees.installPerUnit * config.quantity : 0;
      
      if (config.measureService) {
        installCost = Math.max(measureFee + installFee, config.installer.fees.minimum);
      } else {
        installCost = installFee;
      }
    }
    
    return { product: productTotal, install: installCost, total: productTotal + installCost };
  }, [config]);

  // Track view_item when fabric changes
  useEffect(() => {
    if (config.material) {
      trackEvent('view_item', {
        currency: 'USD',
        value: priceBreakdown.total,
        items: [{
          item_id: config.material.id || 'custom-shade',
          item_name: config.material.name || 'Custom Shade',
          item_brand: 'World Wide Shades',
          price: priceBreakdown.total,
          quantity: config.quantity
        }]
      });
    }
  }, [config.material?.id]);

  // Progressive accordion: confirm step and advance
  const handleConfirmStep = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepIndex);
    setCompletedSteps(newCompleted);

    // Find next uncompleted step
    let next = stepIndex + 1;
    while (next < STEPS.length && newCompleted.has(next)) next++;
    
    if (next < STEPS.length) {
      setOpenStep(next);
    } else {
      // All steps complete
      setOpenStep(null);
    }

    trackEvent('step_confirmed', { step_number: stepIndex + 1, step_name: STEPS[stepIndex] });
  };

  // When reopening a completed step, remove it from completed
  const handleSetOpenStep = (step: number | null) => {
    if (step !== null && completedSteps.has(step)) {
      const newCompleted = new Set(completedSteps);
      newCompleted.delete(step);
      setCompletedSteps(newCompleted);
    }
    setOpenStep(step);
  };

  const allStepsComplete = completedSteps.size === STEPS.length;

  const getShapeLabel = (s: string) => {
    const key = `shape.${s.replace(/[^a-zA-Z]/g, '').toLowerCase()}`;
    return t(key) || s;
  };

  const currentShape = SHAPE_CONFIGS[config.shape as ShapeType] || SHAPE_CONFIGS.Standard;

  const sizeSummary = useMemo(() => {
    if (config.shape === 'Standard') {
      return config.width > 0 ? `${formatDim(config.width, config.widthFraction)}" x ${formatDim(config.height, config.heightFraction)}"` : '--';
    } else {
      const dims = (config.customDims || {}) as Record<string, number>;
      const fracs = (config.customFracs || {}) as Record<string, string>;
      
      const wVal = dims.width || dims.bottomWidth || config.width || 0;
      const wFrac = fracs.width || fracs.bottomWidth || config.widthFraction || '0';
      
      const hVal = dims.height || dims.leftHeight || dims.rightHeight || dims.centerHeight || dims.rightAngledLength || dims.leftAngledLength || config.height || 0;
      const hFrac = fracs.height || fracs.leftHeight || fracs.rightHeight || fracs.centerHeight || fracs.rightAngledLength || fracs.leftAngledLength || config.heightFraction || '0';

      return wVal > 0 || hVal > 0 ? `${formatDim(wVal, wFrac)}" x ${formatDim(hVal, hFrac)}"` : '--';
    }
  }, [config]);

  const isAnyStepOpen = openStep !== null;

  // ─── FORK / PATH CHOOSER ──────────────────────────
  if (path === null) {
    return (
      <div className="bg-white h-full w-full overflow-auto flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #f5f3ec 100%)' }}>
        <div className="max-w-md w-full px-5 py-10" style={{ animation: 'fadeUp 0.5s ease forwards' }}>
          <div className="text-center mb-8">
            <div className="text-4xl mb-3" style={{ animation: 'float 3s ease-in-out infinite' }}>🪟</div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              {t('common.appName') || 'Let\'s Get Started'}
            </h1>
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
              Custom shades for windows nobody else can fit — factory-direct with 7-day shipping
            </p>
          </div>

          {/* Build path */}
          <button
            onClick={() => { setPath('build'); setOpenStep(0); trackEvent('path_selected', { path: 'build' }); }}
            className="w-full text-left p-5 bg-white rounded-2xl border-2 border-gray-100 mb-3 transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 flex items-center gap-4 group"
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: 'linear-gradient(135deg, #c8a165, #d4b07a)' }}>
              🛠
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-black text-slate-900 mb-0.5">Build My Custom Shade</div>
              <div className="text-xs text-slate-400 font-medium leading-snug">I know what I need — configure shape, fabric, size & more</div>
            </div>
            <ArrowRight size={18} className="text-gray-300 group-hover:text-[#c8a165] transition-colors shrink-0" />
          </button>

          {/* Swatch path */}
          <button
            onClick={() => { setPath('swatch'); trackEvent('path_selected', { path: 'swatch' }); }}
            className="w-full text-left p-5 bg-white rounded-2xl border-2 border-gray-100 mb-6 transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 flex items-center gap-4 group"
          >
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: '#f5f3ec' }}>
              🎨
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-black text-slate-900 mb-0.5">Send Me Free Swatches</div>
              <div className="text-xs text-slate-400 font-medium leading-snug">Still deciding? Get up to 5 fabric samples shipped free</div>
            </div>
            <ArrowRight size={18} className="text-gray-300 group-hover:text-[#c8a165] transition-colors shrink-0" />
          </button>

          {/* Trust badges */}
          <div className="flex justify-center gap-6">
            {[
              { icon: '🏭', text: 'Factory Direct' },
              { icon: '📦', text: '7-Day Shipping' },
              { icon: '📐', text: 'Any Shape' },
            ].map((b, i) => (
              <div key={i} className="text-center flex flex-col items-center gap-1">
                <span className="text-lg">{b.icon}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        `}</style>
      </div>
    );
  }

  // ─── SWATCH-ONLY PATH ──────────────────────────────
  if (path === 'swatch') {
    return (
      <div className="bg-white h-full w-full overflow-auto">
        <SwatchPath
          fabrics={fabrics}
          loadingFabrics={isLoadingFabrics}
          onAddSwatch={addToSwatches}
          existingSwatches={swatches}
          onBack={() => { setPath('build'); setOpenStep(0); }}
        />
        <style>{`
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  // ─── BUILD PATH (with progressive accordion) ──────────
  return (
    <div className="bg-gray-100 h-full w-full overflow-hidden">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row h-full bg-white shadow-2xl relative overflow-hidden">
          
          {/* LEFT PANEL: Visualizer */}
          <div className={`w-full md:w-3/5 lg:w-[60%] bg-white flex flex-col md:p-6 md:h-full overflow-hidden border-b md:border-b-0 md:border-r border-gray-200 shrink-0 transition-all duration-500 ease-in-out ${isAnyStepOpen ? 'h-[70px] p-1' : 'h-[240px] p-2'}`}>
            <div className={`flex-1 min-h-0 relative rounded-xl md:rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex flex-col px-2 md:px-12 lg:px-20 py-2 md:py-4 transition-all duration-500 ${isAnyStepOpen ? 'rounded-none border-none p-0' : ''}`}>
              <div className="w-full h-full relative flex flex-col">
                  <Visualizer 
                      imageSrc={imageSrc} 
                      onImageChange={setImageSrc} 
                      onSelectionChange={setSelection} 
                      selection={selection} 
                      onConfirmSelection={(res) => { 
                          if (res) {
                              setAnalysis(res);
                              trackEvent('visualizer_analysis_complete', { room_style: res.style, suggested_tone: res.suggestedTone });
                          }
                          setOpenStep(3); 
                          trackEvent('visualizer_confirm', { shape: config.shape, is_custom_image: !imageSrc.startsWith('http') });
                      }} 
                      selectedFabric={config.material} 
                      shape={config.shape} 
                      isCollapsed={isAnyStepOpen}
                  />
              </div>
            </div>

            {/* Configuration Blueprint - Hidden on mobile */}
            <div className="hidden md:block mt-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm shrink-0">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <FileText size={12} style={{ color: '#c8a165' }} /> {t('blueprint.title')}
                </h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('blueprint.shape')}</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-800">
                    <img src={currentShape.mask} className="w-3 h-3 object-contain opacity-60" />
                    <span className="truncate">{getShapeLabel(config.shape)}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('blueprint.material')}</div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-800 truncate">
                    {config.material ? config.material.name : <span className="text-slate-300">{t('blueprint.pending')}</span>}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('blueprint.size')}</div>
                  <div className="text-[10px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Ruler size={10} className="text-slate-300" />
                    {sizeSummary}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('blueprint.qty')}</div>
                  <div className="text-[10px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Hash size={10} className="text-slate-300" />
                    {config.quantity}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Progressive Stepper */}
          <div className="w-full md:w-2/5 lg:w-[40%] flex flex-col flex-1 md:flex-none md:h-full bg-white relative overflow-hidden">
            <div className="flex-1 overflow-y-auto p-1.5 pb-32 md:pb-1.5 scroll-smooth custom-scrollbar">
              
              {/* Progress header */}
              <div className="text-center py-3 px-2">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: '#c8a165' }}>
                  {completedSteps.size}/{STEPS.length} Steps Complete
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#f5f3ec' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${(completedSteps.size / STEPS.length) * 100}%`,
                      background: 'linear-gradient(90deg, #c8a165, #d4b07a)'
                    }}
                  />
                </div>
              </div>

              <Stepper 
                openStep={openStep}
                setOpenStep={handleSetOpenStep}
                config={config}
                setConfig={setConfig}
                activeFabricName={config.material?.name}
                onBrowseFabrics={() => setOpenStep(3)}
                fabrics={fabrics}
                loadingFabrics={isLoadingFabrics}
                onSelectFabric={(f) => setConfig({ ...config, material: f })}
                onAddSwatch={addToSwatches}
                requestedSwatches={swatches.map(s => s.id)}
                analysis={analysis}
                completedSteps={completedSteps}
                onConfirmStep={handleConfirmStep}
              />

              {/* All steps complete message */}
              {allStepsComplete && (
                <div className="text-center py-4 px-2" style={{ animation: 'fadeUp 0.5s ease forwards' }}>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: '#c8a165' }}>
                    Configuration Complete
                  </div>
                  <p className="text-xs text-slate-400">Tap any step above to make changes</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 pb-6 md:pb-3 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] fixed md:sticky bottom-0 left-0 right-0 md:left-auto md:right-auto w-full md:w-auto z-[60]">
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between gap-3">
                  
                  {/* Left: Price */}
                  <div className="shrink-0">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{t('common.total')}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xl md:text-2xl font-black text-slate-900">${priceBreakdown.total.toFixed(2)}</div>
                      <div className="text-[7px] md:text-[8px] font-bold text-green-600 uppercase flex items-center gap-1">
                        <Truck size={10} /> {t('common.freeShipping')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Buttons */}
                  <div className="flex gap-2">
                    {openStep !== null && openStep < STEPS.length - 1 && (
                      <button 
                        onClick={() => handleConfirmStep(openStep)}
                        className="text-white font-bold uppercase tracking-wider text-[9px] md:text-[10px] py-2.5 md:py-3 px-3 md:px-5 rounded-xl transition-all flex items-center gap-1"
                        style={{ 
                          background: 'linear-gradient(135deg, #c8a165, #b8914f)',
                          boxShadow: '0 4px 15px rgba(200,161,101,0.3)'
                        }}
                      >
                        {t('common.nextStep')} <ArrowRight size={12} />
                      </button>
                    )}
                    <button 
                      onClick={() => addToCart({
                        id: `item_${Date.now()}`,
                        config: { ...config },
                        unitPrice: priceBreakdown.product / config.quantity,
                        installerFee: priceBreakdown.install,
                        totalPrice: priceBreakdown.total,
                        timestamp: Date.now()
                      })}
                      disabled={priceBreakdown.total === 0}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[9px] md:text-[10px] py-2.5 md:py-3 px-3 md:px-4 rounded-xl transition-all flex items-center justify-center gap-1 disabled:opacity-30"
                    >
                      <ShoppingCart size={12} /> {t('common.add')}
                    </button>
                  </div>
                  
                </div>

                <button 
                  onClick={() => setIsConsultationOpen(true)} 
                  className="w-full mt-2 text-[9px] font-medium text-slate-400 hover:text-[#c8a165] transition-colors text-center"
                >
                  {t('common.needHelp')}
                </button>
              </div>
            </div>
          </div>
      </div>

      <ConsultationModal isOpen={isConsultationOpen} onClose={() => setIsConsultationOpen(false)} />

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
};

export default Builder;
