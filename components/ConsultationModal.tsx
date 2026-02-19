
import React, { useState } from 'react';
import { X, Phone, CircleCheck, Clock } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('Morning');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track GA4 Event
    trackEvent('Consultation_confirmation', {
      category: 'Lead Generation',
      label: 'Free Consultation',
      preferred_time: time,
      phone_provided: phone.length > 0
    });

    // Simulate API call
    setStep('success');
    setTimeout(() => {
      onClose();
      // Reset after close animation finishes
      setTimeout(() => setStep('form'), 500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-600 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        {step === 'form' ? (
          <div className="p-8">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-5 ring-4 ring-indigo-50/50">
              <Phone size={28} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Need a Design Expert?</h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-sm">
              Your room looks great! Would you like a <strong>free 5-minute call</strong> from a pro to help you match fabrics perfectly?
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  autoFocus
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Best Time to Call</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Morning', 'Afternoon', 'Evening'].map((t) => (
                    <label 
                      key={t}
                      className={`cursor-pointer text-center py-2.5 px-1 rounded-xl border text-xs font-bold transition-all ${
                        time === t 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md transform scale-105' 
                          : 'bg-white text-slate-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="time" 
                        value={t} 
                        checked={time === t} 
                        onChange={(e) => setTime(e.target.value)}
                        className="hidden"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                >
                  Request Free Call
                </button>
                
                <button 
                  type="button" 
                  onClick={onClose}
                  className="w-full text-slate-400 text-xs font-bold hover:text-slate-600 py-2 transition-colors"
                >
                  No thanks, I'll design it myself
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[440px] bg-slate-50/50">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in bounce-in duration-500 shadow-xl shadow-green-100">
              <CircleCheck size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Received!</h3>
            <p className="text-slate-600 max-w-[260px] mx-auto">
              A design specialist will call you in the <strong className="text-indigo-600">{time.toLowerCase()}</strong>.
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 font-medium bg-white px-3 py-1.5 rounded-full border border-gray-200">
              <Clock size={12} />
              Returning to builder...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationModal;
