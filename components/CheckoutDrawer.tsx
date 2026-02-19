import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, ShoppingBag, CreditCard, ArrowRight, ShieldCheck, Ruler, Loader2, User, Mail, ChevronLeft, CheckCircle, Truck, Building2, HelpCircle, Calendar, Settings, ChevronDown, ChevronUp, Clock, Sun, Moon, Zap, Wifi, Smartphone, Check, Lock, Share2, Send, FileText, Briefcase, Layout, Sidebar, ExternalLink } from 'lucide-react';
import { CartItem, Fabric, Order, ShapeType, OrderStatus } from '../types';
import { getFabricUrl, SHAPE_CONFIGS, VALANCE_OPTIONS, SIDE_CHANNEL_OPTIONS } from '../constants';
import { saveOrder, saveSharedCart } from '../utils/storage';
import { sendOrderConfirmation, sendAdminNotification, shareCartByEmail, sendQuoteRequest } from '../utils/email';
import { useLanguage } from '../LanguageContext';
import { createShopifyCheckout, redirectToShopifyCheckout } from '../utils/shopify';
import { trackEvent } from '../utils/analytics';

// Declare Stripe types globally since we are loading via script tag
declare global {
  interface Window {
    Stripe?: any;
  }
}

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  swatches: Fabric[];
  onRemoveItem: (id: string) => void;
  onRemoveSwatch: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<CartItem>) => void;
  onClearCart: () => void;
  onClearSwatches: () => void;
  onNavigate: (page: string) => void;
  onCheckout?: () => void;
}

const formatDim = (val: number, frac: string) => {
  return (frac && frac !== '0') ? `${val} ${frac}` : `${val}`;
};

// Using a Dummy/Test Key for now to prevent real charges during testing
const STRIPE_PK = 'pk_test_51SYqIGFRaiFwpthJYbVNO02GXjz5JO8M5BC9TbA69TYIXOMKNQDzVZFnW1FsRivjflAhGNBb219wHcvtNIPq8Q0N00HQlcew4k';

