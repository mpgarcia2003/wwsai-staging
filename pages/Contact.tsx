
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Search, Star, ShieldCheck, UserCheck, Loader2 } from 'lucide-react';
import { getInstallerForZip } from '../constants';
import { Installer } from '../types';
import { saveMessage } from '../utils/storage';
import { trackEvent } from '../utils/analytics';

const Contact: React.FC = () => {
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [localPro, setLocalPro] = useState<Installer | null>(null);

  // Form State
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleFindPro = (e: React.FormEvent) => {
    e.preventDefault();
    if (zip.length < 5) return;
    setLoading(true);
    setLocalPro(null);
    
    // Simulate API latency
    setTimeout(() => {
      const pro = getInstallerForZip(zip);
      setLocalPro(pro);
      setLoading(false);
    }, 800);
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.email || !form.message) return;
      
      setIsSending(true);
      
      // Simulate network request
      setTimeout(() => {
          saveMessage({
              type: 'contact',
              name: `${form.firstName} ${form.lastName}`,
              email: form.email,
              content: form.message
          });
          
          // Track GA4 Event
          trackEvent('email_submission', {
            category: 'Contact',
            label: 'General Inquiry',
            email: form.email // Hashed in production usually, but useful for debugging here
          });

          setIsSending(false);
          setIsSent(true);
          setForm({ firstName: '', lastName: '', email: '', message: '' });
      }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
         <h1 className="text-4xl font-bold text-slate-900 mb-4">Get in Touch</h1>
         <p className="text-slate-600 max-w-2xl mx-auto">
            Have questions about the visualizer? Need help measuring? Our team of design experts is here to help you create the perfect shade.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <div className="space-y-8">
            {/* Dynamic Locator Section */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-700 overflow-hidden relative">
               <div className="relative z-10">
                  <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                    <UserCheck className="text-indigo-400" /> Find Your Local Expert
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">
                    Enter your zip code to connect directly with your dedicated neighborhood specialist.
                  </p>
                  
                  <form onSubmit={handleFindPro} className="flex gap-2 mb-6">
                    <input 
                      type="text" 
                      placeholder="Enter Zip Code" 
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="bg-slate-800 border border-slate-600 text-white rounded-lg px-4 py-2 w-full focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                    />
                    <button 
                      type="submit" 
                      disabled={loading || zip.length < 5}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                    >
                      {loading ? '...' : <Search size={20} />}
                    </button>
                  </form>

                  {localPro && (
                    <div className="bg-white text-slate-900 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4">
                       <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-indigo-600 border border-slate-200">
                             {localPro.name.charAt(0)}
                          </div>
                          <div>
                             <h4 className="font-bold text-lg flex items-center gap-2">
                                {localPro.name} <ShieldCheck size={16} className="text-green-500" />
                             </h4>
                             <p className="text-xs text-slate-500 mb-2">{localPro.location}</p>
                             <div className="flex items-center gap-3 text-xs font-medium">
                                <span className="flex items-center gap-1 text-yellow-500">
                                   <Star size={12} fill="currentColor" /> {localPro.rating}
                                </span>
                                <span className="text-slate-400">{localPro.reviews} verified jobs</span>
                             </div>
                             <div className="mt-3 bg-indigo-50 p-3 rounded-lg text-xs">
                                <span className="font-bold text-indigo-700 block mb-1">Service Area Active</span>
                                <span className="text-indigo-600">
                                  {localPro.name.split(' ')[0]} is currently accepting new measurement appointments in {zip}.
                                </span>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
               
               {/* Background Blob */}
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                  <Mail size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-slate-900">Email Support</h3>
                  <p className="text-slate-500 mb-2">We typically respond within 2 hours.</p>
                  <a href="mailto:Hello@WorldWideShades.com" className="text-indigo-600 font-medium hover:underline">Hello@WorldWideShades.com</a>
               </div>
            </div>

            <div className="flex items-start gap-4">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-slate-900">Phone</h3>
                  <p className="text-slate-500 mb-2">Mon-Fri from 8am to 5pm EST.</p>
                  <a href="tel:+18446742716" className="text-indigo-600 font-medium hover:underline">+1 (844) 674-2716</a>
               </div>
            </div>

            <div className="flex items-start gap-4">
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin size={24} />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-slate-900">Headquarters</h3>
                  <p className="text-slate-500">
                     26 Broadway, Suite 934<br/>
                     New York, NY 10004
                  </p>
               </div>
            </div>
         </div>

         <form onSubmit={handleSendMessage} className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-xl text-slate-900 mb-2">Send us a message</h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none bg-white text-slate-900" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input type="text" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none bg-white text-slate-900" />
               </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
               <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none bg-white text-slate-900" />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
               <textarea required value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:border-indigo-500 outline-none h-32 resize-none bg-white text-slate-900" />
            </div>
            <button 
                type="submit"
                disabled={isSending || isSent}
                className={`w-full font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${isSent ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
            >
               {isSending ? <Loader2 className="animate-spin" size={20} /> : isSent ? 'Message Sent!' : 'Send Message'}
            </button>
         </form>
      </div>
    </div>
  );
};

export default Contact;
