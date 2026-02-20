import { CartItem, Fabric, EmailSettings, Order, Message, OrderStatus, BlogPost } from '../types';
import { ALL_FABRICS } from '../constants';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jfpdxwdggvxxgntuasqu.supabase.co';
const supabaseAnonKey = 'sb_publishable_OYktS03HiATDVr6ZDD3QRA_4By1mICe';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EMAIL_SETTINGS_KEY = 'wws_email_settings';
const CART_STORAGE_KEY = 'wws_cart_v1';
const SWATCHES_STORAGE_KEY = 'wws_swatches_v1';

// --- HELPERS ---
const mapOrderFromDb = (o: any): Order => ({
  ...o,
  paymentMethod: o.payment_method,
  deliveryNotes: o.delivery_notes,
  referralSource: o.referral_source,
  isCommercial: o.is_commercial,
  appointmentSlots: o.appointment_slots,
});

const mapOrderToDb = (o: Order) => ({
  id: o.id,
  customer: o.customer,
  items: o.items,
  swatches: o.swatches,
  customizations: o.customizations,
  total: o.total,
  status: o.status,
  date: o.date,
  payment_method: o.paymentMethod,
  delivery_notes: o.deliveryNotes,
  referral_source: o.referralSource,
  is_commercial: o.isCommercial,
  appointment_slots: o.appointmentSlots,
});

const sanitizeForJsonb = (obj: any) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    return obj;
  }
};

// --- MESSAGES ---
export const getMessages = async (): Promise<Message[]> => {
  const { data, error } = await supabase.from('messages').select('*').order('timestamp', { ascending: false });
  return error ? [] : data;
};

export const saveMessage = async (msg: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
  const newMessage = { ...msg, id: `msg_${Date.now()}`, timestamp: Date.now(), status: 'unread' };
  await supabase.from('messages').insert([newMessage]);
  return newMessage;
};

export const updateMessageStatus = async (id: string, status: Message['status']) => {
  await supabase.from('messages').update({ status }).eq('id', id);
};

export const deleteMessage = async (id: string) => {
  await supabase.from('messages').delete().eq('id', id);
};

// --- ORDERS ---
export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
  return error ? [] : data.map(mapOrderFromDb);
};

export const saveOrder = async (order: Order) => {
  await supabase.from('orders').insert([mapOrderToDb(order)]);
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  await supabase.from('orders').update({ status }).eq('id', orderId);
  return getOrders();
};

// --- FABRICS ---
export const getDynamicFabrics = async (): Promise<Fabric[]> => {
  const { data, error } = await supabase.from('fabrics').select('*').eq('is_visible', true);
  if (error || !data || data.length === 0) return ALL_FABRICS;
  return data.map(f => ({
    ...f,
    priceGroup: f.price_group,
    cloudinaryId: f.cloudinary_id
  }));
};

// --- SWATCH REQUESTS ---
export const saveSwatchRequest = async (request: {
  name: string;
  email: string;
  address: string;
  city_state_zip: string;
  fabrics: { id: string; name: string; category: string }[];
}): Promise<boolean> => {
  const payload = {
    id: `SWATCH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: request.name,
    email: request.email,
    address: request.address,
    city_state_zip: request.city_state_zip,
    fabrics: sanitizeForJsonb(request.fabrics),
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  const { error } = await supabase.from('swatch_requests').insert([payload]);
  if (error) {
    console.error('Swatch request save error:', error.message);
    // Fallback: save to localStorage so we don't lose the lead
    try {
      const existing = JSON.parse(localStorage.getItem('wws_pending_swatch_requests') || '[]');
      existing.push(payload);
      localStorage.setItem('wws_pending_swatch_requests', JSON.stringify(existing));
    } catch (e) {}
    return false;
  }
  return true;
};

// --- SHARED CARTS ---
export const saveSharedCart = async (cart: CartItem[], swatches: Fabric[]): Promise<string | null> => {
  const shareId = `CART-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const payload = {
    id: shareId,
    cart: sanitizeForJsonb(cart),
    swatches: sanitizeForJsonb(swatches),
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
  const { error } = await supabase.from('shared_carts').insert([payload]);
  if (error) {
    console.error('Supabase Save Error:', error.message);
    if (error.message.includes('shared_carts') || error.message.includes('schema cache')) {
      alert("DATABASE ERROR: The 'shared_carts' table does not exist in your Supabase project. \n\nPlease run the SQL setup script in your Supabase SQL Editor.");
    }
    return null;
  }
  return shareId;
};

export const loadSharedCart = async (shareId: string): Promise<{ cart: CartItem[], swatches: Fabric[] } | null> => {
  const { data, error } = await supabase.from('shared_carts').select('cart, swatches').eq('id', shareId).single();
  if (error || !data) return null;
  return { cart: data.cart as CartItem[], swatches: data.swatches as Fabric[] };
};

// --- SETTINGS ---
export const getEmailSettings = (): EmailSettings => {
  const raw = localStorage.getItem(EMAIL_SETTINGS_KEY);
  const defaults = { 
    serviceId: 'service_8ivbdhg', 
    publicKey: '8b2s8hObjmNngJm9Y', 
    adminTemplateId: 'template_cdbbdvw', 
    customerTemplateId: 'template_cdbbdvw', 
    adminEmail: '' 
  };

  if (!raw) return defaults;

  try {
    const settings = JSON.parse(raw);
    // Migration: If the stored service ID is the old broken one, force the update to the new one
    if (settings.serviceId === 'service_m9n45oo') {
      const migrated = { ...settings, serviceId: 'service_8ivbdhg' };
      localStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return settings;
  } catch (e) {
    return defaults;
  }
};

export const saveEmailSettings = (settings: EmailSettings) => {
  localStorage.setItem(EMAIL_SETTINGS_KEY, JSON.stringify(settings));
};

// --- BASE PERSISTENCE ---
export const getSavedCart = (): CartItem[] => JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
export const persistCart = (cart: CartItem[]) => localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
export const getSavedSwatches = (): Fabric[] => JSON.parse(localStorage.getItem(SWATCHES_STORAGE_KEY) || '[]');
export const persistSwatches = (swatches: Fabric[]) => localStorage.setItem(SWATCHES_STORAGE_KEY, JSON.stringify(swatches));

// --- BLOG POSTS ---
export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase.from('blogs').select('*').order('date', { ascending: false });
  return error || !data ? [] : data;
};