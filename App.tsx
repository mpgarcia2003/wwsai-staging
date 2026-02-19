import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Builder from './pages/Builder';
import Admin from './pages/Admin';
import CheckoutDrawer from './components/CheckoutDrawer';
import { CartItem, Fabric } from './types';
import { initAnalytics, trackEvent } from './utils/analytics';
import { getSavedCart, persistCart, getSavedSwatches, persistSwatches, loadSharedCart } from './utils/storage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'builder' | 'admin'>('builder');
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return getSavedCart(); } catch(e) { return []; }
  });
  const [swatches, setSwatches] = useState<Fabric[]>(() => {
    try { return getSavedSwatches(); } catch(e) { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    // Initialize session and first tracking event
    initAnalytics();

     
    // --- CHECKOUT RETURN LOGIC ---
    // Detects if the user returned from Shopify with a success flag
    const urlParams = new URLSearchParams(window.location.search);
    const shouldClearCart = urlParams.get('clear_cart') === 'true' || urlParams.get('status') === 'success';

    if (shouldClearCart) {
      setCart([]); // Clear the state, which triggers persistCart to clear localStorage
      trackEvent('checkout_success_return', { source: 'shopify' });
      
      // Remove the query param from the URL so it doesn't trigger again on refresh
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.includes('/admin')) {
        setCurrentPage('admin');
      } else {
        setCurrentPage('builder');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);

    // --- SHARED CART CHECK ---
    const cartId = urlParams.get('cart');
    
    if (cartId) {
      loadSharedCart(cartId).then(data => {
        if (data) {
          setCart(data.cart);
          setSwatches(data.swatches);
          window.history.replaceState({}, '', window.location.pathname);
          setIsCartOpen(true);
          trackEvent('cart_shared_load', { cart_id: cartId });
        }
      });
    }

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => { persistCart(cart); }, [cart]);
  useEffect(() => { persistSwatches(swatches); }, [swatches]);

  const navigate = (page: string) => {
    const target = page === 'admin' ? 'admin' : 'builder';
    setCurrentPage(target);
    const url = target === 'admin' ? '/admin' : '/';
    try { window.history.pushState({}, '', url); } catch (e) {}
    window.scrollTo(0, 0);
    trackEvent('page_view', { page_path: url });

      };

  const addToCart = (item: CartItem) => {
    setCart(prev => [...prev, item]);
    setIsCartOpen(true);
    trackEvent('add_to_cart', { 
      currency: 'USD', 
      value: item.totalPrice,
      items: [{
        item_id: item.config.material?.id || 'custom-shade',
        item_name: item.config.material?.name || 'Custom Shade',
        price: item.unitPrice,
        quantity: item.config.quantity,
        fabric: item.config.material?.name || 'Unknown',
        shape: item.config.shape,
        shade_type: item.config.shadeType,
        control_type: item.config.controlType,
        mount_type: item.config.mountType
      }]
  });
};

  const addToSwatches = (fabric: Fabric) => {
    setSwatches(prev => {
      const exists = prev.find(s => s.id === fabric.id);
      if (!exists) {
        trackEvent('add_to_swatches', { fabric_id: fabric.id });
        
               
        return [...prev, fabric];
      }
      return prev;
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      
      trackEvent('remove_from_cart', { 
        currency: 'USD',
        value: item.totalPrice,
        items: [{
          item_id: item.config.material?.id || 'custom-shade',
          item_name: item.config.material?.name || 'Custom Shade',
          price: item.unitPrice,
          quantity: item.config.quantity,
          fabric: item.config.material?.name || 'Unknown',
          shape: item.config.shape,
          shade_type: item.config.shadeType,
          control_type: item.config.controlType,
          mount_type: item.config.mountType
        }]
      });
    }
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const removeSwatch = (id: string) => {
    setSwatches(prev => prev.filter(s => s.id !== id));
  };

  const updateCartItem = (id: string, updates: Partial<CartItem>) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleBeginCheckout = () => {
      // begin_checkout now handled by Shopify Customer Events pixel
  };

  return (
    <Layout 
      cartCount={cart.length} 
      swatchCount={swatches.length}
      onOpenCart={() => setIsCartOpen(true)}
      onOpenSwatches={() => setIsCartOpen(true)}
      currentPage={currentPage}
      onNavigate={navigate}
    >
      {currentPage === 'builder' ? (
         <div className="h-full w-full overflow-hidden">
            <Builder addToCart={addToCart} addToSwatches={addToSwatches} swatches={swatches} />
         </div>
      ) : (
        <Admin onNavigate={navigate} />
      )}

      <CheckoutDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        swatches={swatches}
        onRemoveItem={removeFromCart}
        onRemoveSwatch={removeSwatch}
        onUpdateItem={updateCartItem}
        onClearCart={() => setCart([])}
        onClearSwatches={() => setSwatches([])}
        onNavigate={navigate}
        onCheckout={handleBeginCheckout}
      />
    </Layout>
  );
};

export default App;