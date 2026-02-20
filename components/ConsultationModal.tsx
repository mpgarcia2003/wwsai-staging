import React, { useState } from 'react';
import { X, Phone, CircleCheck, Clock } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { saveConsultationRequest } from '../utils/storage';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('Morning');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const saved = await saveConsultationRequest({
      phone: phone.trim(),
      preferred_time: time
    });

    trackEvent('Consultation_confirmation', {
      category: 'Lead Generation',
      label: 'Free Consultation',
      preferred_time: time,
      phone_provided: phone.length > 0,
      saved_to_supabase: saved
    });

    setIsSubmitting(false);
    setStep('success');
    setTimeout(() => {
      onClose();
      setTimeout(() => setStep('form'), 500);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div 
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
        style={{ animation: 'modalSpring 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[#ccc] hover:text-[#999] hover:bg-gray-50 rounded-full transition-colors z-10">
          <X size={18} />
        </button>

        {step === 'form' ? (
          <div className="p-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: '#f5f3ec' }}>
              <Phone size={24} style={{ color: '#c8a165' }} />
            </div>
            
            <h2 className="text-[22px] font-normal text-[#1a1a1a] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Need a Design Expert?</h2>
            <p className="text-[#888] mb-8 leading-relaxed text-[13px]">
              Your room looks great! Would you like a <strong className="text-[#555]">free 5-minute call</strong> from a pro to help you match fabrics perfectly?
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-medium text-[#aaa] uppercase tracking-[0.12em] mb-1.5 ml-1">Phone Number</label>
                <input 
                  type="tel" required autoFocus
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3.5 rounded-xl outline-none transition-all duration-200 text-[14px] font-normal text-[#333] placeholder:text-[#ccc]"
                  style={{ border: '1px solid #e0dcd5' }}
                  onFocus={(e) => { e.target.style.borderColor = '#c8a165'; e.target.style.boxShadow = '0 0 0 3px rgba(200,161,101,0.08)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e0dcd5'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-[#aaa] uppercase tracking-[0.12em] mb-2 ml-1">Best Time to Call</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Morning', 'Afternoon', 'Evening'].map((t) => (
                    <label 
                      key={t}
                      className="cursor-pointer text-center py-2.5 px-1 rounded-xl text-[12px] font-medium transition-all duration-200"
                      style={time === t 
                        ? { backgroundColor: '#1a1a1a', color: 'white', border: '1px solid #1a1a1a', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
                        : { backgroundColor: 'white', color: '#888', border: '1px solid #e0dcd5' }
                      }
                    >
                      <input type="radio" name="time" value={t} checked={time === t} onChange={(e) => setTime(e.target.value)} className="hidden" />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-medium text-[14px] tracking-wide transition-all duration-300 hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ 
                    background: 'linear-gradient(90deg, #C8A165 0%, #E7D8B8 55%, #C8A165 100%)',
                    boxShadow: '0 6px 24px rgba(200,161,101,0.2)',
                    color: '#1a1a1a',
                    fontFamily: "'Playfair Display', Georgia, serif"
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Request Free Call'}
                </button>
                
                <button type="button" onClick={onClose} className="w-full text-[#bbb] text-[11px] font-normal hover:text-[#888] py-2 transition-colors">
                  No thanks, I'll design it myself
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[440px]" style={{ backgroundColor: '#FDFBF7' }}>
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #c8a165, #d4b07a)', boxShadow: '0 8px 30px rgba(200,161,101,0.25)', animation: 'modalSpring 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            >
              <CircleCheck size={40} className="text-white" />
            </div>
            <h3 className="text-[22px] font-normal text-[#1a1a1a] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Request Received!</h3>
            <p className="text-[#888] max-w-[260px] mx-auto text-[13px]">
              A design specialist will call you in the <strong style={{ color: '#c8a165' }}>{time.toLowerCase()}</strong>.
            </p>
            <div className="mt-8 flex items-center gap-2 text-[10px] text-[#aaa] font-medium bg-white px-3 py-1.5 rounded-full" style={{ border: '1px solid rgba(20,20,20,0.06)' }}>
              <Clock size={12} />
              Returning to builder...
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalSpring {
          0% { opacity: 0; transform: translateY(20px) scale(0.95); }
          70% { transform: translateY(-4px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ConsultationModal;
