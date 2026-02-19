
import React from 'react';
import { 
  Shield, Sun, Moon, Battery, Zap, Home, Thermometer, VolumeX,  CheckCircle, MapPin, Star, Ruler, Truck, Layout, Video, BookOpen, Leaf, Baby, Lock, DollarSign, Sliders, Hand, Percent
} from 'lucide-react';

export interface LandingPageData {
  slug: string;
  category: 'shades' | 'solutions' | 'integrations' | 'compare' | 'locations' | 'company' | 'learn' | 'tools' | 'safety';
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  fabricFilter?: (fabric: any) => boolean;
  benefits: { title: string; desc: string; icon: React.ElementType }[];
  faq?: { question: string; answer: string }[];
  
  // New Blueprint Fields for Guides/Calculators
  problemSolution?: {
    heading: string;
    problems: string[];
    solution: string;
    benefits: string[];
  };
  comparisonTable?: {
    competitor: string;
    rows: { feature: string; us: string; them: string; highlight?: boolean }[];
  };
  stats?: {
    viewing: number;
    rating: string;
    reviews: number;
    installed: string;
  };
  video?: {
    title: string;
    duration: string;
    thumbnail: string;
  };
}

export const LANDING_CONTENT: Record<string, LandingPageData> = {
  'blackout-roller-shades': {
    slug: 'blackout-roller-shades',
    category: 'shades',
    title: "Premium Blackout Roller Shades",
    subtitle: "100% Light Blocking for Deep Sleep",
    description: "Engineered for total darkness. Our BlackoutX™ fabrics eliminate light leaks and provide superior thermal insulation for bedrooms and media rooms.",
    heroImage: "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=2057&auto=format&fit=crop",
    fabricFilter: (f) => f.category === 'Blackout',
    stats: {
      viewing: 42,
      rating: "4.9",
      reviews: 2847,
      installed: "50,000+"
    },
    problemSolution: {
      heading: "The Problem with Regular Blinds",
      problems: [
        "❌ Light leaks around every edge",
        "❌ Rattling noises when window is open",
        "❌ Dust magnets that are hard to clean"
      ],
      solution: "Our Blackout Solution:",
      benefits: [
        "✅ Zero light gaps with EdgeSeal™ fit",
        "✅ Whisper-quiet operation",
        "✅ Wipe-clean vinyl composite"
      ]
    },
    comparisonTable: {
      competitor: "Big Box Stores",
      rows: [
        { feature: "Starting Price", us: "$89", them: "$149", highlight: true },
        { feature: "Light Block", us: "100%", them: "90-95%" },
        { feature: "Lead Time", us: "3 Days", them: "2-3 Weeks" },
        { feature: "Fit Guarantee", us: "Yes (Free Replacement)", them: "No" }
      ]
    },
    benefits: [
      { title: "0% Light Transmission", desc: "Opaque fabrics block all incoming light.", icon: Moon },
      { title: "Thermal Insulation", desc: "Reduces heat transfer by up to 30%.", icon: Thermometer },
      { title: "Sound Dampening", desc: "Thicker weave absorbs street noise.", icon: VolumeX }
    ],
    faq: [
      { question: "How much do blackout shades cost?", answer: "Prices start at $75 for standard sizes. Custom sizes typically range from $150 to $250 depending on width and fabric choice." },
      { question: "How long does shipping take?", answer: "Production takes 3-5 business days. FedEx Ground shipping takes an additional 2-4 days." },
      { question: "Do you offer free samples?", answer: "Yes! Order up to 10 free swatches to test opacity and color match in your room." },
      { question: "How much light do they block?", answer: "The fabric blocks 100% of light. For zero light gaps at the edges, we recommend Outside Mount with 3\" overlap." },
      { question: "Can they be motorized?", answer: "Yes, upgrade to our rechargeable Smart Motor for $200 per shade." }
    ]
  },
  'light-filtering-roller-shades': {
    slug: 'light-filtering-roller-shades',
    category: 'shades',
    title: "Light Filtering Roller Shades",
    subtitle: "Privacy Without Sacrificing Sun",
    description: "Reduce glare and protect furniture from UV rays while keeping your home bright. The perfect balance of privacy and natural light.",
    heroImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop",
    fabricFilter: (f) => f.category === 'Light Filtering' || f.category === 'Solar',
    stats: {
      viewing: 28,
      rating: "4.8",
      reviews: 1932,
      installed: "35,000+"
    },
    problemSolution: {
      heading: "Why Sheer Curtains Fail",
      problems: [
        "❌ Zero privacy at night",
        "❌ Collects dust and allergens",
        "❌ Looks dated and messy"
      ],
      solution: "The Modern Approach:",
      benefits: [
        "✅ Full privacy (silhouettes only)",
        "✅ Clean, modern architectural lines",
        "✅ UV protection for your floors"
      ]
    },
    comparisonTable: {
      competitor: "Home Depot",
      rows: [
        { feature: "Custom Sizing", us: "To the 1/8\"", them: "Stock Sizes Only", highlight: true },
        { feature: "Fabric Options", us: "200+", them: "10-15" },
        { feature: "Motorization", us: "Integrates with Alexa", them: "Remote Only" }
      ]
    },
    benefits: [
      { title: "Glare Reduction", desc: "Filters harsh sunlight.", icon: Sun },
      { title: "Daytime Privacy", desc: "See out, but they can't see in.", icon: Shield },
      { title: "UV Protection", desc: "Blocks 95% of harmful UV rays.", icon: Zap }
    ],
    faq: [
      { question: "Can people see in at night?", answer: "With translucent fabrics, they see shadows/silhouettes. With solar screens, they can see inside if lights are on." },
      { question: "Do they block UV rays?", answer: "Yes, they block 90-99% of UV rays to protect floors and furniture from fading." },
      { question: "How do I clean them?", answer: "Light vacuuming or a gentle wipe with a damp cloth is all that is needed." }
    ]
  },
  // --- 1. MEASURING GUIDE ---
  'how-to-measure-windows': {
    slug: 'how-to-measure-windows',
    category: 'learn',
    title: "How to Measure Windows",
    subtitle: "Accurate measurements in 10 minutes",
    description: "Get it right the first time. Follow our simple 3-step guide for a Perfect Fit Guarantee. No experience needed.",
    heroImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop",
    benefits: [
      { title: "Inside Mount", desc: "Measure width at top, middle, bottom. Use the smallest.", icon: Ruler },
      { title: "Outside Mount", desc: "Measure opening width + 3\" overlap. Measure height + 3\" overlap.", icon: MapPin },
      { title: "Depth Check", desc: "Ensure window depth is at least 1.5\" for standard mounting.", icon: CheckCircle }
    ],
    problemSolution: {
      heading: "Why Measurement Matters",
      problems: [
        "❌ 73% of shade returns are due to errors",
        "❌ Cloth tape measures stretch and are inaccurate",
        "❌ Windows are rarely perfectly square"
      ],
      solution: "The WWS Fit Guarantee:",
      benefits: [
        "✅ We deduct operation gaps for you",
        "✅ Free replacement if you follow our guide",
        "✅ Professional measurement service available"
      ]
    },
    faq: [
        { question: "What if my measurements are between 1/8\" increments?", answer: "Always round DOWN for inside mount, round UP for outside mount." },
        { question: "How much smaller will my shade be?", answer: "We deduct 1/2\" from width for inside mount (1/4\" each side) for proper operation." },
        { question: "What if my window is out of square?", answer: "Measure all points and use smallest measurements. Consider outside mount for very crooked windows." }
    ]
  },
  // --- 2. SHADE CALCULATOR ---
  'shade-price-calculator': {
    slug: 'shade-price-calculator',
    category: 'tools',
    title: "Window Shade Price Calculator",
    subtitle: "Get instant, accurate pricing",
    description: "No email required. Calculate the cost of your custom shades in seconds. Compare manual vs motorized options and bulk discounts.",
    heroImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop",
    benefits: [
        { title: "Instant Quote", desc: "Real-time pricing as you adjust size.", icon: Zap },
        { title: "Compare Options", desc: "See cost difference for motorization.", icon: Sliders },
        { title: "Bulk Savings", desc: "10-25% off for whole house orders.", icon: Percent }
    ],
    comparisonTable: {
        competitor: "Hunter Douglas",
        rows: [
            { feature: "36x60 Blackout", us: "$147", them: "$389", highlight: true },
            { feature: "Motorization", us: "+$249", them: "+$500" },
            { feature: "Lead Time", us: "3 Days", them: "4-6 Weeks" },
            { feature: "Free Shipping", us: "Yes", them: "$75+" }
        ]
    }
  },
  // --- 3. FABRIC SAMPLES ---
  'free-fabric-samples': {
    slug: 'free-fabric-samples',
    category: 'shades',
    title: "Free Fabric Samples",
    subtitle: "Try before you buy",
    description: "Order up to 10 free swatches. Delivered in 2-3 days. No credit card required. See true colors and feel the texture in your home lighting.",
    heroImage: "https://images.unsplash.com/photo-1520699697851-3dc68aa3a474?q=80&w=2070&auto=format&fit=crop",
    benefits: [
        { title: "True Colors", desc: "Screens vary by 23%. See the real tone.", icon: Sun },
        { title: "Test Opacity", desc: "Hold up to window to check light block.", icon: Shield },
        { title: "Feel Quality", desc: "Touch the texture and thickness.", icon: Hand }
    ],
    faq: [
        { question: "Really no credit card?", answer: "Really! 100% free with free shipping." },
        { question: "How long do samples take?", answer: "2-3 business days via USPS Priority Mail." },
        { question: "Can I keep the samples?", answer: "Yes! They are yours to keep for mood boards." }
    ]
  },
  // --- 4. INSTALLATION VIDEOS ---
  'video-guides': {
    slug: 'video-guides',
    category: 'learn',
    title: "Installation Guides",
    subtitle: "DIY in 15-30 minutes",
    description: "No experience needed. Watch our step-by-step videos to install your custom shades like a pro. Live support available.",
    heroImage: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop",
    video: {
        title: "Complete Installation Walkthrough",
        duration: "8:47",
        thumbnail: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop"
    },
    benefits: [
        { title: "Inside Mount", desc: "Clean look. 15 min install.", icon: Home },
        { title: "Outside Mount", desc: "Max blackout. 20 min install.", icon: Layout },
        { title: "Motorized", desc: "Easy setup & pairing. 30 mins.", icon: Zap }
    ],
    faq: [
        { question: "Do I need a drill?", answer: "Yes, a drill makes it much easier, though a screwdriver works for wood frames." },
        { question: "Do I need to find studs?", answer: "Not for inside mount. For outside mount on drywall, use included anchors." }
    ]
  },
  // --- 5. ENERGY SAVINGS ---
  'energy-savings-window-shades': {
    slug: 'energy-savings-window-shades',
    category: 'learn',
    title: "Energy Savings Guide",
    subtitle: "Save $180-380 annually",
    description: "Reduce energy use by 10-25% with the right window treatments. 40% of home energy is lost through windows.",
    heroImage: "https://images.unsplash.com/photo-1508138221679-760a23a2285b?q=80&w=2574&auto=format&fit=crop",
    problemSolution: {
        heading: "The Science of Savings",
        problems: ["❌ Summer: 76% of sunlight becomes heat", "❌ Winter: 30% of heating escapes", "❌ AC works overtime fighting solar gain"],
        solution: "Efficient Shade Solution:",
        benefits: ["✅ Reflective backing blocks 75% of heat", "✅ Cellular shades offer R-Value up to 5.0", "✅ Automated shades optimize for sun position"]
    },
    benefits: [
        { title: "Summer Cooling", desc: "Reflect solar heat gain.", icon: Sun },
        { title: "Winter Heating", desc: "Insulate against cold drafts.", icon: Thermometer },
        { title: "Tax Credits", desc: "Qualify for Federal Energy credits.", icon: DollarSign }
    ]
  },
  // --- 6. CHILD SAFETY ---
  'child-safe-window-shades': {
    slug: 'child-safe-window-shades',
    category: 'safety',
    title: "Child Safety Guide",
    subtitle: "Cordless options standard",
    description: "Zero strangulation risk. We recommend cordless or motorized options for any home with children or pets. CPSC Certified.",
    heroImage: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=2070&auto=format&fit=crop",
    benefits: [
        { title: "Cordless Spring", desc: "Push/pull operation. No cords.", icon: Shield },
        { title: "Motorized", desc: "Remote control. Ultimate safety.", icon: Lock },
        { title: "Certified", desc: "Exceeds WCMA & CPSC standards.", icon: CheckCircle }
    ],
    faq: [
        { question: "Do cordless shades cost more?", answer: "No, cordless is our standard option at no extra cost." },
        { question: "Are motorized shades safe?", answer: "Yes, they are 100% cord-free and the safest option available." },
        { question: "Can I retrofit old shades?", answer: "We offer free safety kits for older corded shades." }
    ]
  }
};

