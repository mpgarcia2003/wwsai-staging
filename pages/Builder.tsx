import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Ruler, FileText, Hash, Truck, ArrowRight, ArrowLeft, Palette, Wrench, Layers, Package, PenTool, ChevronRight, X, Mail, Check } from 'lucide-react';
import Visualizer from '../components/Visualizer';
import Stepper from '../components/Stepper';
import ConsultationModal from '../components/ConsultationModal';
import { ShadeConfig, Fabric, WindowSelection, CartItem, RoomAnalysis, ShapeType } from '../types';
import { DEFAULT_ROOM_IMAGE, getGridPrice, SHAPE_CONFIGS, VALANCE_OPTIONS, SIDE_CHANNEL_OPTIONS, STEPS, getFabricUrl } from '../constants';
import { getDynamicFabrics, saveSwatchRequest } from '../utils/storage';
import { notifyAdminSwatchRequest, notifyAdminExitIntent } from '../utils/email';
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
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', cityStateZip: '' });

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
      <div className="flex flex-col items-center justify-center p-10 text-center" style={{ animation: 'fadeUp 0.5s ease forwards' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, #c8a165, #b8914f)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 12L10 18L20 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h2 className="text-xl font-light text-[#1a1a1a] tracking-tight mb-2" style={{ letterSpacing: '-0.01em' }}>Swatches on the Way</h2>
        <p className="text-[13px] text-[#999] mb-1 max-w-xs font-normal">
          Your {selectedIds.size} free swatch{selectedIds.size > 1 ? 'es' : ''} will arrive in 3–5 business days.
        </p>
        <p className="text-[11px] text-[#bbb] mb-8">A 10% off coupon will be included with your swatches</p>
        <button
          onClick={onBack}
          className="px-8 py-3 rounded-xl text-white font-medium text-[13px] tracking-wide transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #c8a165, #b8914f)', boxShadow: '0 2px 15px rgba(200,161,101,0.2)' }}
        >
          Ready to Build Your Shade
        </button>
      </div>
    );
  }

  if (showForm) {
    const isFormValid = formData.name.trim() && formData.email.includes('@') && formData.address.trim() && formData.cityStateZip.trim();
    
    const handleSubmitSwatches = async () => {
      if (!isFormValid || isSubmitting) return;
      setIsSubmitting(true);
      
      const selectedFabrics = fabrics.filter(f => selectedIds.has(f.id)).map(f => ({
        id: f.id, name: f.name, category: f.category
      }));
      
      const saved = await saveSwatchRequest({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city_state_zip: formData.cityStateZip.trim(),
        fabrics: selectedFabrics
      });
      
      trackEvent('swatch_order_submitted', { 
        swatch_count: selectedIds.size, 
        saved_to_supabase: saved,
        fabrics: selectedFabrics.map(f => f.name)
      });
      
      // Notify admin via email
      notifyAdminSwatchRequest({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city_state_zip: formData.cityStateZip.trim(),
        fabrics: selectedFabrics
      });
      
      setIsSubmitting(false);
      setSubmitted(true);
    };

    const inputStyle = { border: '1px solid #e0dcd5', color: '#333' };
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#c8a165'; e.target.style.boxShadow = '0 0 0 3px rgba(200,161,101,0.08)'; };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = '#e0dcd5'; e.target.style.boxShadow = 'none'; };

    return (
      <div className="p-5" style={{ animation: 'fadeUp 0.4s ease forwards' }}>
        <div className="flex gap-2 flex-wrap mb-5 p-3 rounded-xl" style={{ backgroundColor: '#f9f7f3', border: '1px solid #ece8e0' }}>
          {fabrics.filter(f => selectedIds.has(f.id)).map(f => (
            <div key={f.id} className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#666]" style={{ border: '1px solid #e8e5de' }}>
              <div className="w-6 h-6 rounded-sm overflow-hidden bg-gray-50">
                <img src={getFabricUrl(f.cloudinaryId, 'thumb')} alt={f.name} className="w-full h-full object-cover" />
              </div>
              {f.name}
            </div>
          ))}
        </div>

        <h3 className="text-lg font-normal text-[#1a1a1a] mb-1 tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Where should we send them?</h3>
        <p className="text-[11px] text-[#aaa] mb-5">100% free — no credit card required</p>

        <div className="mb-3">
          <label className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#aaa] block mb-1">Full Name</label>
          <input type="text" placeholder="Jane Smith" value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 rounded-lg text-[13px] font-normal outline-none transition-all duration-200"
            style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        </div>
        <div className="mb-3">
          <label className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#aaa] block mb-1">Email</label>
          <input type="email" placeholder="jane@example.com" value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-3 rounded-lg text-[13px] font-normal outline-none transition-all duration-200"
            style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        </div>
        <div className="mb-3">
          <label className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#aaa] block mb-1">Street Address</label>
          <input type="text" placeholder="123 Main St" value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full p-3 rounded-lg text-[13px] font-normal outline-none transition-all duration-200"
            style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        </div>
        <div className="mb-3">
          <label className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#aaa] block mb-1">City, State, ZIP</label>
          <input type="text" placeholder="New York, NY 10001" value={formData.cityStateZip}
            onChange={(e) => setFormData(prev => ({ ...prev, cityStateZip: e.target.value }))}
            className="w-full p-3 rounded-lg text-[13px] font-normal outline-none transition-all duration-200"
            style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
        </div>

        <button
          onClick={handleSubmitSwatches}
          disabled={!isFormValid || isSubmitting}
          className="w-full mt-3 py-3 rounded-xl font-medium text-[13px] tracking-wide transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40"
          style={isFormValid ? { 
            background: 'linear-gradient(90deg, #C8A165 0%, #E7D8B8 55%, #C8A165 100%)', 
            boxShadow: '0 4px 16px rgba(200,161,101,0.2)', color: '#1a1a1a' 
          } : { backgroundColor: '#e0dcd5', color: '#bbb' }}
        >
          {isSubmitting ? 'Saving...' : 'Send My Free Swatches'}
        </button>
        <button onClick={() => setShowForm(false)} className="w-full mt-2 py-2 text-[#bbb] text-[11px] font-normal hover:text-[#888] transition-colors">
          ← Back to fabric selection
        </button>
      </div>
    );
  }

  // Fabric selection
  const categories = ['Light Filtering', 'Blackout'] as const;

  return (
    <div className="p-5 overflow-y-auto" style={{ animation: 'fadeUp 0.4s ease forwards' }}>
      <div className="text-center mb-6">
        <h2 className="text-xl font-normal text-[#1a1a1a] tracking-tight mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Choose Your Free Swatches</h2>
        <p className="text-[11px] text-[#aaa] font-normal">Select up to 5 fabrics — shipped at no cost</p>
      </div>

      {loadingFabrics ? (
        <div className="text-center py-8 text-[#bbb] text-[13px] font-normal">Loading fabrics...</div>
      ) : (
        categories.map(cat => {
          const catFabrics = fabrics.filter(f => f.category === cat);
          if (catFabrics.length === 0) return null;
          return (
            <div key={cat} className="mb-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#aaa] mb-2.5">{cat}</p>
              <div className="grid grid-cols-4 gap-2">
                {catFabrics.map(f => {
                  const isSelected = selectedIds.has(f.id);
                  const isDisabled = !isSelected && selectedIds.size >= 5;
                  const hasError = imgErrors[f.id];
                  return (
                    <div
                      key={f.id}
                      onClick={() => !isDisabled && toggleSwatch(f)}
                      className={`flex flex-col group cursor-pointer transition-all duration-200 ${isDisabled ? 'opacity-25 pointer-events-none' : ''}`}
                    >
                      <div className={`relative w-full aspect-square rounded-lg overflow-hidden bg-gray-50 border-2 transition-all ${
                        isSelected ? 'border-[#c8a165] shadow-md ring-1 ring-[#c8a165]' : 'border-transparent hover:border-gray-200'
                      }`}>
                        {!hasError ? (
                          <img
                            src={getFabricUrl(f.cloudinaryId, 'thumb')}
                            alt={f.name}
                            onError={() => setImgErrors(prev => ({...prev, [f.id]: true}))}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: `rgb(${f.rgb.r},${f.rgb.g},${f.rgb.b})` }} />
                        )}
                        {isSelected && (
                          <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#c8a165' }}>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </div>
                        )}
                      </div>
                      <span className={`text-[8px] font-medium text-center mt-1 leading-tight truncate ${isSelected ? 'text-[#8b6d3f]' : 'text-[#999]'}`}>
                        {f.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      <div className="text-center text-[11px] text-[#bbb] mb-3 font-normal">
        {selectedIds.size}/5 selected
        {selectedIds.size >= 5 && <span className="text-[#c8a165] font-medium"> — maximum reached</span>}
      </div>

      <button
        onClick={() => selectedIds.size > 0 && setShowForm(true)}
        disabled={selectedIds.size === 0}
        className="w-full py-3 rounded-xl text-white font-medium text-[13px] tracking-wide transition-all duration-200"
        style={selectedIds.size > 0 
          ? { background: 'linear-gradient(90deg, #C8A165 0%, #E7D8B8 55%, #C8A165 100%)', boxShadow: '0 4px 20px rgba(200,161,101,0.18)' } 
          : { backgroundColor: '#e0dcd5', color: '#bbb', cursor: 'not-allowed' }
        }
      >
        {selectedIds.size > 0 ? `Get ${selectedIds.size} Free Swatch${selectedIds.size > 1 ? 'es' : ''}` : 'Select at least one fabric'}
      </button>
      <button onClick={onBack} className="w-full mt-2 py-2 text-[#bbb] text-[11px] font-normal hover:text-[#888] transition-colors">
        ← I'm ready to build my shade
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

  // Exit intent state
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentShown, setExitIntentShown] = useState(false);
  const [exitEmail, setExitEmail] = useState('');

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

  // Smart auto-advance — confirms and advances after simple selections
  const handleAutoAdvance = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) return; // Already completed, don't re-fire
    handleConfirmStep(stepIndex);
  };

  // Exit intent detection
  useEffect(() => {
    if (path !== 'build' || exitIntentShown) return;
    
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && completedSteps.size >= 2 && !exitIntentShown) {
        setShowExitIntent(true);
        setExitIntentShown(true);
        trackEvent('exit_intent_shown', { steps_completed: completedSteps.size });
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [path, exitIntentShown, completedSteps.size]);

  const handleSaveConfig = () => {
    if (!exitEmail) return;
    // Store config + email for recovery
    const savedConfig = {
      email: exitEmail,
      config,
      completedSteps: Array.from(completedSteps),
      timestamp: Date.now()
    };
    try {
      localStorage.setItem('wws_abandoned_config', JSON.stringify(savedConfig));
    } catch (e) {}
    trackEvent('exit_intent_saved', { email: exitEmail, steps_completed: completedSteps.size });
    
    // Notify admin via email
    notifyAdminExitIntent({
      email: exitEmail,
      stepsCompleted: completedSteps.size,
      config
    });
    
    setShowExitIntent(false);
  };

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
      <div
        className="h-full w-full overflow-auto flex items-center justify-center"
        style={{ background: '#FDFBF7' }}
      >
        <div
          className="max-w-xl w-full px-6 py-16"
          style={{ animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          {/* Headline */}
          <div className="text-center mb-10">
            <h1
              className="text-[34px] md:text-[48px] font-normal text-[#141414] leading-[1.12] mb-4"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: '-0.02em',
              }}
            >
              Custom Shades Built for
              <br />
              Windows No One Else Can Fit
            </h1>
            <p className="text-[13px] md:text-[14px] text-[#8f8f8f] font-normal">
              Factory-direct with 7-day shipping
            </p>
          </div>

          {/* Primary CTA — Build */}
          <button
            onClick={() => {
              setPath('build');
              setOpenStep(0);
              trackEvent('path_selected', { path: 'build' });
            }}
            className="w-full mb-4 transition-all duration-300 active:scale-[0.995] group"
            style={{
              borderRadius: 14,
              padding: '20px 26px',
              background: 'linear-gradient(90deg, #C8A165 0%, #E7D8B8 55%, #C8A165 100%)',
              boxShadow: '0 10px 34px rgba(200,161,101,0.18)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div
                  className="text-[16px] md:text-[18px] font-medium text-[#141414] mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Build My Custom Shade
                </div>
                <div className="text-[12px] text-[#2b2b2b]/60 font-normal">
                  Configure shape, fabric, size & more
                </div>
              </div>

              <ChevronRight
                size={20}
                className="text-[#2b2b2b]/30 group-hover:text-[#2b2b2b]/60 group-hover:translate-x-0.5 transition-all shrink-0 ml-4"
              />
            </div>
          </button>

          {/* Secondary CTA — Swatches */}
          <button
            onClick={() => {
              setPath('swatch');
              trackEvent('path_selected', { path: 'swatch' });
            }}
            className="w-full mb-12 transition-all duration-300 active:scale-[0.995] group"
            style={{
              border: '1px solid rgba(20,20,20,0.10)',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.55)',
              padding: '20px 26px',
              boxShadow: '0 6px 22px rgba(0,0,0,0.04)',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div
                  className="text-[16px] md:text-[18px] font-medium text-[#141414] mb-1"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Send Me Free Swatches
                </div>
                <div className="text-[12px] text-[#8f8f8f] font-normal">
                  Get up to 5 fabric samples shipped free
                </div>
              </div>

              <ChevronRight
                size={20}
                className="text-[#bdbdbd] group-hover:text-[#8f8f8f] group-hover:translate-x-0.5 transition-all shrink-0 ml-4"
              />
            </div>
          </button>

          {/* Trust signals */}
          <div className="flex justify-center items-center gap-12">
            {[
              { label: 'Factory Direct', Icon: Package },
              { label: '7-Day Shipping', Icon: Truck },
              { label: 'Any Shape', Icon: PenTool },
            ].map(({ label, Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon size={18} className="text-[#bdbdbd]" strokeWidth={1.25} />
                <span className="text-[9px] font-medium text-[#a7a7a7] uppercase tracking-[0.18em]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
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
    <div className="h-full w-full overflow-hidden" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row h-full bg-white shadow-2xl relative overflow-hidden">
          
          {/* LEFT PANEL: Visualizer — HIDDEN on mobile */}
          <div className="hidden md:flex w-3/5 lg:w-[60%] bg-white flex-col p-6 h-full overflow-hidden border-r border-gray-100 shrink-0">
            <div className="flex-1 min-h-0 relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex flex-col px-12 lg:px-20 py-4">
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

            {/* Configuration Blueprint — Desktop only */}
            <div className="mt-4 bg-white rounded-xl p-4 shrink-0" style={{ border: '1px solid rgba(20,20,20,0.06)' }}>
              <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: '1px solid rgba(20,20,20,0.04)' }}>
                <h3 className="text-[10px] font-medium text-[#aaa] uppercase tracking-[0.18em] flex items-center gap-2">
                  <FileText size={12} style={{ color: '#c8a165' }} /> Configuration Summary
                </h3>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Shape', value: getShapeLabel(config.shape), icon: <img src={currentShape.mask} className="w-3 h-3 object-contain opacity-50" /> },
                  { label: 'Material', value: config.material ? config.material.name : '—', icon: null },
                  { label: 'Size', value: sizeSummary, icon: <Ruler size={10} className="text-[#ccc]" /> },
                  { label: 'Qty', value: config.quantity.toString(), icon: <Hash size={10} className="text-[#ccc]" /> },
                ].map((item, i) => (
                  <div key={i} className="space-y-0.5">
                    <div className="text-[9px] font-medium text-[#aaa] uppercase tracking-[0.12em]">{item.label}</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#333] truncate">
                      {item.icon}{item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Progressive Stepper — Full width on mobile */}
          <div className="w-full md:w-2/5 lg:w-[40%] flex flex-col flex-1 md:flex-none md:h-full bg-white relative overflow-hidden">
            <div className="flex-1 overflow-y-auto p-2 md:p-2.5 pb-36 md:pb-4 scroll-smooth custom-scrollbar">
              
              {/* Progress header */}
              <div className="text-center py-3 px-2">
                <div className="text-[9px] font-medium uppercase tracking-[0.18em] mb-1.5" style={{ color: '#c8a165' }}>
                  {completedSteps.size} of {STEPS.length} steps complete
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#f0ece4' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${(completedSteps.size / STEPS.length) * 100}%`,
                      background: 'linear-gradient(90deg, #c8a165, #E7D8B8, #c8a165)',
                      backgroundSize: '200% 100%',
                      animation: completedSteps.size > 0 ? 'shimmer 2s ease-in-out infinite' : 'none'
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
                onAutoAdvance={handleAutoAdvance}
              />

              {/* All steps complete */}
              {allStepsComplete && (
                <div className="text-center py-6 px-2" style={{ animation: 'fadeUp 0.5s ease forwards' }}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #c8a165, #d4b07a)' }}>
                    <Check size={20} className="text-white" strokeWidth={2} />
                  </div>
                  <div className="text-[13px] font-medium text-[#1a1a1a] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Configuration Complete
                  </div>
                  <p className="text-[11px] text-[#aaa]">Tap any step above to make changes</p>
                </div>
              )}
            </div>

            {/* SIMPLIFIED FOOTER — Price left, single CTA right */}
            <div 
              className="p-4 pb-7 md:pb-4 bg-white fixed md:sticky bottom-0 left-0 right-0 md:left-auto md:right-auto w-full md:w-auto z-[60]"
              style={{ borderTop: '1px solid rgba(20,20,20,0.06)', boxShadow: '0 -8px 30px rgba(0,0,0,0.03)' }}
            >
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between gap-4">
                  
                  {/* Price */}
                  <div className="shrink-0">
                    <div className="text-[9px] font-medium text-[#aaa] uppercase tracking-[0.12em]">Total</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-[22px] md:text-[26px] font-medium text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.02em' }}>
                        ${priceBreakdown.total.toFixed(2)}
                      </div>
                      <div className="text-[8px] font-medium text-[#2d8a4e] uppercase tracking-wider flex items-center gap-0.5">
                        <Truck size={9} /> Free Shipping
                      </div>
                    </div>
                    {priceBreakdown.total > 50 && (
                      <div className="text-[10px] text-[#999] mt-0.5 flex items-center gap-1">
                        or <span className="font-medium text-[#6b6bef]">${(priceBreakdown.total / 12).toFixed(2)}/mo</span> with <span className="font-semibold italic text-[#6b6bef]">affirm</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Single CTA — context-aware */}
                  {allStepsComplete ? (
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
                      className="py-3 px-6 rounded-xl font-medium text-[13px] tracking-wide transition-all duration-300 hover:shadow-xl active:scale-[0.98] flex items-center gap-2 disabled:opacity-30"
                      style={{ 
                        background: 'linear-gradient(90deg, #C8A165 0%, #E7D8B8 55%, #C8A165 100%)',
                        boxShadow: '0 6px 24px rgba(200,161,101,0.2)',
                        color: '#1a1a1a',
                        fontFamily: "'Playfair Display', Georgia, serif"
                      }}
                    >
                      <ShoppingCart size={15} /> Add to Cart
                    </button>
                  ) : (
                    <button 
                      onClick={() => openStep !== null && handleConfirmStep(openStep)}
                      disabled={openStep === null}
                      className="py-3 px-6 rounded-xl font-medium text-[13px] tracking-wide transition-all duration-300 hover:shadow-xl active:scale-[0.98] flex items-center gap-2 disabled:opacity-30"
                      style={{ 
                        background: 'linear-gradient(90deg, #C8A165 0%, #E7D8B8 55%, #C8A165 100%)',
                        boxShadow: '0 6px 24px rgba(200,161,101,0.2)',
                        color: '#1a1a1a',
                        fontFamily: "'Playfair Display', Georgia, serif"
                      }}
                    >
                      Continue <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>

                <button 
                  onClick={() => setIsConsultationOpen(true)} 
                  className="w-full mt-2 text-[9px] font-normal text-[#bbb] hover:text-[#c8a165] transition-colors text-center"
                >
                  Need help with your configuration?
                </button>
              </div>
            </div>
          </div>
      </div>

      <ConsultationModal isOpen={isConsultationOpen} onClose={() => setIsConsultationOpen(false)} />

      {/* EXIT INTENT MODAL */}
      {showExitIntent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ animation: 'fadeUp 0.3s ease forwards' }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowExitIntent(false)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl" style={{ animation: 'modalSpring 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            <button onClick={() => setShowExitIntent(false)} className="absolute top-4 right-4 text-[#ccc] hover:text-[#999] transition-colors">
              <X size={18} />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#f5f3ec' }}>
                <Mail size={20} style={{ color: '#c8a165' }} strokeWidth={1.5} />
              </div>
              <h3 className="text-[20px] font-normal text-[#1a1a1a] mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Save Your Progress?
              </h3>
              <p className="text-[12px] text-[#999] font-normal leading-relaxed">
                We'll email you a link to pick up right where you left off — {completedSteps.size} step{completedSteps.size !== 1 ? 's' : ''} already done.
              </p>
            </div>
            
            <div className="mb-4">
              <input
                type="email"
                value={exitEmail}
                onChange={(e) => setExitEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-3.5 rounded-xl text-[13px] font-normal outline-none transition-all duration-200"
                style={{ border: '1px solid #e0dcd5', color: '#333' }}
                onFocus={(e) => { e.target.style.borderColor = '#c8a165'; e.target.style.boxShadow = '0 0 0 3px rgba(200,161,101,0.08)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e0dcd5'; e.target.style.boxShadow = 'none'; }}
                autoFocus
              />
            </div>
            
            <button
              onClick={handleSaveConfig}
              disabled={!exitEmail.includes('@')}
              className="w-full py-3.5 rounded-xl font-medium text-[13px] tracking-wide transition-all duration-300 disabled:opacity-30"
              style={{ 
                background: 'linear-gradient(90deg, #C8A165 0%, #E7D8B8 55%, #C8A165 100%)',
                boxShadow: '0 4px 16px rgba(200,161,101,0.2)',
                color: '#1a1a1a',
                fontFamily: "'Playfair Display', Georgia, serif"
              }}
            >
              Save My Configuration
            </button>
            
            <button
              onClick={() => setShowExitIntent(false)}
              className="w-full mt-2 py-2 text-[11px] font-normal text-[#bbb] hover:text-[#888] transition-colors"
            >
              No thanks, I'll start over
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes modalSpring {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          70% { transform: translateY(-4px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Builder;
