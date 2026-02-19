/**
 * ANALYTICS ENGINE (Clean - No Elevar)
 * Sends all events to parent via postMessage → dataLayer → GTM
 */

import { CartItem, Fabric } from '../types';

let parentClientId: string | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    const allowedOrigins = ['https://worldwideshades.com', 'https://window-shades-store.myshopify.com'];
    if (!allowedOrigins.some(origin => event.origin.includes(origin.replace('https://', '')))) {
      return;
    }
    if (event.data.type === 'GA4_CLIENT_ID' && event.data.clientId) {
      parentClientId = event.data.clientId;
    }
  });
}

export const initAnalytics = () => {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source') || (document.referrer.includes('google') ? 'google' : 'direct');
  const medium = params.get('utm_medium') || 'none';
  const campaign = params.get('utm_campaign') || 'none';

  if (!sessionStorage.getItem('wws_session_id')) {
    const sessionId = `sess_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('wws_session_id', sessionId);
    sessionStorage.setItem('wws_source', source);
    sessionStorage.setItem('wws_medium', medium);
    sessionStorage.setItem('wws_campaign', campaign);

    trackEvent('page_view', {
      page_path: window.location.pathname,
      page_title: document.title
    });
  }
};

const isInIframe = (): boolean => {
  try { return window.self !== window.top; } catch (e) { return true; }
};

const getParentOrigin = (): string => {
  if (document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      if (referrerUrl.hostname.includes('worldwideshades.com') || 
          referrerUrl.hostname.includes('myshopify.com')) {
        return referrerUrl.origin;
      }
    } catch (e) {}
  }
  return 'https://worldwideshades.com';
};

const sendToParent = (eventName: string, properties: Record<string, any>) => {
  if (!isInIframe()) return;
  try {
    const parentOrigin = getParentOrigin();
    window.parent.postMessage({
      type: 'GTM_EVENT',
      event: eventName,
      data: properties
    }, parentOrigin);
  } catch (e) {
    console.warn('[Iframe] Could not send event to parent:', e);
  }
};

export const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
  const sessionId = sessionStorage.getItem('wws_session_id');
  const source = sessionStorage.getItem('wws_source') || 'direct';
  const medium = sessionStorage.getItem('wws_medium') || 'none';

  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    session_id: sessionId,
    traffic_source: source,
    traffic_medium: medium,
    ...(parentClientId && { parent_client_id: parentClientId }),
    ...properties
  };

  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.dataLayer = window.dataLayer || [];
    // @ts-ignore
    window.dataLayer.push(payload);

    // Send ALL events to parent - no filtering
    sendToParent(eventName, payload);
  }
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href
  });
};

export const trackEngagement = (action: string, details: Record<string, any> = {}) => {
  trackEvent('user_engagement', {
    engagement_action: action,
    ...details
  });
};