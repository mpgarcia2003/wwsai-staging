import React, { useState, useEffect } from 'react';
import { Package, CircleX, LogOut, Settings, ShieldCheck, RotateCcw, Ruler, Sliders, Mail, User, Calendar, Truck, Info, MessageSquare, CheckCircle, ShoppingCart, Zap, Wifi, Sun, MapPin, Briefcase, FileDown, Palette } from 'lucide-react';
import { getOrders, updateOrderStatus, getEmailSettings, saveEmailSettings, getMessages, updateMessageStatus, deleteMessage } from '../utils/storage';
import { getFabricUrl, SHAPE_CONFIGS } from '../constants';
import { Order, EmailSettings, ShapeType, Message, OrderStatus } from '../types';

const STATUS_ORDER: OrderStatus[] = ['Received', 'Started', 'Finished', 'Shipped', 'Delivered'];
const formatDim = (val: number, frac: string) => (frac && frac !== '0') ? `${val} ${frac}` : `${val}`;

const Admin: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [view, setView] = useState<'orders' | 'messages' | 'settings'>('orders');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({ serviceId: '', publicKey: '', adminTemplateId: '', customerTemplateId: '', adminEmail: '' });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManufacturerView, setIsManufacturerView] = useState(false);

  useEffect(() => { if (isAuthenticated) refreshData(); }, [isAuthenticated]);

  useEffect(() => {
    const handleAfterPrint = () => setIsManufacturerView(false);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [ord, msg] = await Promise.all([getOrders(), getMessages()]);
      setOrders(ord); setMessages(msg);
      setEmailSettings(getEmailSettings());
    } finally { setIsRefreshing(false); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') setIsAuthenticated(true);
    else { alert('Invalid password'); setPassword(''); }
  };

  const handlePrint = (manufacturerMode: boolean) => {
    setIsManufacturerView(manufacturerMode);
    setTimeout(() => { window.print(); }, 100);
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <ShieldCheck size={48} className="mx-auto text-indigo-600 mb-4" />
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Password" />
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors">Enter Dashboard</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <aside className="bg-slate-900 text-white w-full md:w-64 flex flex-col shrink-0 print:hidden">
        <div className="p-6 border-b border-slate-800 font-bold text-xl flex items-center gap-2">
          <Settings className="text-indigo-500" /> WWS Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'orders', icon: Package, label: 'Orders' },
            { id: 'messages', icon: MessageSquare, label: 'Inbox' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(item => (
            <button key={item.id} onClick={() => setView(item.id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === item.id ? 'bg-indigo-600' : 'text-slate-400 hover:bg-slate-800'}`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 text-slate-400 hover:text-white"><LogOut size={18} /> Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center print:hidden">
            <h1 className="text-2xl font-bold capitalize">{view}</h1>
            <button onClick={refreshData} className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"><RotateCcw size={16} className={isRefreshing ? 'animate-spin' : ''} /></button>
          </div>

          {view === 'orders' && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b text-gray-500">
                  <tr><th className="p-4">Order ID</th><th className="p-4">Customer</th><th className="p-4">Status</th><th className="p-4">Total</th><th className="p-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="p-4 font-mono">{o.id}</td>
                      <td className="p-4 font-bold">{o.customer.firstName} {o.customer.lastName}</td>
                      <td className="p-4"><span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase">{o.status}</span></td>
                      <td className="p-4 font-bold">${o.total.toFixed(2)}</td>
                      <td className="p-4 text-right"><button onClick={() => setSelectedOrder(o)} className="text-indigo-600 font-bold hover:underline">Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'messages' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white rounded-xl border overflow-hidden">
                <div className="p-4 border-b bg-gray-50 font-bold text-sm">Recent Inquiries</div>
                <div className="divide-y h-[600px] overflow-y-auto">
                  {messages.map(m => (
                    <button key={m.id} onClick={() => setSelectedMessage(m)} className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedMessage?.id === m.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm">{m.name}</span>
                        <span className="text-[10px] text-gray-400">{new Date(m.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1">{m.content}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 bg-white rounded-xl border p-6 min-h-[400px]">
                {selectedMessage ? (
                  <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-bold">{selectedMessage.name}</h2>
                        <p className="text-indigo-600 font-medium">{selectedMessage.email}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl mb-6 text-slate-700 whitespace-pre-wrap">{selectedMessage.content}</div>
                    <div className="flex gap-3">
                      <a href={`mailto:${selectedMessage.email}`} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Mail size={18} /> Reply via Email</a>
                      <button onClick={() => updateMessageStatus(selectedMessage.id, 'read').then(refreshData)} className="border px-6 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors">Mark as Resolved</button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50"><MessageSquare size={48} className="mb-4" /><p>Select a message to view details</p></div>
                )}
              </div>
            </div>
          )}

          {view === 'settings' && (
            <div className="max-w-2xl bg-white p-8 rounded-2xl border shadow-sm space-y-6">
               <h2 className="text-xl font-bold border-b pb-4">Email Configuration</h2>
               <div className="space-y-4">
                  <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">EmailJS Service ID</label><input type="text" value={emailSettings.serviceId} onChange={e => setEmailSettings({...emailSettings, serviceId: e.target.value})} className="w-full p-2 border rounded" /></div>
                  <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">EmailJS Public Key</label><input type="text" value={emailSettings.publicKey} onChange={e => setEmailSettings({...emailSettings, publicKey: e.target.value})} className="w-full p-2 border rounded" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Admin Template ID</label><input type="text" value={emailSettings.adminTemplateId} onChange={e => setEmailSettings({...emailSettings, adminTemplateId: e.target.value})} className="w-full p-2 border rounded" /></div>
                    <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Customer Template ID</label><input type="text" value={emailSettings.customerTemplateId} onChange={e => setEmailSettings({...emailSettings, customerTemplateId: e.target.value})} className="w-full p-2 border rounded" /></div>
                  </div>
                  <div><label className="block text-xs font-black text-slate-400 uppercase mb-1">Admin Alert Email</label><input type="email" value={emailSettings.adminEmail} onChange={e => setEmailSettings({...emailSettings, adminEmail: e.target.value})} className="w-full p-2 border rounded" /></div>
                  <button onClick={() => { saveEmailSettings(emailSettings); alert('Settings saved locally.'); }} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors">Save Settings</button>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0 print:block" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-900 text-white p-6 md:p-8 flex justify-between items-center print:bg-slate-100 print:text-slate-900 print:border-b-2 print:border-slate-300">
              <div>
                <div className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-1">
                    {isManufacturerView ? 'Manufacturer Work Order' : 'Order Summary'}
                </div>
                <h2 className="text-3xl font-black flex items-center gap-3">#{selectedOrder.id}</h2>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right hidden sm:block">
                    <div className="text-xs text-slate-500 font-bold uppercase">{new Date(selectedOrder.date).toLocaleDateString()}</div>
                    {!isManufacturerView && <div className="text-xs text-indigo-400 font-bold uppercase">{selectedOrder.paymentMethod}</div>}
                 </div>
                 <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors print:hidden"><CircleX size={32} /></button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6 md:p-8 space-y-8 print:max-h-none print:overflow-visible">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden print:border-slate-200">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><User size={16} /> Customer Contact</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div>
                                    <div className="text-xl font-bold text-slate-900">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</div>
                                    <div className="text-indigo-600 font-medium">{selectedOrder.customer.email}</div>
                                    {selectedOrder.customer.phone && <div className="text-slate-500 font-medium">{selectedOrder.customer.phone}</div>}
                                </div>
                                <div className="text-slate-600">
                                    <div className="font-bold flex items-center gap-1"><Truck size={14} /> Shipping Address</div>
                                    <p className="mt-1 leading-relaxed text-sm">
                                        {selectedOrder.customer.address}<br/>
                                        {selectedOrder.customer.city}, {selectedOrder.customer.state} {selectedOrder.customer.zip}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {(selectedOrder.deliveryNotes || selectedOrder.isCommercial) && (
                            <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100 shadow-sm print:border-slate-200">
                                <h3 className="text-xs font-black text-amber-900/40 uppercase tracking-widest mb-4 flex items-center gap-2"><Info size={16} /> Order Metadata</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {selectedOrder.isCommercial && (
                                        <div className="col-span-full flex items-center gap-2 text-red-700 font-bold bg-white px-3 py-1.5 rounded-lg border border-red-100">
                                            <Briefcase size={16} /> Commercial Property Address
                                        </div>
                                    )}
                                    {selectedOrder.deliveryNotes && (
                                        <div className="bg-white p-3 rounded-lg border border-amber-100 col-span-full">
                                            <div className="text-[10px] font-black text-amber-800 uppercase mb-1">Delivery Instructions</div>
                                            <p className="text-slate-700 italic">"{selectedOrder.deliveryNotes}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden print:border print:border-slate-300 print:bg-white print:text-slate-900">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 print:text-slate-400">Order Information</h3>
                            <div className="space-y-4">
                                <div className="print:hidden">
                                    <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase">Order Workflow</label>
                                    <select 
                                        value={selectedOrder.status} 
                                        onChange={e => updateOrderStatus(selectedOrder.id, e.target.value as any).then(refreshData)} 
                                        className="bg-slate-800 text-white p-3 rounded-xl w-full border border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                    >
                                        {STATUS_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="hidden print:block font-bold text-lg mb-2">
                                    Status: {selectedOrder.status}
                                </div>
                                {!isManufacturerView && (
                                    <div className="pt-4 border-t border-slate-800 print:border-slate-200">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Received Value</div>
                                        <div className="text-4xl font-black text-indigo-400 print:text-slate-900">${selectedOrder.total.toFixed(2)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {selectedOrder.appointmentSlots && selectedOrder.appointmentSlots.length > 0 && (
                            <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-lg shadow-indigo-100 print:bg-slate-50 print:text-slate-900 print:border print:border-slate-200">
                                <h3 className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-3 flex items-center gap-2 print:text-slate-400"><Calendar size={16} /> Pro Appointment</h3>
                                <ul className="space-y-2">
                                    {selectedOrder.appointmentSlots.map((slot, i) => (
                                        <li key={i} className="text-xs font-bold bg-white/10 p-2 rounded border border-white/10 flex items-center gap-2 print:bg-white print:border-slate-200">
                                            <CheckCircle size={12} className="text-indigo-300 print:text-indigo-600" /> {slot}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><ShoppingCart className="text-indigo-600" /> Line Items & Configurations</h3>
                     <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">{selectedOrder.items.length} Configs</span>
                  </div>
                  <div className="space-y-4">
                    {selectedOrder.items.map(item => {
                        const cust = selectedOrder.customizations?.[item.id];
                        const shapeData = SHAPE_CONFIGS[item.config.shape as ShapeType];
                        return (
                        <div key={item.id} className="bg-white border-2 border-gray-100 rounded-3xl p-6 hover:border-indigo-100 transition-colors shadow-sm print:border-slate-300 print:rounded-2xl">
                           <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-32 flex flex-col gap-2 shrink-0">
                                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-inner print:rounded-lg">
                                        <img src={getFabricUrl(item.config.material?.cloudinaryId || '', 'thumb')} className="w-full h-full object-cover" />
                                    </div>
                                    {item.config.shape !== 'Standard' && (
                                        <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-black uppercase text-center border border-indigo-100">{item.config.shape}</div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div className="flex justify-between items-start border-b border-gray-50 pb-4 print:border-slate-100">
                                        <div>
                                            <h4 className="text-lg font-black text-slate-900">{item.config.material?.name || 'Custom Specification'}</h4>
                                            <div className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-4">
                                                <span className="flex items-center gap-1"><Ruler size={12} /> {item.config.mountType}</span>
                                            </div>
                                        </div>
                                        {!isManufacturerView && (
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-slate-900">${item.totalPrice.toFixed(2)}</div>
                                                <div className="text-[10px] font-bold text-indigo-600 uppercase">Qty: {item.config.quantity}</div>
                                            </div>
                                        )}
                                        {isManufacturerView && (
                                            <div className="text-right"><div className="text-xl font-black text-slate-900 uppercase tracking-widest">Qty: {item.config.quantity}</div></div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Ruler size={12}/> Measurements</div>
                                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1 print:bg-white print:border-slate-200">
                                                {item.config.shape === 'Standard' ? (
                                                    <div className="text-sm font-bold text-slate-800">{formatDim(item.config.width, item.config.widthFraction)}" W x {formatDim(item.config.height, item.config.heightFraction)}" H</div>
                                                ) : (
                                                    <div className="space-y-1">
                                                        {shapeData?.inputs.map(input => (
                                                            <div key={input.key} className="flex justify-between items-center text-xs">
                                                                <span className="text-slate-500 font-medium">{input.label}:</span>
                                                                <span className="font-bold text-slate-900">{formatDim(item.config.customDims?.[input.key] || 0, item.config.customFracs?.[input.key] || '0')}"</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Zap size={12}/> Control & Power</div>
                                            <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100 print:bg-white print:border-slate-200">
                                                <div className="text-sm font-bold text-indigo-900 flex items-center gap-2">{item.config.controlType} {item.config.controlType === 'Motorized' && <Wifi size={14} />}</div>
                                                {item.config.controlType === 'Motorized' && (
                                                    <div className="mt-2 space-y-1">
                                                        <div className="text-[10px] text-indigo-600 font-medium">Power: {item.config.motorPower}</div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.config.motorizedController && <span className="bg-white text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-indigo-100">Remote</span>}
                                                            {item.config.motorizedHub && <span className="bg-white text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-indigo-100">Smart Hub</span>}
                                                            {item.config.motorizedCharger && <span className="bg-white text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-indigo-100">Charger</span>}
                                                            {item.config.sunSensor && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-amber-200 flex items-center gap-1"><Sun size={8}/> Sun Sensor</span>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Sliders size={12}/> Tech Specs</div>
                                            <div className="bg-slate-900 text-white rounded-xl p-3 text-xs space-y-1.5 font-medium print:bg-white print:text-slate-900 print:border print:border-slate-200">
                                                <div className="flex justify-between"><span className="text-slate-500">Roll:</span> <span className="text-indigo-300 font-bold print:text-indigo-600">{cust?.rollType || item.config.rollType || 'Standard'}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-500">Position:</span> <span className="text-indigo-300 font-bold print:text-indigo-600">{cust?.controlPosition || item.config.controlPosition || 'Right'}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-500">Bottom Bar:</span> <span className="text-indigo-300 font-bold print:text-indigo-600">{cust?.bottomBar || item.config.bottomBar || 'Fabric Wrapped'}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                           </div>
                        </div>
                    )})}
                  </div>
                </div>

                {selectedOrder.swatches && selectedOrder.swatches.length > 0 && (
                    <div className="pt-8 border-t border-gray-100 print:border-slate-200">
                        <div className="flex items-center gap-3 mb-6"><Palette className="text-indigo-600" /><h3 className="text-xl font-black text-slate-900">Requested Free Swatches</h3></div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                            {selectedOrder.swatches.map(swatch => (
                                <div key={swatch.id} className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm text-center print:rounded-lg">
                                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2"><img src={getFabricUrl(swatch.cloudinaryId, 'thumb')} className="w-full h-full object-cover" /></div>
                                    <div className="text-[10px] font-black text-slate-900 uppercase truncate px-1">{swatch.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 print:border-slate-200 print:bg-white">
               <div className="text-xs text-slate-400 font-medium flex items-center gap-2"><ShieldCheck size={14} /> PCI Compliant Payment Processed via Stripe</div>
               {!isManufacturerView && (
                 <div className="text-right mr-auto pl-4 hidden print:block"><div className="text-xs text-slate-400 uppercase font-bold">Grand Total</div><div className="text-2xl font-black text-slate-900">${selectedOrder.total.toFixed(2)}</div></div>
               )}
               <div className="flex gap-3 w-full sm:w-auto print:hidden">
                  <button onClick={() => handlePrint(true)} className="flex-1 sm:flex-none bg-indigo-50 text-indigo-700 border border-indigo-200 px-6 py-3 rounded-xl font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"><FileDown size={18} /> Manufacturer PDF</button>
                  <button onClick={() => handlePrint(false)} className="flex-1 sm:flex-none bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-xl transition-all flex items-center justify-center gap-2"><Package size={18} /> Print Work Order</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
