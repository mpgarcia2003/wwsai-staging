import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Ruler, FileText, Hash, Truck, ArrowRight } from 'lucide-react';
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

const Builder: React.FC<BuilderProps> = ({ addToCart, addToSwatches, swatches }) => {
  const { t } = useLanguage();
  const [imageSrc, setImageSrc] = useState(DEFAULT_ROOM_IMAGE);
  const [selection, setSelection] = useState<WindowSelection | null>(null);
  const [analysis, setAnalysis] = useState<RoomAnalysis | undefined>(undefined);
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [isLoadingFabrics, setIsLoadingFabrics] = useState(false);

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

    // Calculate installation cost
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
  const handleNextStep = () => {
    if (openStep !== null && openStep < STEPS.length - 1) {
      setOpenStep(openStep + 1);
    } else {
      setOpenStep(null);
    }
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

  const isLastStep = openStep === STEPS.length - 1;
  const isAnyStepOpen = openStep !== null;

  return (
    <div className="bg-gray-100 h-full w-full overflow-hidden">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row h-full bg-white shadow-2xl relative overflow-hidden">
          
          {/* LEFT PANEL: Visualizer - Dynamic Header strictly enforced for mobile */}
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
                  <FileText size={12} className="text-indigo-600" /> {t('blueprint.title')}
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

          {/* RIGHT PANEL: Steps - Takes remaining space */}
          <div className="w-full md:w-2/5 lg:w-[40%] flex flex-col flex-1 md:flex-none md:h-full bg-white relative overflow-hidden">
            <div className="flex-1 overflow-y-auto p-1.5 pb-32 md:pb-1.5 scroll-smooth custom-scrollbar">
              <Stepper 
                openStep={openStep}
                setOpenStep={setOpenStep}
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
              />
            </div>

            {/* Footer - Optimized Compact Layout with iOS Safe Area support */}
            <div className="p-3 pb-6 md:pb-3 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] fixed md:sticky bottom-0 left-0 right-0 md:left-auto md:right-auto w-full md:w-auto z-[60]">
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between gap-3">
                  
                  {/* Left: Price stacked with Free Ship */}
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
                    {openStep !== null && !isLastStep && (
                      <button 
                        onClick={handleNextStep}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-[9px] md:text-[10px] py-2.5 md:py-3 px-3 md:px-5 rounded-xl transition-all flex items-center gap-1 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
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
                  className="w-full mt-2 text-[9px] font-medium text-slate-400 hover:text-indigo-600 transition-colors text-center"
                >
                  {t('common.needHelp')}
                </button>
              </div>
            </div>
          </div>
      </div>

      <ConsultationModal isOpen={isConsultationOpen} onClose={() => setIsConsultationOpen(false)} />
    </div>
  );
};

export default Builder;