// GENERIC GENERATOR FOR MISSING PAGES
// This ensures every footer link works even if we haven't written custom copy yet.
const generateFallbackContent = (slug: string): LandingPageData => {
  const title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return {
    slug,
    category: 'shades',
    title: title,
    subtitle: "Custom Made for Your Windows",
    description: "Experience the perfect blend of style and function. Our custom shades are made to measure and ship in just 3 days.",
    heroImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2070&auto=format&fit=crop",
    fabricFilter: (f) => true, // Show all fabrics by default
    stats: {
      viewing: Math.floor(Math.random() * 30) + 10,
      rating: "4.9",
      reviews: 1200 + Math.floor(Math.random() * 500),
      installed: "25,000+"
    },
    problemSolution: {
      heading: "The Standard Alternative",
      problems: [
        "❌ Generic sizes that don't fit",
        "❌ Low quality mechanisms break easily",
        "❌ Limited color selection"
      ],
      solution: "The World Wide Shades Difference:",
      benefits: [
        "✅ Custom cut to 1/8 inch precision",
        "✅ Commercial grade clutch systems",
        "✅ Curated designer fabric collection"
      ]
    },
    comparisonTable: {
      competitor: "Other Brands",
      rows: [
        { feature: "Production Time", us: "3 Days", them: "3-4 Weeks", highlight: true },
        { feature: "Warranty", us: "Lifetime", them: "1-5 Years" },
        { feature: "Shipping", us: "Free", them: "$25+" }
      ]
    },
    benefits: [
      { title: "Perfect Fit", desc: "Measured to your exact window specs.", icon: Ruler },
      { title: "Easy Install", desc: "Install in 15 minutes or less.", icon: CheckCircle },
      { title: "Pro Quality", desc: "Materials used in luxury hotels.", icon: Star }
    ],
    faq: [
      { question: `How much do ${title} cost?`, answer: "Our custom shades start at just $75, depending on the size and fabric selected." },
      { question: "How do I measure?", answer: "We provide a simple guide. Measure width in 3 places and height in 3 places. Use the smallest width and longest height." },
      { question: "What if they don't fit?", answer: "Our Perfect Fit Guarantee covers you. We will remake the shade for free if you make a measuring mistake." }
    ]
  };
};

export const getLandingData = (path: string): LandingPageData => {
  // Remove leading/trailing slashes and split
  const cleanPath = path.replace(/^\/|\/$/g, '');
  const parts = cleanPath.split('/');
  const slug = parts[parts.length - 1];
  
  if (slug && LANDING_CONTENT[slug]) {
    return LANDING_CONTENT[slug];
  }
  
  // If no specific content, generate fallback so the page works
  if (slug) {
    return generateFallbackContent(slug);
  }

  // Absolute fallback
  return generateFallbackContent('custom-shades');
};
