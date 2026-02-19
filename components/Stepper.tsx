import React, { useEffect, useState, useMemo } from 'react';
import { Search, MapPin, Check, Ruler, UserCheck, Star, CheckCircle, Zap, Layout, Sidebar, Battery, Smartphone, Sun, Wrench, Info, ArrowRight, X, Layers, Image as ImageIcon, PanelLeftClose } from 'lucide-react';
import { ShadeConfig, ShapeType, Fabric, RoomAnalysis } from '../types';
import { STEPS, FRACTIONS, getInstallerForZip, SHAPE_CONFIGS, VALANCE_OPTIONS, SIDE_CHANNEL_OPTIONS, ALL_FABRICS } from '../constants';
import FabricSuggestions from './FabricSuggestions';
import { useLanguage } from '../LanguageContext';
import { trackEvent } from '../utils/analytics';

interface StepperProps {
  openStep: number | null;
  setOpenStep: (step: number | null) => void;
  config: ShadeConfig;
  setConfig: (config: ShadeConfig) => void;
  activeFabricName?: string;
  onBrowseFabrics: () => void;
  fabrics: Fabric[];
  loadingFabrics: boolean;
  onSelectFabric: (fabric: Fabric) => void;
  onAddSwatch: (fabric: Fabric) => void;
  requestedSwatches: string[];
  analysis?: RoomAnalysis;
}

const formatDim = (value: number, fraction: string) => {
  if (!fraction || fraction === '0') return `${value}`;
  return `${value} ${fraction}`;
};

const AllFabricsIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20" />
    <path d="M2 12h20" />
    <rect x="9" y="9" width="6" height="6" rx="1" strokeWidth="1.5" />
  </svg>
);

