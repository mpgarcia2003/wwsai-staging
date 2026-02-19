// elevar-parent-listener.js
// Add this to Shopify theme.liquid or as a custom snippet
// Purpose: Receives Elevar-formatted events from the Custom Shade Builder iframe
// and pushes them to the Elevar Data Layer on the parent Shopify page.

(function() {
  var ALLOWED_ORIGINS = [
    'https://customshadebuilder.com',
    'https://builder.worldwideshades.com',
    'https://wwsai.vercel.app'
  ];
  
  window.addEventListener('message', function(event) {
    // Security: only accept from our builder domain (or localhost for testing if needed)
    if (ALLOWED_ORIGINS.indexOf(event.origin) === -1) return;
    
    var msg = event.data;
    if (!msg || msg.type !== 'GTM_EVENT') return;
    
    // The 'data' field contains the full Elevar-formatted payload
    var elevarPayload = msg.data;
    if (!elevarPayload || !elevarPayload.event) return;
    
    // Only forward recognized Elevar events
    var allowedEvents = ['dl_user_data', 'dl_view_item', 'dl_customize_item', 'dl_add_to_cart', 'dl_begin_checkout', 'dl_remove_from_cart'];
    if (allowedEvents.indexOf(elevarPayload.event) === -1) return;
    
    // Push to Elevar Data Layer
    window.ElevarDataLayer = window.ElevarDataLayer || [];
    window.ElevarDataLayer.push(elevarPayload);
    
    console.log('[Elevar Parent] Pushed:', elevarPayload.event);
  });
})();