const CheckoutDrawer: React.FC<CheckoutDrawerProps> = ({
  isOpen, onClose, cart, swatches, onRemoveItem, onRemoveSwatch, onUpdateItem, onClearCart, onClearSwatches, onNavigate, onCheckout
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'cart' | 'details' | 'survey' | 'success' | 'quote_form'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [isSendingShare, setIsSendingShare] = useState(false);
  const [customer, setCustomer] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '' });
  const [quoteForm, setQuoteForm] = useState({ companyName: '', projectType: 'Commercial', details: '' });
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'affirm'>('stripe');
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const cardElementRef = useRef<any>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [survey, setSurvey] = useState({ deliveryNotes: '', referralSource: '', isCommercial: false });
  const [scheduleMode, setScheduleMode] = useState<'asap' | 'scheduled'>('asap');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [specs, setSpecs] = useState<Record<string, { rollType: string, controlPosition: string, bottomBar: string }>>({});
  const [openSpecId, setOpenSpecId] = useState<string | null>(null);

  const cartSubtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const itemsCount = cart.length;
  const isBulkOrder = cartSubtotal > 5000 || itemsCount > 10;
  const bulkDiscount = isBulkOrder ? cartSubtotal * 0.10 : 0;
  const cartTotal = cartSubtotal - bulkDiscount;

  const hasProService = cart.some(i => i.config.installer);
  const hasPhysicalProducts = cart.some(i => !i.config.isMeasurementOnly);
  const affirmMonthly = cartTotal > 0 ? (cartTotal / 12).toFixed(2) : "0.00";

  // GA4 Event: view_cart
  useEffect(() => {
    if (isOpen && cart.length > 0) {
      trackEvent('view_cart', { 
        currency: 'USD',
        value: cartTotal,
        items: cart.map(item => ({
          item_id: item.config.material?.id || 'custom-shade',
          item_name: item.config.material?.name || 'Custom Shade',
          price: item.unitPrice,
          quantity: item.config.quantity,
          fabric: item.config.material?.name || 'Unknown',
          shape: item.config.shape,
          shade_type: item.config.shadeType,
          control_type: item.config.controlType,
          mount_type: item.config.mountType
        }))
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'details' && paymentMethod === 'stripe' && isOpen) {
        if (window.Stripe && !stripeRef.current) {
            try {
                const stripe = window.Stripe(STRIPE_PK);
                stripeRef.current = stripe;
                const elements = stripe.elements();
                elementsRef.current = elements;
                const style = {
                    base: { color: '#0f172a', fontFamily: 'system-ui, sans-serif', fontSmoothing: 'antialiased', fontSize: '14px', fontWeight: '500', '::placeholder': { color: '#94a3b8' } },
                    invalid: { color: '#ef4444', iconColor: '#ef4444' }
                };
                const card = elements.create('card', { style, hidePostalCode: true });
                setTimeout(() => {
                    if (document.getElementById('card-element')) {
                        card.mount('#card-element');
                        cardElementRef.current = card;
                        card.on('change', (event: any) => { setStripeError(event.error ? event.error.message : null); });
                    }
                }, 100);
            } catch (err) { console.error("Stripe Init Error", err); }
        }
    }
  }, [step, paymentMethod, isOpen]);

  const handleProceedToCheckout = async () => {
      setIsProcessing(true);
      
      // Notify parent about tracking
      if (onCheckout) {
          onCheckout();
      }

      // GA4 Event: begin_checkout
      trackEvent('begin_checkout', { 
        value: cartTotal, 
        currency: 'USD', 
        items: cart.map(item => ({
          item_id: item.config.material?.id || 'custom-shade',
          item_name: item.config.material?.name || 'Custom Shade',
          price: item.unitPrice,
          quantity: item.config.quantity,
          fabric: item.config.material?.name || 'Unknown',
          shape: item.config.shape,
          shade_type: item.config.shadeType,
          control_type: item.config.controlType,
          mount_type: item.config.mountType
        }))
      });

      try {
        const checkoutUrl = await createShopifyCheckout(cart, swatches);
        if (checkoutUrl) {
          redirectToShopifyCheckout(checkoutUrl);
        } else {
          setStep('details');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        setStep('details');
      } finally {
        setIsProcessing(false);
      }
  };

  const getShapeLabel = (s: string) => {
    const key = `shape.${s.replace(/[^a-zA-Z]/g, '').toLowerCase()}`;
    return t(key) || s;
  };

  const handleShareCart = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!shareEmail) return;
      setIsSendingShare(true);
      
      try {
          const shareId = await saveSharedCart(cart, swatches);
          if (!shareId) {
              alert("Failed to generate shareable link.");
              setIsSendingShare(false);
              return;
          }

          const productionUrl = 'https://worldwide-shades.com';
          const baseUrl = window.location.hostname === 'localhost' ? window.location.origin : productionUrl;
          const shareUrl = `${baseUrl}/?cart=${shareId}`;
          
          const success = await shareCartByEmail(cart, swatches, shareEmail, shareUrl);
          setIsSendingShare(false);
          
          if(success) { 
              alert(`Cart sent to ${shareEmail}`); 
              setIsSharing(false); 
              setShareEmail(''); 
          } else { 
              alert("Failed to send email. Please try again."); 
          }
      } catch (error) {
          console.error("Critical error in handleShareCart:", error);
          alert("An unexpected error occurred. Please try again later.");
          setIsSendingShare(false);
      }
  };

  const handlePaymentStep = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!customer.firstName || !customer.email || !customer.address || !customer.state) { alert("Please fill in all shipping details."); return; }
      setIsProcessing(true);
      const initialSpecs: Record<string, any> = {};
      cart.forEach(item => { if (!item.config.isMeasurementOnly) { initialSpecs[item.id] = { rollType: 'Standard', controlPosition: 'Right', bottomBar: 'Fabric Wrapped' }; } });
      setSpecs(initialSpecs);
      if (Object.keys(initialSpecs).length > 0) { setOpenSpecId(Object.keys(initialSpecs)[0]); }
      setTimeout(() => { setIsProcessing(false); setStep('survey'); }, 1500);
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!customer.email || !customer.firstName || !quoteForm.companyName) { alert("Please fill in required fields."); return; }
      setIsProcessing(true);
      const quoteOrder: Order = {
          id: `Q-${Math.floor(10000 + Math.random() * 90000)}`,
          customer: { ...customer, address: `${quoteForm.companyName} (${quoteForm.projectType})` },
          items: cart, swatches: swatches, customizations: {}, total: cartTotal, 
          status: 'Received', 
          date: new Date().toISOString(), paymentMethod: 'Quote Request', deliveryNotes: quoteForm.details
      };
      const success = await sendQuoteRequest(quoteOrder);
      setIsProcessing(false);
      if(success) { 
          trackEvent('generate_lead', { type: 'bulk_quote', value: cartTotal });
          setStep('success'); 
          setTimeout(() => { onClearCart(); }, 500); 
      } else { alert("Failed to submit quote. Please contact support."); }
  };

  const toggleDay = (day: string) => {
      if (selectedDays.includes(day)) setSelectedDays(selectedDays.filter(d => d !== day));
      else setSelectedDays([...selectedDays, day]);
      setScheduleMode('scheduled');
  };

  const toggleTime = (time: string) => {
      if (selectedTimes.includes(time)) setSelectedTimes(selectedTimes.filter(t => t !== time));
      else setSelectedTimes([...selectedTimes, time]);
      setScheduleMode('scheduled');
  };

  const handleFinalizeOrder = async () => {
    setIsProcessing(true);
    const orderId = `WWS-${Math.floor(100000 + Math.random() * 900000)}`;
    let finalSlots: string[] = [];
    if (hasProService) {
        if (scheduleMode === 'asap') { finalSlots = ["Priority: As Soon As Possible"]; } else {
            if (selectedDays.length > 0) finalSlots.push(`Pref Days: ${selectedDays.join(', ')}`);
            if (selectedTimes.length > 0) finalSlots.push(`Pref Times: ${selectedTimes.join(', ')}`);
            if (finalSlots.length === 0) finalSlots.push("Flexible / No Preference");
        }
    }
    const newOrder: Order = {
        id: orderId, customer: { firstName: customer.firstName, lastName: customer.lastName, email: customer.email, phone: customer.phone, address: customer.address || "123 Design Avenue", city: customer.city || "New York", state: customer.state || "NY", zip: customer.zip || "10001" },
        items: cart, swatches: swatches, customizations: { ...specs }, total: cartTotal, 
        status: 'Received', 
        date: new Date().toISOString(), paymentMethod: paymentMethod === 'stripe' ? 'Credit Card (Stripe)' : 'Affirm Financing', deliveryNotes: survey.deliveryNotes, referralSource: survey.referralSource, isCommercial: survey.isCommercial, appointmentSlots: hasProService ? finalSlots : undefined
    };
    try {
        await saveOrder(newOrder);
        await Promise.all([sendOrderConfirmation(newOrder), sendAdminNotification(newOrder)]);
        // GA4 Event: purchase
        trackEvent('purchase', { 
          transaction_id: orderId, 
          value: cartTotal, 
          currency: 'USD',
          items: cart.map(item => ({
            item_id: item.config.material?.id || 'custom-shade',
            item_name: item.config.material?.name || 'Custom Shade',
            price: item.unitPrice,
            quantity: item.config.quantity,
            fabric: item.config.material?.name || 'Unknown',
            shape: item.config.shape,
            shade_type: item.config.shadeType,
            control_type: item.config.controlType,
            mount_type: item.config.mountType,
            width: `${item.config.width} ${item.config.widthFraction}`,
            height: `${item.config.height} ${item.config.heightFraction}`
          }))
        });
        setStep('success');
        setTimeout(() => { onClearCart(); onClearSwatches(); }, 500);
    } catch (error) { console.error("Checkout Error:", error); alert("There was an issue placing your order. Please try again."); } finally { setIsProcessing(false); }
  };

  const resetAndClose = () => {
      setStep('cart');
      setCustomer({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '' });
      setPaymentMethod('stripe');
      setStripeError(null);
      setSurvey({ deliveryNotes: '', referralSource: '', isCommercial: false });
      setQuoteForm({ companyName: '', projectType: 'Commercial', details: '' });
      setScheduleMode('asap');
      setSelectedDays([]);
      setSelectedTimes([]);
      setSpecs({});
      setIsSharing(false);
      onClose();
  };
  
  return (
    <div className={`fixed inset-0 z-[70] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={resetAndClose} />
      <div className={`fixed inset-y-0 right-0 h-[100dvh] w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 z-20">
          <div className="flex items-center gap-3">
             {step !== 'cart' && step !== 'success' && (
                 <button onClick={() => setStep(step === 'survey' ? 'details' : 'cart')} className="mr-1 text-slate-500 hover:text-slate-800"><ChevronLeft size={20} /></button>
             )}
             {step === 'quote_form' ? <Briefcase size={20} className="text-amber-600" /> : <ShoppingBag size={20} className="text-slate-800" />}
             <h2 className="text-lg font-bold text-slate-900">{step === 'cart' ? `${t('checkout.cart')} (${itemsCount})` : step === 'success' ? (isBulkOrder ? 'Quote Requested' : t('checkout.orderPlaced') + '!') : step === 'quote_form' ? 'Request Quote' : t('checkout.checkout')}</h2>
          </div>
          <button onClick={resetAndClose} className="p-2 text-gray-400 hover:text-slate-600 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
        </div>

        {step === 'cart' && (
            <>
                <div className="flex-1 overflow-y-auto p-5 space-y-8 bg-gray-50 pb-24 relative shadow-inner">
                {isBulkOrder && (
                    <div className="bg-green-50 border border-green-200 text-green-900 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="bg-green-100 p-2 rounded-full shrink-0"><CheckCircle size={16}/></div>
                        <div>
                            <h4 className="font-bold text-sm">10% Bulk Discount Applied!</h4>
                            <p className="text-xs mt-1 leading-relaxed opacity-90">You're saving ${bulkDiscount.toFixed(2)} on this order.</p>
                        </div>
                    </div>
                )}
                {isSharing && (
                    <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg mb-6 animate-in slide-in-from-top-2 border border-slate-700">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold flex items-center gap-2"><Share2 size={16}/> Share Cart</h3>
                            <button onClick={() => setIsSharing(false)}><X size={16} className="text-slate-400 hover:text-white"/></button>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">Send this cart to a partner or save it for later.</p>
                        <form onSubmit={handleShareCart} className="flex gap-2">
                            <input type="email" placeholder="partner@example.com" required value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                            <button type="submit" disabled={isSendingShare} className="bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded text-sm font-bold flex items-center gap-1 disabled:opacity-50">{isSendingShare ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}</button>
                        </form>
                    </div>
                )}
                {cart.length > 0 ? (
                    <div className="space-y-4">
                    {cart.map((item) => {
                        let dimDisplay = '';
                        if (item.config.shape === 'Standard') {
                            dimDisplay = `${formatDim(item.config.width, item.config.widthFraction)}" x ${formatDim(item.config.height, item.config.heightFraction)}"`;
                        } else if (SHAPE_CONFIGS[item.config.shape as ShapeType]) {
                            dimDisplay = SHAPE_CONFIGS[item.config.shape as ShapeType].inputs.map(input => {
                                let val = 0;
                                let frac = '0';
                                if (input.key === 'width') {
                                    val = item.config.width || 0;
                                    frac = item.config.widthFraction || '0';
                                } else if (input.key === 'height') {
                                    val = item.config.height || 0;
                                    frac = item.config.heightFraction || '0';
                                } else {
                                    val = item.config.customDims?.[input.key] || 0;
                                    frac = item.config.customFracs?.[input.key] || '0';
                                }
                                return `${input.label}: ${formatDim(val, frac)}"`;
                            }).join(', ');
                        }

                        const valance = VALANCE_OPTIONS.find(v => v.id === item.config.valanceType);
                        const hasValance = valance && valance.id !== 'standard' && valance.id !== 'reverse';
                        const hasSideChannels = item.config.sideChannelType === 'standard';

                        return (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 animate-in slide-in-from-right-4 duration-300">
                        <div className="w-20 h-20 rounded-lg bg-gray-100 shrink-0 border border-gray-200 overflow-hidden relative">
                            {item.config.material ? <img src={getFabricUrl(item.config.material.cloudinaryId, 'thumb')} alt="Fabric" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200"><Ruler size={24} /></div>}
                            <div className="absolute bottom-0 right-0 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-tl">x{item.config.quantity}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                            <h4 className="font-bold text-slate-800 truncate text-sm">{item.config.isMeasurementOnly ? t('pro.measureOnly') : (item.config.material?.name || 'Custom Shade')}</h4>
                            <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                            {item.config.isMeasurementOnly ? (
                            <div className="text-xs text-slate-500 mt-1 space-y-0.5"><div>{t('pro.location')}: {item.config.installer?.location}</div><div className="text-green-600 font-medium">Credited back on order</div></div>
                            ) : (
                            <>
                                <div className="text-xs text-gray-500 mt-1">{item.config.shape !== 'Standard' && <span className="font-bold text-slate-700 block mb-0.5">{getShapeLabel(item.config.shape)}</span>}{dimDisplay}<div className="mt-0.5 text-slate-400">{t(item.config.mountType === 'Inside Mount' ? 'mount.inside' : 'mount.outside')}</div></div>
                                <div className="text-xs text-gray-500 mt-1">{t(item.config.controlType === 'Metal Chain' ? 'control.chain' : 'control.motorized')} {item.config.controlType === 'Motorized' && item.config.motorPower && <span className="text-indigo-600 font-medium"> ({t(item.config.motorPower === 'Rechargeable' ? 'control.rechargeable' : 'control.hardwired')})</span>}
                                    {item.config.motorizedController && <span className="text-indigo-600 font-bold ml-1"> + {t('addon.remote')}</span>}
                                    {item.config.motorizedHub && <span className="text-indigo-600 font-bold ml-1"> + {t('addon.hub')}</span>}
                                    {item.config.sunSensor && <span className="text-indigo-600 font-bold ml-1"> + {t('addon.sunSensor')}</span>}
                                    {item.config.motorizedCharger && <span className="text-indigo-600 font-bold ml-1"> + {t('addon.charger')}</span>}
                                </div>
                                
                                {(hasValance || hasSideChannels) && (
                                    <div className="mt-1.5 pt-1.5 border-t border-gray-50 space-y-0.5">
                                        {hasValance && <div className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 uppercase tracking-wider"><Layout size={10} /> + {t(`valance.${valance.id}`)}</div>}
                                        {hasSideChannels && <div className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 uppercase tracking-wider"><Sidebar size={10} /> + {t('finish.standardChannels')}</div>}
                                    </div>
                                )}

                                {(item.config.measureService || item.config.installService) && item.config.installer && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {item.config.measureService && <div className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded inline-flex items-center gap-1 font-bold border border-indigo-100"><Ruler size={10} /> {t('pro.measureOnly')}</div>}
                                        {item.config.installService && <div className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded inline-flex items-center gap-1 font-bold border border-indigo-100"><Settings size={10} /> {t('pro.installOnly')}</div>}
                                    </div>
                                )}
                            </>
                            )}
                            <div className="mt-2 flex justify-between items-end pt-1"><div className="font-bold text-slate-900">${item.totalPrice.toFixed(2)}</div></div>
                        </div>
                        </div>
                        );
                    })}
                    <button onClick={onClearCart} className="text-xs text-red-500 hover:underline w-full text-center py-2">{t('checkout.clear')}</button>
                    </div>
                ) : (
                    <div className="text-center py-10 opacity-50"><ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" /><p>{t('checkout.empty')}</p><button onClick={() => { onClose(); onNavigate('builder'); }} className="text-indigo-600 font-bold text-sm mt-2 hover:underline">{t('checkout.startBuilding')}</button></div>
                )}
                {swatches.length > 0 ? (
                    <div className="pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-700 text-sm">{t('nav.swatches')} ({swatches.length})</h3><button onClick={onClearSwatches} className="text-xs text-red-400 hover:text-red-600">Remove All</button></div>
                        <div className="grid grid-cols-4 gap-2">
                            {swatches.map(swatch => (
                                <div key={swatch.id} className="relative group">
                                    <div className="aspect-square rounded border border-gray-200 overflow-hidden"><img src={getFabricUrl(swatch.cloudinaryId, 'thumb')} className="w-full h-full object-cover" /></div>
                                    <button onClick={() => onRemoveSwatch(swatch.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
                </div>
                <div className="p-5 bg-white border-t border-gray-100 shadow-xl z-10 shrink-0 space-y-3">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                          <span className="text-sm font-medium text-slate-500 block">{t('checkout.subtotal')}</span>
                          {isBulkOrder && <div className="text-xs text-green-600 font-bold">-${bulkDiscount.toFixed(2)} (10% bulk discount)</div>}
                          {!isBulkOrder && cartTotal > 0 && <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">{t('checkout.startingAt')} <span className="font-bold text-indigo-600">${affirmMonthly}/mo</span> {t('checkout.with')} <span className="font-bold italic text-slate-600">affirm</span></div>}
                        </div>
                        <span className="text-2xl font-bold text-slate-900">${cartTotal.toFixed(2)}</span>
                    </div>
                    <button onClick={handleProceedToCheckout} disabled={isProcessing || (cart.length === 0 && swatches.length === 0)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isProcessing ? (
                          <><Loader2 className="animate-spin" size={20} /> Processing...</>
                        ) : (
                          <>{t('checkout.proceed')} <ExternalLink size={20} /></>
                        )}
                    </button>
                    {!isSharing && (cart.length > 0 || swatches.length > 0) && <button onClick={() => setIsSharing(true)} className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"><Share2 size={16} /> Save / Share Cart</button>}
                    <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-wide font-medium font-bold"><ShieldCheck size={12} /> {t('checkout.secure')}</div>
                </div>
            </>
        )}

        {step === 'quote_form' && (
            <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden animate-in slide-in-from-right duration-300">
                <div className="bg-amber-600 p-6 text-white shrink-0"><h2 className="text-2xl font-bold mb-2">Request Custom Quote</h2><p className="text-amber-100 text-sm">For large orders, we offer volume discounts and dedicated project management.</p></div>
                <form onSubmit={handleSubmitQuote} className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><Building2 size={18} /> Company & Project Info</h3>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company / Organization</label><input required type="text" value={quoteForm.companyName} onChange={e => setQuoteForm({...quoteForm, companyName: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-amber-500 outline-none" placeholder="Acme Inc." /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Type</label><select className="w-full p-2 border border-gray-300 rounded focus:border-amber-500 outline-none bg-white" value={quoteForm.projectType} onChange={e => setQuoteForm({...quoteForm, projectType: e.target.value})}><option>Commercial Office</option><option>Multi-Family Residential</option><option>Hospitality / Hotel</option><option>Education</option><option>Healthcare</option><option>Large Residential</option></select></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Notes / Requirements</label><textarea className="w-full p-3 border border-gray-300 rounded focus:border-amber-500 outline-none h-24" placeholder="E.g. Need installation in 3 weeks, lift required for high windows..." value={quoteForm.details} onChange={e => setQuoteForm({...quoteForm, details: e.target.value})} /></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><User size={18} /> Contact Person</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label><input required type="text" value={customer.firstName} onChange={e => setCustomer({...customer, firstName: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-amber-500 outline-none" /></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label><input required type="text" value={customer.lastName} onChange={e => setCustomer({...customer, lastName: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-amber-500 outline-none" /></div>
                        </div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label><input required type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-amber-500 outline-none" /></div>
                        <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label><input type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-amber-500 outline-none" /></div>
                    </div>
                </form>
                <div className="p-5 bg-white border-t border-gray-100 shadow-xl z-10 shrink-0"><button onClick={handleSubmitQuote} disabled={isProcessing} className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" /> : 'Submit Quote Request'}</button></div>
            </div>
        )}

        {step === 'details' && (
            <form onSubmit={handlePaymentStep} className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden animate-in slide-in-from-right duration-300">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><User size={18} /> Contact & Shipping</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">First Name</label><input required type="text" value={customer.firstName} onChange={e => setCustomer({...customer, firstName: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-indigo-500 outline-none" /></div>
                            <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Name</label><input required type="text" value={customer.lastName} onChange={e => setCustomer({...customer, lastName: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-indigo-500 outline-none" /></div>
                        </div>
                        <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label><div className="relative"><Mail size={16} className="absolute left-3 top-2.5 text-gray-400" /><input required type="email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="w-full pl-9 p-2 border border-gray-300 rounded focus:border-indigo-500 outline-none" placeholder="receipt@example.com" /></div></div>
                        <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Street Address</label><input required type="text" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-indigo-500 outline-none" placeholder="1234 Main St" /></div>
                        <div className="grid grid-cols-6 gap-4"><div className="col-span-3"><label className="block text-xs font-bold text-slate-700 uppercase mb-1">City</label><input required type="text" value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-indigo-500 outline-none" /></div><div className="col-span-1"><label className="block text-xs font-bold text-slate-700 uppercase mb-1">State</label><input required type="text" value={customer.state} onChange={e => setCustomer({...customer, state: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-indigo-500 outline-none uppercase" maxLength={2} placeholder="NY" /></div><div className="col-span-2"><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Zip Code</label><input required type="text" value={customer.zip} onChange={e => setCustomer({...customer, zip: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-indigo-500 outline-none" /></div></div>
                        <div><label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone</label><input type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full p-2 border border-gray-300 rounded focus:border-indigo-500 outline-none" placeholder="(555) 123-4567" /></div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"><h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Lock size={18} /> Payment Method</h3><div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg"><button type="button" onClick={() => { setPaymentMethod('stripe'); trackEvent('payment_method_select', { payment_type: 'stripe' }); }} className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${paymentMethod === 'stripe' ? 'bg-white shadow text-slate-900' : 'text-gray-500 hover:text-slate-700'}`}><CreditCard size={16} /> Credit Card</button><button type="button" onClick={() => { setPaymentMethod('affirm'); trackEvent('payment_method_select', { payment_type: 'affirm' }); }} className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${paymentMethod === 'affirm' ? 'bg-white shadow text-[#4a4af4]' : 'text-gray-500 hover:text-slate-700'}`}><span className="font-serif italic text-lg leading-none transform translate-y-[1px]">affirm</span></button></div>{paymentMethod === 'stripe' ? (<div className="space-y-4 animate-in fade-in"><div className="p-3 border border-gray-300 rounded-md bg-white shadow-sm"><label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Card Details</label><div id="card-element" className="w-full h-10 py-2.5"></div></div>{stripeError && (<div className="text-red-500 text-xs font-bold flex items-center gap-1"><X size={12} /> {stripeError}</div>)}<div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 font-medium pt-2"><Lock size={10} /> Powered by <span className="font-bold text-[#635BFF]">Stripe</span></div></div>) : (<div className="text-center py-6 animate-in fade-in"><div className="text-[#4a4af4] text-4xl font-serif font-bold italic mb-2 tracking-tight">affirm</div><p className="text-sm text-slate-600 mb-4">Pay as low as <span className="font-bold text-[#4a4af4]">${affirmMonthly}/mo</span>.</p><div className="bg-[#4a4af4]/5 border border-[#4a4af4]/20 rounded-lg p-4 text-xs text-slate-600 text-left mb-4"><ul className="space-y-2"><li className="flex items-center gap-2"><Check size={12} className="text-[#4a4af4]"/> 0% APR options available</li><li className="flex items-center gap-2"><Check size={12} className="text-[#4a4af4]"/> No hidden fees</li><li className="flex items-center gap-2"><Check size={12} className="text-[#4a4af4]"/> Checking eligibility won't affect your credit score</li></ul></div><a href="#" className="text-xs text-[#4a4af4] font-bold hover:underline">See if you prequalify</a></div>)}</div>
                </div>
                <div className="p-5 bg-white border-t border-gray-100 shadow-xl z-10 shrink-0"><div className="flex justify-between items-center mb-4"><span className="text-sm font-medium text-slate-500">{t('checkout.total')}</span><span className="text-2xl font-bold text-slate-900">${cartTotal.toFixed(2)}</span></div><button type="submit" disabled={isProcessing} className={`w-full text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${paymentMethod === 'stripe' ? 'bg-[#635BFF] hover:bg-[#534be0]' : 'bg-[#4a4af4] hover:bg-[#3b3be0]'}`}>{isProcessing ? (<><Loader2 className="animate-spin" /> Processing...</>) : (paymentMethod === 'stripe' ? <><ShieldCheck size={20} /> Pay ${cartTotal.toFixed(2)}</> : 'Continue with Affirm')}</button></div>
            </form>
        )}

        {step === 'survey' && (
            <div className="flex-1 flex flex-col bg-white animate-in slide-in-from-right duration-300 overflow-hidden">
               <div className="p-6 border-b border-gray-100 bg-green-50 shrink-0"><div className="flex items-center gap-2 text-green-700 font-bold mb-1"><CheckCircle size={20} /> Payment Successful</div><p className="text-sm text-green-800">Please finalize your order details below.</p></div>
               <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
                  {hasProService && (
                      <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-sm"><h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2"><Calendar size={18} className="text-indigo-600" /> Schedule Your Pro</h3><p className="text-xs text-slate-500 mb-4">Your installer will confirm exact time within 24 hours.</p><div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4"><button onClick={() => setScheduleMode('asap')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${scheduleMode === 'asap' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-slate-700'}`}><Zap size={14} /> As Soon As Possible</button><button onClick={() => setScheduleMode('scheduled')} className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${scheduleMode === 'scheduled' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-slate-700'}`}><Calendar size={14} /> Pick Preference</button></div>{scheduleMode === 'scheduled' && (<div className="space-y-4 animate-in fade-in slide-in-from-top-2"><div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preferred Days</label><div className="flex flex-wrap gap-2">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<button key={day} onClick={() => toggleDay(day)} className={`px-3 py-2 rounded text-xs font-bold border transition-colors ${selectedDays.includes(day) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-gray-200 hover:border-gray-300'}`}>{day}</button>))}</div></div><div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preferred Time</label><div className="grid grid-cols-3 gap-2">{[{ label: 'Morning', icon: Sun }, { label: 'Afternoon', icon: Sun }, { label: 'Evening', icon: Moon }].map(time => (<button key={time.label} onClick={() => toggleTime(time.label)} className={`flex flex-col items-center justify-center gap-1 p-2 rounded border transition-colors ${selectedTimes.includes(time.label) ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-gray-200 text-slate-500 hover:bg-gray-50'}`}><time.icon size={16} /><span className="text-[10px] font-bold">{time.label}</span></button>))}</div></div></div>)}{scheduleMode === 'asap' && (<div className="text-xs text-green-700 bg-green-50 p-3 rounded border border-green-100 flex items-center gap-2"><CheckCircle size={14} /> We will prioritize your dispatch.</div>)}</div>
                  )}
                  {hasPhysicalProducts && (
                      <div><h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Settings size={18} /> Customize Your Shades</h3><div className="space-y-3">{cart.filter(item => !item.config.isMeasurementOnly).map((item) => (<div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden"><button onClick={() => setOpenSpecId(openSpecId === item.id ? null : item.id)} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-white rounded border border-gray-200 overflow-hidden shrink-0"><img src={getFabricUrl(item.config.material?.cloudinaryId || '', 'thumb')} className="w-full h-full object-cover"/></div><div><div className="font-bold text-sm text-slate-800">{item.config.material?.name}</div><div className="text-[10px] text-slate-500">{item.config.width}" x {item.config.height}"</div></div></div>{openSpecId === item.id ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}</button>{openSpecId === item.id && specs[item.id] && (<div className="p-4 bg-white space-y-4 animate-in slide-in-from-top-2"><div className="grid grid-cols-2 gap-4"><div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Roll Type</label><select className="w-full p-2 border border-gray-300 rounded text-sm bg-white" value={specs[item.id].rollType} onChange={(e) => setSpecs({...specs, [item.id]: { ...specs[item.id], rollType: e.target.value }})}><option value="Standard">Standard (Back)</option><option value="Reverse">Reverse (Front)</option></select></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Control Side</label><select className="w-full p-2 border border-gray-300 rounded text-sm bg-white" value={specs[item.id].controlPosition} onChange={(e) => setSpecs({...specs, [item.id]: { ...specs[item.id], controlPosition: e.target.value }})}><option value="Right">Right</option><option value="Left">Left</option></select></div></div><div><label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Bottom Bar</label><select className="w-full p-2 border border-gray-300 rounded text-sm bg-white" value={specs[item.id].bottomBar} onChange={(e) => setSpecs({...specs, [item.id]: { ...specs[item.id], bottomBar: e.target.value }})}><option value="Fabric Wrapped">Fabric Wrapped (Invisible)</option><option value="Exposed Silver">Exposed Silver</option><option value="Exposed White">Exposed White</option><option value="Exposed Black">Exposed Black</option></select></div></div>)}</div>))}</div></div>
                  )}
                  <div className="pt-4 border-t border-gray-100"><div><label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Truck size={16} /> Delivery Instructions</label><textarea className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:border-indigo-500 outline-none min-h-[80px]" placeholder="E.g. Gate code 1234, Leave at back door..." value={survey.deliveryNotes} onChange={(e) => setSurvey({...survey, deliveryNotes: e.target.value})} /></div><div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" className="w-5 h-5 accent-indigo-600 rounded" checked={survey.isCommercial} onChange={(e) => setSurvey({...survey, isCommercial: e.target.checked})} /><span className="text-sm font-bold text-slate-700 flex items-center gap-2"><Building2 size={16} /> Is this a commercial address?</span></label></div><div className="mt-4"><label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><HelpCircle size={16} /> How did you hear about us?</label><select className="w-full p-3 border border-gray-300 rounded-lg text-sm bg-white" value={survey.referralSource} onChange={(e) => setSurvey({...survey, referralSource: e.target.value})}><option value="">Select an option...</option><option value="Google">Google Search</option><option value="Instagram">Instagram</option><option value="Friend">Friend or Family</option><option value="Installer">Local Installer</option><option value="Other">Other</option></select></div></div>
               </div>
               <div className="p-5 border-t border-gray-100 shadow-xl z-10 shrink-0 bg-white"><button onClick={handleFinalizeOrder} disabled={isProcessing} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" /> : t('checkout.finalize')}</button></div>
            </div>
        )}

        {step === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white animate-in zoom-in-95"><div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"><CheckCircle size={40} /></div><h2 className="text-2xl font-bold text-slate-900 mb-2">{isBulkOrder ? 'Quote Requested' : t('checkout.orderPlaced') + '!'}</h2><p className="text-slate-600 mb-8">{isBulkOrder ? `Thank you, ${customer.firstName}. Our commercial team has received your request and will contact you within 1 business hour.` : `Thank you, ${customer.firstName}. Your order has been placed successfully. A confirmation email has been sent to ${customer.email}.`}</p><button onClick={resetAndClose} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">Continue Shopping</button></div>
        )}
      </div>
    </div>
  );
};

export default CheckoutDrawer;