const MeasurementInputs: React.FC<{
  shapeData: any;
  config: ShadeConfig;
  handleMeasurementChange: (key: string, value: number) => void;
  handleFractionChange: (key: string, fraction: string) => void;
  t: (key: string) => string;
}> = ({ shapeData, config, handleMeasurementChange, handleFractionChange, t }) => (
  <div className="animate-in slide-in-from-bottom-1 duration-300">
    <div className="flex items-center gap-2 mb-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
      <div className="shrink-0"><Info size={12} className="text-amber-600" /></div>
      <p className="text-[9px] font-medium text-amber-800 leading-tight">
        {t('pro.diyWarning')}
      </p>
    </div>
    
    <div className="bg-slate-50 p-2 rounded-lg flex flex-col items-center gap-2 border border-slate-200 mb-3">
        <img src={shapeData.diagram} className="max-h-48 object-contain" alt="Shape Diagram" />
    </div>
    
    <div className="space-y-2">
        {shapeData.inputs.map((input: any) => {
            const currentVal = (input.key === 'width' || input.key === 'height') 
                ? config[input.key as 'width' | 'height'] 
                : (config.customDims?.[input.key] || 0);
            const currentFrac = (input.key === 'width' || input.key === 'height')
                ? config[input.key === 'width' ? 'widthFraction' : 'heightFraction']
                : (config.customFracs?.[input.key] || '0');
            return (
                <div key={input.key} className="bg-white border border-gray-100 rounded-lg p-2 shadow-sm">
                    <label className="text-[8px] font-black uppercase text-slate-400 block mb-1 tracking-widest">{input.label}</label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input type="number" value={currentVal || ''} onChange={e => handleMeasurementChange(input.key, Number(e.target.value))} className="w-full border border-gray-200 p-1 rounded-md focus:ring-1 focus:ring-slate-800 outline-none text-xs font-bold" placeholder="0"/>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-gray-400 pointer-events-none">IN</span>
                        </div>
                        <div className="w-16">
                            <select value={currentFrac} onChange={e => handleFractionChange(input.key, e.target.value)} className="w-full border border-gray-200 p-1 rounded-md focus:ring-1 focus:ring-slate-800 outline-none text-xs bg-gray-50 font-medium">
                                {FRACTIONS.map(f => <option key={f} value={f}>{f === '0' ? t('common.none') : f}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            );
        })}
    </div>
  </div>
);

const Stepper: React.FC<StepperProps> = ({ 
  openStep, 
  setOpenStep, 
  config, 
  setConfig,
  activeFabricName,
  fabrics,
  loadingFabrics,
  onSelectFabric,
  onAddSwatch,
  requestedSwatches,
  analysis
}) => {
  const { t } = useLanguage();
  const [showProPath, setShowProPath] = useState(false);
  const [isDIYSelected, setIsDIYSelected] = useState(false);

  const fabricCounts = useMemo(() => {
    return {
      lightFiltering: fabrics.filter(f => f.category === 'Light Filtering').length,
      blackout: fabrics.filter(f => f.category === 'Blackout').length,
      all: fabrics.length
    };
  }, [fabrics]);

  useEffect(() => {
    if (config.shape !== 'Standard' && config.controlType === 'Metal Chain') {
      setConfig({ ...config, controlType: 'Motorized' });
    }
  }, [config.shape]);

  const handleToggle = (index: number) => {
    setOpenStep(openStep === index ? null : index);
    if (openStep !== index) {
      const stepNames = ['shape', 'visualizer', 'dimensions', 'fabric', 'control', 'motor_options', 'service', 'summary'];
      trackEvent('step_view', { step_number: index + 1, step_name: stepNames[index] });
    }
  };

  const updateConfig = <K extends keyof ShadeConfig>(key: K, value: ShadeConfig[K]) => {
    setConfig({ ...config, [key]: value });
  };

  const updateServices = (measure: boolean, install: boolean, diy: boolean) => {
    setConfig({
      ...config,
      measureService: measure,
      installService: install
    });
    setIsDIYSelected(diy);
    if (diy) setShowProPath(false);
    
    trackEvent('service_select', { 
      service_type: measure && install ? 'full_service' :
                    measure ? 'pro_measure' :
                    install ? 'pro_install' : 'diy',
      has_installer: !!config.installer
    });
  };

  const handleMeasurementChange = (key: string, value: number) => {
    if (key === 'width' || key === 'height') {
      updateConfig(key as 'width' | 'height', value);
    } else {
      const newDims = { ...(config.customDims || {}), [key]: value };
      setConfig({ ...config, customDims: newDims });
    }
    
    trackEvent('dimensions_entered', { 
      width: config.width, 
      height: config.height, 
      shape: config.shape,
      is_specialty: config.shape !== 'Standard'
    });
  };

  const handleFractionChange = (key: string, fraction: string) => {
    if (key === 'width' || key === 'height') {
      updateConfig(key === 'width' ? 'widthFraction' : 'heightFraction', fraction);
    } else {
      const newFracs = { ...(config.customFracs || {}), [key]: fraction };
      setConfig({ ...config, customFracs: newFracs });
    }

    trackEvent('dimensions_entered', { 
      width: config.width, 
      height: config.height, 
      shape: config.shape,
      is_specialty: config.shape !== 'Standard'
    });
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleaned = val.replace(/\D/g, '').substring(0, 5);
    const updatedConfig = { ...config, zipCode: cleaned };
    if (cleaned.length === 5) {
      updatedConfig.installer = getInstallerForZip(cleaned);
      setIsDIYSelected(false);
    } else {
      updatedConfig.installer = null;
    }
    setConfig(updatedConfig);
  };

  const handleSwitchToDIYPath = () => {
    setConfig({
      ...config,
      installer: null,
      measureService: false,
      installService: false,
      zipCode: ''
    });
    setShowProPath(false);
    setIsDIYSelected(true);
  };

  const handleShowProPath = () => {
    setIsDIYSelected(false);
    setShowProPath(true);
  };

  const handleResetToPathSelection = () => {
    setConfig({
      ...config,
      installer: null,
      measureService: false,
      installService: false,
      zipCode: ''
    });
    setShowProPath(false);
    setIsDIYSelected(false);
  };

  const getShapeLabel = (s: string) => {
    const key = `shape.${s.replace(/[^a-zA-Z]/g, '').toLowerCase()}`;
    return t(key) || s;
  };

  const getStepSummary = (index: number) => {
    switch (index) {
      case 0: return getShapeLabel(config.shape);
      case 1: 
        if (config.measureService && config.installService) return t('step.summary.full');
        if (config.measureService) return t('step.summary.measureOnly');
        if (config.installService) return t('step.summary.installOnly');
        const w = (config.widthFraction && config.widthFraction !== '0') ? `${config.width} ${config.widthFraction}` : `${config.width}`;
        const h = (config.heightFraction && config.heightFraction !== '0') ? `${config.height} ${config.heightFraction}` : `${config.height}`;
        return config.width > 0 ? `${w}" x ${h}"` : t('step.summary.diy');
      case 2: return config.shadeType ? t(`shadeType.${config.shadeType === 'Light Filtering' ? 'lightFiltering' : config.shadeType === 'Blackout' ? 'blackout' : 'all'}`) : t('step.summary.allFabrics');
      case 3: return activeFabricName || t('fabric.selectMaterial');
      case 4: return t(config.mountType === 'Inside Mount' ? 'mount.inside' : 'mount.outside');
      case 5: return t(config.controlType === 'Metal Chain' ? 'control.chain' : 'control.motorized');
      case 6: {
          const valanceLabel = t(`valance.${config.valanceType}`) || t('step.summary.noValance');
          const sideChannelLabel = config.sideChannelType === 'standard' ? ' + Channels' : '';
          return valanceLabel + sideChannelLabel;
      }
      case 7: return config.quantity.toString();
      default: return "Select";
    }
  };

  const shapeData = SHAPE_CONFIGS[config.shape as ShapeType] || SHAPE_CONFIGS.Standard;

  return (
    <div className="flex flex-col gap-2 pb-24 relative">
      {STEPS.map((stepLabelKey, index) => {
        const isOpen = openStep === index;
        const summaryText = getStepSummary(index);
        const translatedLabel = t(stepLabelKey);

        return (
          <div key={index} id={`step-container-${index}`} className={`border transition-all duration-300 rounded-xl ${isOpen ? 'border-[#0f172a] shadow-lg ring-1 ring-[#0f172a] bg-white' : 'border-gray-100 bg-white shadow-sm'}`}>
            <button onClick={() => handleToggle(index)} className="w-full flex items-center justify-between p-2 min-h-[52px] hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-[0.1em] ${isOpen ? 'bg-[#0f172a] text-white' : 'bg-gray-100 text-slate-500'}`}>{t('step.prefix')} {index + 1}</span>
                <span className="text-sm font-black text-slate-900 tracking-tight">{translatedLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="text-[10px] font-bold text-indigo-600 truncate max-w-[120px]">{summaryText}</span>
              </div>
            </button>

            {isOpen && (
              <div className="px-2 pb-4 pt-1 border-t border-gray-50 animate-in fade-in slide-in-from-top-1">
                {index === 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                        {Object.keys(SHAPE_CONFIGS).map((shapeKey) => (
                              <button 
                                key={shapeKey} 
                                onClick={() => {
                                  updateConfig('shape', shapeKey as ShapeType);
                                  trackEvent('shape_select', { shape_name: shapeKey });
                                }} 
                                className={`group flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-300 min-h-[100px] ${
                                    config.shape === shapeKey 
                                    ? 'border-[#0f172a] bg-slate-50' 
                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                }`}
                              >
                                  <div className="relative w-12 h-12 mb-1 p-1.5 rounded-lg bg-[#e2e8f0] transition-colors">
                                      <img 
                                        src={SHAPE_CONFIGS[shapeKey as ShapeType].mask} 
                                        className={`w-full h-full object-contain transition-opacity ${config.shape === shapeKey ? 'opacity-100' : 'opacity-80'}`} 
                                      />
                                  </div>
                                  <span className="text-[8px] font-black text-center leading-tight uppercase tracking-wider text-slate-700 group-hover:text-slate-900">
                                    {getShapeLabel(shapeKey)}
                                  </span>
                              </button>
                        ))}
                    </div>
                )}

                {index === 1 && (
                  <div className="space-y-3 pt-2">
                    {config.installer ? (
                      <div className="space-y-3">
                         <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-white/10 relative overflow-hidden print:border-slate-200 print:bg-white print:text-slate-900">
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
                                   {config.installer?.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="font-black text-white text-sm truncate print:text-slate-900">{config.installer?.name}</h4>
                                        <CheckCircle size={10} className="text-green-500" />
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="flex items-center gap-0.5 text-yellow-400 font-black text-[9px]">
                                           <Star size={10} fill="currentColor" /> {config.installer?.rating}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{config.installer?.location}</span>
                                    </div>
                                </div>
                                <button onClick={() => setConfig({...config, installer: null})} className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors print:hidden"><MapPin size={14} /></button>
                            </div>
                         </div>

                         <div className="space-y-2">
                            {/* Option 1: DIY */}
                            <button onClick={() => updateServices(false, false, true)} className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between ${(!config.measureService && !config.installService) ? 'border-slate-800 bg-slate-50' : 'border-gray-100 hover:border-gray-200'}`}>
                               <div>
                                  <div className="text-xs font-black uppercase tracking-wider">DIY - No Pro Service</div>
                                  <div className="text-[10px] text-slate-400">I'll measure and install myself</div>
                               </div>
                               <span className="text-xs font-black text-green-600">FREE</span>
                            </button>

                            {/* Option 2: Measure Only */}
                            <button onClick={() => updateServices(true, false, false)} className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between ${(config.measureService && !config.installService) ? 'border-slate-800 bg-slate-50' : 'border-gray-100 hover:border-gray-200'}`}>
                               <div>
                                  <div className="text-xs font-black uppercase tracking-wider">Pro Measure Only</div>
                                  <div className="text-[10px] text-slate-400">100% Fit Guarantee • I'll install</div>
                               </div>
                               <span className="text-xs font-black text-slate-900">${config.installer?.fees.measure}</span>
                            </button>

                            {/* Option 3: Install Only */}
                            <button onClick={() => updateServices(false, true, false)} className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between ${(!config.measureService && config.installService) ? 'border-slate-800 bg-slate-50' : 'border-gray-100 hover:border-gray-200'}`}>
                               <div>
                                  <div className="text-xs font-black uppercase tracking-wider">Pro Install Only</div>
                                  <div className="text-[10px] text-slate-400">I'll measure • Pro installs</div>
                               </div>
                               <span className="text-xs font-black text-slate-900">${config.installer?.fees.installPerUnit}/unit</span>
                            </button>

                            {/* Option 4: Full Service */}
                            <button onClick={() => updateServices(true, true, false)} className={`w-full text-left p-3 rounded-xl border-2 transition-all relative ${ (config.measureService && config.installService) ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                               <div className="absolute -top-2 left-3 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase">Recommended</div>
                               <div className="flex items-center justify-between">
                                  <div>
                                     <div className="text-xs font-black uppercase tracking-wider">Full Pro Service</div>
                                     <div className="text-[10px] text-slate-400">100% Fit Guarantee • Hands-free</div>
                                  </div>
                                  <div className="text-right">
                                     <div className="text-xs font-black text-slate-900">${config.installer?.fees.measure} + ${config.installer?.fees.installPerUnit}/unit</div>
                                  </div>
                               </div>
                            </button>
                         </div>
                         {!config.measureService && <MeasurementInputs shapeData={shapeData} config={config} handleMeasurementChange={handleMeasurementChange} handleFractionChange={handleFractionChange} t={t} />}
                      </div>
                    ) : showProPath ? (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 relative animate-in zoom-in-95 duration-200">
                         <button onClick={handleResetToPathSelection} className="absolute top-2 right-2 text-indigo-300 hover:text-indigo-600 transition-colors"><X size={16} /></button>
                         <h3 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-3">{t('pro.serviceAreaCheck')}</h3>
                         <div className="relative">
                             <input type="text" maxLength={5} value={config.zipCode} onChange={handleZipChange} autoFocus placeholder={t('pro.zipPlaceholder')} className="w-full border-2 border-indigo-200 p-3 rounded-lg focus:border-indigo-500 outline-none font-bold text-base shadow-sm" />
                             <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400"><Search size={18} /></div>
                         </div>
                      </div>
                    ) : isDIYSelected ? (
                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('step.summary.diy')}</h3>
                            <button onClick={handleShowProPath} className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Pro Service?</button>
                         </div>
                         <MeasurementInputs shapeData={shapeData} config={config} handleMeasurementChange={handleMeasurementChange} handleFractionChange={handleFractionChange} t={t} />
                      </div>
                    ) : (
                      <div className="space-y-2">
                         <button onClick={handleSwitchToDIYPath} className="w-full text-left p-4 border-2 border-gray-100 rounded-xl hover:border-slate-300 transition-all bg-white shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                               <div className="flex items-center gap-2">
                                  <Wrench size={16} className="text-slate-400" />
                                  <span className="text-xs font-black text-slate-900">{t('pro.handleMyself')}</span>
                               </div>
                               <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">{t('common.free')}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight font-medium">{t('pro.diyDesc')}</p>
                         </button>

                         <button onClick={handleShowProPath} className="w-full text-left p-4 border-2 border-indigo-100 rounded-xl hover:border-indigo-300 transition-all bg-white shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                               <UserCheck size={16} className="text-indigo-600" />
                               <span className="text-xs font-black text-slate-900">{t('pro.getHelp')}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight font-medium">Certified local installers. Includes {t('pro.fitGuarantee')}.</p>
                         </button>
                      </div>
                    )}
                  </div>
                )}

                {index === 2 && (
                  <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <button 
                            onClick={() => updateConfig('shadeType', 'Light Filtering')} 
                            className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center justify-center gap-2 text-center group relative ${
                                config.shadeType === 'Light Filtering' 
                                ? 'border-[#0f172a] bg-slate-50 shadow-md ring-1 ring-[#0f172a]' 
                                : 'border-gray-100 hover:border-gray-300 bg-white'
                            }`}
                          >
                              <div className={`p-2 rounded-full transition-colors ${config.shadeType === 'Light Filtering' ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-slate-300 group-hover:text-slate-500'}`}>
                                <Sun size={20} />
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-widest leading-tight ${config.shadeType === 'Light Filtering' ? 'text-[#0f172a]' : 'text-slate-500'}`}>
                                {t('shadeType.lightFiltering')}
                              </span>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                {fabricCounts.lightFiltering} {t('blueprint.material')}s
                              </div>
                          </button>
                          
                          <button 
                            onClick={() => updateConfig('shadeType', 'Blackout')} 
                            className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center justify-center gap-2 text-center group relative ${
                                config.shadeType === 'Blackout' 
                                ? 'border-[#0f172a] bg-slate-50 shadow-md ring-1 ring-[#0f172a]' 
                                : 'border-gray-100 hover:border-gray-300 bg-white'
                            }`}
                          >
                              <div className={`p-2 rounded-full transition-colors ${config.shadeType === 'Blackout' ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-slate-300 group-hover:text-slate-500'}`}>
                                <Layers size={20} />
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-widest leading-tight ${config.shadeType === 'Blackout' ? 'text-[#0f172a]' : 'text-slate-500'}`}>
                                {t('shadeType.blackout')}
                              </span>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                {fabricCounts.blackout} {t('blueprint.material')}s
                              </div>
                          </button>

                          <button 
                            onClick={() => updateConfig('shadeType', 'All')} 
                            className={`p-4 border-2 rounded-xl transition-all flex flex-col items-center justify-center gap-2 text-center group relative ${
                                config.shadeType === 'All' 
                                ? 'border-[#0f172a] bg-slate-50 shadow-md ring-1 ring-[#0f172a]' 
                                : 'border-gray-100 hover:border-gray-300 bg-white'
                            }`}
                          >
                              <div className={`p-2 rounded-full transition-colors ${config.shadeType === 'All' ? 'bg-[#0f172a] text-white' : 'bg-gray-50 text-slate-300 group-hover:text-slate-500'}`}>
                                <AllFabricsIcon className="w-5 h-5" />
                              </div>
                              <span className={`text-[9px] font-black uppercase tracking-widest leading-tight ${config.shadeType === 'All' ? 'text-[#0f172a]' : 'text-slate-500'}`}>
                                {t('shadeType.all')}
                              </span>
                              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                                {fabricCounts.all} {t('blueprint.material')}s
                              </div>
                          </button>
                      </div>
                  </div>
                )}

                {index === 3 && <div className="pt-2"><FabricSuggestions loading={loadingFabrics} fabrics={fabrics} onSelect={onSelectFabric} selectedId={config.material?.id} width={config.width} height={config.height} widthFraction={config.widthFraction} heightFraction={config.heightFraction} onAddSwatch={onAddSwatch} requestedSwatches={requestedSwatches} analysis={analysis} config={config} /></div>}

                {index === 4 && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                      {[t('mount.inside'), t('mount.outside')].map((m, i) => (
                          <button key={m} onClick={() => updateConfig('mountType', i === 0 ? 'Inside Mount' : 'Outside Mount')} className={`p-3 border-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${((i === 0 && config.mountType === 'Inside Mount') || (i === 1 && config.mountType === 'Outside Mount')) ? 'border-slate-900 bg-slate-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>{m}</button>
                      ))}
                  </div>
                )}

                {index === 5 && (
                  <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => { updateConfig('controlType', 'Metal Chain'); trackEvent('control_type_select', { control_type: 'Metal Chain' }); }} disabled={config.shape !== 'Standard'} className={`p-3 border-2 rounded-xl font-black text-xs uppercase tracking-widest flex justify-between items-center transition-all ${config.shape !== 'Standard' ? 'opacity-30 cursor-not-allowed' : (config.controlType === 'Metal Chain' ? 'border-slate-800 bg-slate-50' : 'border-gray-200 hover:border-gray-300 bg-white')}`}>
                              <span>{t('control.chain')}</span>
                          </button>
                          <button onClick={() => { updateConfig('controlType', 'Motorized'); trackEvent('control_type_select', { control_type: 'Motorized' }); }} className={`p-3 border-2 rounded-xl font-black text-xs uppercase tracking-widest flex justify-between items-center transition-all ${config.controlType === 'Motorized' ? 'border-slate-800 bg-slate-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                              <span>{t('control.motorized')}</span>
                              <Zap size={12} className="text-indigo-600" />
                          </button>
                      </div>

                      {config.controlType === 'Motorized' && (
                          <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-1 duration-300">
                              <div className="grid grid-cols-2 gap-2">
                                  <button onClick={() => updateConfig('motorPower', 'Rechargeable')} className={`p-3 border-2 rounded-xl text-left transition-all flex flex-col gap-2 ${config.motorPower === 'Rechargeable' ? 'border-[#0f172a] bg-slate-50 ring-1 ring-[#0f172a]' : 'border-gray-200 hover:border-gray-300 bg-white shadow-sm'}`}>
                                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center p-1 border border-indigo-100 overflow-hidden">
                                        <img src="https://res.cloudinary.com/dcmlcfynd/image/upload/v1765304892/Pulse-2_nepvfj.png" alt="Battery" className="w-full h-full object-contain" />
                                      </div>
                                      <div className="text-[11px] font-black uppercase tracking-widest leading-tight">{t('control.rechargeable')}</div>
                                  </button>
                                  <button onClick={() => updateConfig('motorPower', 'Hardwired')} className={`p-3 border-2 rounded-xl text-left transition-all flex flex-col gap-2 ${config.motorPower === 'Hardwired' ? 'border-[#0f172a] bg-slate-50 ring-1 ring-[#0f172a]' : 'border-gray-200 hover:border-gray-300 bg-white shadow-sm'}`}>
                                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center p-1 border border-indigo-100">
                                        <Zap size={20} className="text-indigo-600" />
                                      </div>
                                      <div className="text-[11px] font-black uppercase tracking-widest leading-tight">{t('control.hardwired')}</div>
                                  </button>
                              </div>
                              
                              <div className="space-y-3">
                                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5 ml-1">Upgrades</div>
                                  
                                  <button onClick={() => updateConfig('motorizedController', !config.motorizedController)} className={`w-full p-3 border-2 rounded-xl flex items-center justify-between transition-all ${config.motorizedController ? 'border-[#0f172a] bg-slate-50 ring-1 ring-[#0f172a]' : 'border-gray-100 hover:border-gray-300 bg-white shadow-sm'}`}>
                                      <div className="flex items-center gap-4">
                                          <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden shrink-0 shadow-sm">
                                            <img src="https://res.cloudinary.com/dcmlcfynd/image/upload/v1765304892/Push-5-1_huhfuk.png" alt="Remote" className="w-20 h-20 object-contain" />
                                          </div>
                                          <div className="text-left flex-1 min-w-0">
                                              <div className="text-xs font-black uppercase tracking-widest text-slate-900 truncate">{t('control.remote')}</div>
                                              <div className="text-[10px] text-slate-500 font-medium leading-tight mt-1 line-clamp-3 whitespace-pre-line">{t('control.remoteDesc')}</div>
                                          </div>
                                      </div>
                                      <div className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">+$50</div>
                                  </button>
                                  
                                  <button onClick={() => updateConfig('motorizedHub', !config.motorizedHub)} className={`w-full p-3 border-2 rounded-xl flex items-center justify-between transition-all ${config.motorizedHub ? 'border-[#0f172a] bg-slate-50 ring-1 ring-[#0f172a]' : 'border-gray-100 hover:border-gray-300 bg-white shadow-sm'}`}>
                                      <div className="flex items-center gap-4">
                                          <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden shrink-0 shadow-sm">
                                            <img src="https://res.cloudinary.com/dcmlcfynd/image/upload/v1765304892/Pulse-2_nepvfj.png" alt="Hub" className="w-20 h-20 object-contain" />
                                          </div>
                                          <div className="text-left flex-1 min-w-0">
                                              <div className="text-xs font-black uppercase tracking-widest text-slate-900 truncate">{t('control.hub')}</div>
                                              <div className="text-[10px] text-slate-500 font-medium leading-tight mt-1 line-clamp-3 whitespace-pre-line">{t('control.hubDesc')}</div>
                                          </div>
                                      </div>
                                      <div className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">+$50</div>
                                  </button>

                                  <div className="w-full p-3 border border-dashed border-indigo-200 rounded-xl flex items-center gap-4 bg-indigo-50/20">
                                      <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border border-indigo-100 overflow-hidden shrink-0 shadow-sm">
                                        <img src="https://res.cloudinary.com/dcmlcfynd/image/upload/v1765304892/motorised-blinds-automate-pulse-2-app-smarter-controls-for-climate-and-light-management-us_eg7ffg.png" alt="App" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="text-left flex-1 min-w-0">
                                          <div className="text-xs font-black uppercase tracking-widest text-indigo-700 truncate">Automate Pulse 2 App</div>
                                          <div className="text-[10px] text-slate-500 font-medium leading-tight mt-1 line-clamp-2 whitespace-pre-line">{t('control.appDesc')}</div>
                                          <div className="text-[10px] font-black text-indigo-500 uppercase mt-1.5 tracking-widest">Included with hub</div>
                                      </div>
                                  </div>

                                  <button onClick={() => updateConfig('sunSensor', !config.sunSensor)} className={`w-full p-3 border-2 rounded-xl flex items-center justify-between transition-all ${config.sunSensor ? 'border-[#0f172a] bg-slate-50 ring-1 ring-[#0f172a]' : 'border-gray-100 hover:border-gray-300 bg-white shadow-sm'}`}>
                                      <div className="flex items-center gap-4">
                                          <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden shrink-0 shadow-sm">
                                            <img src="https://res.cloudinary.com/dcmlcfynd/image/upload/v1767828127/SunSensor_yk4he7.avif" alt="Sun Sensor" className="w-20 h-20 object-contain" />
                                          </div>
                                          <div className="text-left flex-1 min-w-0">
                                              <div className="text-xs font-black uppercase tracking-widest text-slate-900 truncate">{t('control.sunSensor')}</div>
                                              <div className="text-[10px] text-slate-500 font-medium leading-tight mt-1 line-clamp-3 whitespace-pre-line">{t('control.sunSensorDesc')}</div>
                                          </div>
                                      </div>
                                      <div className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">+$150</div>
                                  </button>

                                  <button onClick={() => updateConfig('motorizedCharger', !config.motorizedCharger)} className={`w-full p-3 border-2 rounded-xl flex items-center justify-between transition-all ${config.motorizedCharger ? 'border-[#0f172a] bg-slate-50 ring-1 ring-[#0f172a]' : 'border-gray-100 hover:border-gray-300 bg-white shadow-sm'}`}>
                                      <div className="flex items-center gap-4">
                                          <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden shrink-0 shadow-sm">
                                            <img src="https://res.cloudinary.com/dcmlcfynd/image/upload/v1767978103/rowley-automate-slim-drapery-motor-cable-mt03-0301-069007_o8lbi5.webp" alt="Motor Charger" className="w-20 h-20 object-contain" />
                                          </div>
                                          <div className="text-left flex-1 min-w-0">
                                              <div className="text-xs font-black uppercase tracking-widest text-slate-900 truncate">{t('control.charger')}</div>
                                              <div className="text-[10px] text-slate-500 font-medium leading-tight mt-1 line-clamp-3 whitespace-pre-line">{t('control.chargerDesc')}</div>
                                          </div>
                                      </div>
                                      <div className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">+$70</div>
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
                )}

                {index === 6 && (
                  <div className="space-y-6 pt-2">
                      <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-[0.15em] text-[9px] px-1">
                              <Layout size={12} /> <span>Finish Options</span>
                          </div>
                          
                          <div className="w-full rounded-xl overflow-hidden border border-gray-200 mb-2 shadow-sm bg-white">
                             <img 
                                src="https://res.cloudinary.com/dcmlcfynd/image/upload/v1767829241/Cassettand_valances_eybsoy.jpg" 
                                alt="Finish Options" 
                                className="w-full h-auto object-cover"
                             />
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {VALANCE_OPTIONS.map(opt => {
                                const isSelected = config.valanceType === opt.id;
                                return (
                                    <button 
                                        key={opt.id} 
                                        onClick={() => updateConfig('valanceType', opt.id as any)} 
                                        className={`w-full p-4 border transition-all ${
                                            isSelected 
                                            ? 'border-[#0f172a] bg-white ring-2 ring-[#0f172a] shadow-md rounded-xl' 
                                            : 'border-gray-200 hover:border-gray-300 bg-white rounded-xl shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="text-left">
                                                <div className="text-sm font-black text-slate-900 leading-tight mb-0.5">{t(`valance.${opt.id}`)}</div>
                                                <div className="text-[10px] text-slate-500 font-medium leading-tight">{opt.desc}</div>
                                            </div>
                                            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                                {opt.pricePerInch === 0 ? 'INCLUDED' : `+$${opt.pricePerInch.toFixed(2)}/in`}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                          </div>
                          
                          {/* Side Channels Section */}
                          <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-[0.15em] text-[9px] px-1 mt-6">
                              <PanelLeftClose size={12} /> <span>Light Blocking Channels</span>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2 mt-3">
                            {SIDE_CHANNEL_OPTIONS.map(opt => {
                                const isSelected = config.sideChannelType === opt.id;
                                return (
                                    <button 
                                        key={opt.id} 
                                        onClick={() => updateConfig('sideChannelType', opt.id as any)} 
                                        className={`w-full p-4 border transition-all ${
                                            isSelected 
                                            ? 'border-[#0f172a] bg-white ring-2 ring-[#0f172a] shadow-md rounded-xl' 
                                            : 'border-gray-200 hover:border-gray-300 bg-white rounded-xl shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="text-left">
                                                <div className="text-sm font-black text-slate-900 leading-tight mb-0.5">{opt.label}</div>
                                                <div className="text-[10px] text-slate-500 font-medium leading-tight">
                                                    {opt.id === 'none' ? 'Standard installation' : 'Blocks light gaps on sides'}
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                                {opt.pricePerFoot === 0 ? 'INCLUDED' : `+$${opt.pricePerFoot.toFixed(2)}/ft`}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                          </div>
                      </div>
                  </div>
                )}
                
                {index === 7 && (
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">{t('step.8')}</label>
                    <div className="flex-1 flex items-center justify-end gap-3">
                        <button onClick={() => updateConfig('quantity', Math.max(1, config.quantity - 1))} className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-white transition-colors"><X size={12} className="rotate-45" /></button>
                        <span className="text-xl font-black text-slate-900 w-6 text-center">{config.quantity}</span>
                        <button onClick={() => updateConfig('quantity', config.quantity + 1)} className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center bg-slate-900 text-white hover:bg-slate-800 transition-colors"><div className="font-bold text-lg">+</div></button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;