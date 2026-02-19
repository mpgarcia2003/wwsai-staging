export interface Fabric {
  id: string;
  name: string;
  description: string;
  category: 'Blackout' | 'Light Filtering';
  tone: 'light' | 'dark' | 'neutral';
  cloudinaryId: string;
  priceGroup: string;
  features: string[];
  rgb: { r: number, g: number, b: number };
  // Analytics Fields
  sku?: string;
  shopifyId?: string; // The Variant ID in Shopify
  shopifyProductId?: string; // The Product ID in Shopify
}

export interface RoomAnalysis {
  style: string;
  lighting: 'Bright' | 'Average' | 'Dim';
  suggestedTone: 'light' | 'neutral' | 'dark';
  suggestedColorFamily: string;
  reasoning: string;
}

export interface Installer {
  id: string;
  name: string;
  location: string;
  experienceYears: number;
  rating: number;
  reviews: number;
  fees: {
    measure: number;
    installPerUnit: number;
    minimum: number;
  };
}

export type ShapeType = 
  | 'Standard' 
  | 'Right Triangle (Left)' 
  | 'Right Triangle (Right)' 
  | 'Acute Triangle' 
  | 'Trapezoid Left' 
  | 'Trapezoid Right' 
  | 'Flat Top Trapezoid Right' 
  | 'Flat Top Trapezoid Left'
  | 'Pentagon'
  | 'Flat Top Hexagon';

export interface ShadeConfig {
  step: number;
  shape: ShapeType;
  shadeType: string;
  material: Fabric | null;
  mountType: string;
  width: number;
  widthFraction: string;
  height: number;
  heightFraction: string;
  customDims?: Record<string, number>;
  customFracs?: Record<string, string>;
  controlType: string;
  motorPower?: 'Rechargeable' | 'Hardwired';
  motorizedController: boolean;
  motorizedHub: boolean;
  motorizedCharger: boolean;
  sunSensor: boolean;
  quantity: number;
  zipCode: string;
  installer: Installer | null;
  measureService: boolean;
  installService: boolean;
  isMeasurementOnly?: boolean;
  controlPosition: string;
  rollType: string;
  bottomBar: string;
  valanceType: 'standard' | 'reverse' | 'cassette' | 'fascia';
  sideChannelType: 'none' | 'standard';
}

export interface WindowSelection {
  x: number;
  y: number;
  w: number;
  h: number;
  points?: { x: number; y: number }[];
}

export interface CartItem {
  id: string;
  config: ShadeConfig;
  unitPrice: number;
  installerFee: number;
  totalPrice: number;
  timestamp: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'flat';
  value: number;
  isActive: boolean;
}

export interface EmailSettings {
  serviceId: string;
  publicKey: string;
  adminTemplateId: string;
  customerTemplateId: string;
  adminEmail: string;
}

export type OrderStatus = 'Received' | 'Started' | 'Finished' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  items: CartItem[];
  swatches: Fabric[];
  customizations: Record<string, any>;
  total: number;
  discount?: {
    code: string;
    amount: number;
  };
  deliveryNotes?: string;
  referralSource?: string;
  isCommercial?: boolean;
  appointmentSlots?: string[];
  status: OrderStatus;
  date: string;
  paymentMethod: string;
}

export interface Message {
  id: string;
  type: 'contact' | 'chat' | 'quote';
  name: string;
  email: string;
  phone?: string;
  content: string;
  status: 'unread' | 'read' | 'replied';
  timestamp: number;
}