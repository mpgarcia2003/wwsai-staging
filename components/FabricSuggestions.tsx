import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Loader2, ZoomIn, X, ImageOff, Check, ArrowRight, Plus } from 'lucide-react';
import { Fabric, ShadeConfig, RoomAnalysis } from '../types';
import { getFabricUrl } from '../constants';
import { useLanguage } from '../LanguageContext';
import { trackEvent } from '../utils/analytics';

interface FabricSuggestionsProps {
  loading: boolean;
  fabrics: Fabric[];
  onSelect: (fabric: Fabric) => void;
  selectedId?: string;
  title?: string;
  width: number;
  height: number;
  widthFraction: string;
  heightFraction: string;
  onAddSwatch: (fabric: Fabric) => void;
  requestedSwatches: string[];
  config?: ShadeConfig; 
  analysis?: RoomAnalysis;
}

const FabricSuggestions: React.FC<FabricSuggestionsProps> = ({ 
  loading, 
  fabrics, 
  onSelect,
  selectedId,
  onAddSwatch,
  requestedSwatches,
  analysis,
  config
}) => {
  const { t } = useLanguage();
  const [inspectedFabric, setInspectedFabric] = useState<Fabric | null>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  
  const handleConfirmSelect = (fabric: Fabric) => {
    trackEvent('fabric_select', { fabric_id: fabric.id, fabric_name: fabric.name, fabric_category: fabric.category });
    onSelect(fabric);
    setInspectedFabric(null);
  };

  const handleInspect = (fabric: Fabric) => {
    trackEvent('fabric_inspect', { fabric_id: fabric.id, fabric_name: fabric.name });
    setInspectedFabric(fabric);
  };

  const handleAddSwatch = (fabric: Fabric) => {
    trackEvent('add_to_swatches', { fabric_id: fabric.id, fabric_name: fabric.name });
    onAddSwatch(fabric);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center animate-pulse p-4">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-3" />
        <h3 className="text-indigo-900 font-bold text-xs uppercase tracking-widest">Analyzing Room...</h3>
      </div>
    );
  }

  // Filter fabrics based on config.shadeType
  const filteredFabrics = config?.shadeType && config.shadeType !== 'All' 
    ? fabrics.filter(f => f.category === config.shadeType)
    : fabrics;

  if (filteredFabrics.length === 0) {
     return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4">
           <p className="text-[10px] font-bold uppercase tracking-wider">No matching fabrics</p>
        </div>
     )
  }

  return (
    <>
      {analysis && (
          <div className="mb-3 bg-indigo-50 border border-indigo-100 p-2 rounded-lg animate-in fade-in slide-in-from-top-1">
              <div className="flex items-start gap-2">
                  <Sparkles size={14} className="text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                      <h4 className="text-[9px] font-black text-indigo-900 uppercase tracking-wide">
                          AI Recommendations
                      </h4>
                      <p className="text-[9px] text-indigo-700 leading-tight">
                          Optimized for your <strong>{analysis.style}</strong> style.
                      </p>
                  </div>
              </div>
          </div>
      )}

      <div className="w-full">
        <div className="grid grid-cols-4 gap-2">
          {filteredFabrics.map((fabric) => {
            const hasError = imgErrors[fabric.id];
            const isSelected = selectedId === fabric.id;
            const isRequested = requestedSwatches.includes(fabric.id);

            return (
              <div 
                key={fabric.id} 
                className="flex flex-col group animate-in fade-in duration-300"
              >
                 <div className="relative">
                    <button
                      onClick={() => handleConfirmSelect(fabric)}
                      className={`w-full aspect-square rounded overflow-hidden bg-gray-50 border relative transition-all ${
                        isSelected ? 'ring-2 ring-slate-900 border-transparent shadow-md' : 'border-gray-200'
                      }`}
                    >
                        {!hasError ? (
                            <img 
                                src={getFabricUrl(fabric.cloudinaryId, 'thumb')} 
                                alt={fabric.name}
                                onError={() => setImgErrors(prev => ({...prev, [fabric.id]: true}))}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                <ImageOff size={14} />
                            </div>
                        )}
                        
                        <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleInspect(fabric); }}
                                className="bg-white/90 p-1 rounded-full shadow hover:bg-slate-900 hover:text-white transition-colors"
                            >
                                <ZoomIn size={10} />
                            </button>
                        </div>

                        {isSelected && (
                            <div className="absolute bottom-0.5 right-0.5 bg-slate-900 text-white p-0.5 rounded-full">
                                <Check size={8} />
                            </div>
                        )}
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); handleAddSwatch(fabric); }}
                        disabled={isRequested}
                        className={`absolute top-0.5 left-0.5 p-1 rounded-full shadow-sm transition-all ${
                            isRequested 
                            ? 'bg-green-500 text-white opacity-100' 
                            : 'bg-white/90 text-slate-600 opacity-0 group-hover:opacity-100'
                        }`}
                    >
                        {isRequested ? <Check size={8} /> : <Plus size={8} />}
                    </button>
                 </div>
                
                <div className="mt-1 h-5 overflow-hidden">
                    <div className="text-[8px] font-black text-slate-800 line-clamp-1 leading-none uppercase tracking-tighter text-center">
                        {fabric.name}
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {inspectedFabric && createPortal(
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setInspectedFabric(null)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-none">{inspectedFabric.name}</h2>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-widest">
                   <span className="text-indigo-600">{inspectedFabric.category}</span>
                   <span className="w-1 h-1 rounded-full bg-gray-300" />
                   <span>Price Group {inspectedFabric.priceGroup}</span>
                </div>
              </div>
              <button onClick={() => setInspectedFabric(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="aspect-square rounded-xl shadow-inner border border-gray-200 overflow-hidden bg-white">
                  <img src={getFabricUrl(inspectedFabric.cloudinaryId, 'texture')} className="w-full h-full object-cover"/>
                </div>
                <div className="aspect-square rounded-xl shadow-inner border border-gray-200 overflow-hidden bg-white">
                  <img src={getFabricUrl(inspectedFabric.cloudinaryId, 'thumb')} className="w-full h-full object-cover"/>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-end gap-3">
               <button 
                  onClick={() => handleAddSwatch(inspectedFabric)}
                  disabled={requestedSwatches.includes(inspectedFabric.id)}
                  className={`px-5 py-2.5 font-black uppercase tracking-widest rounded-xl text-[10px] transition-all flex items-center justify-center gap-2 ${
                    requestedSwatches.includes(inspectedFabric.id)
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'bg-white border border-slate-200 text-slate-600'
                  }`}
               >
                  {requestedSwatches.includes(inspectedFabric.id) ? 'Requested' : 'Order Swatch'}
               </button>
               <button 
                  onClick={() => handleConfirmSelect(inspectedFabric)}
                  className="px-6 py-2.5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl text-[10px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
               >
                  Select Material <ArrowRight size={14} />
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default FabricSuggestions;