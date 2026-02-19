
import React, { useEffect } from 'react';
import { COMPANY_NAME } from '../constants';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  schema?: Record<string, any>;
  canonicalUrl?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  image = "https://res.cloudinary.com/dcmlcfynd/image/upload/v1763601993/a-a-stylishly-modern-living-room-249b2d17-7a92-4780-bb3f-8de51e7ae658_omzhlk.webp", 
  type = 'website',
  schema,
  canonicalUrl
}) => {
  const siteTitle = `${title} | ${COMPANY_NAME}`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    // Update Title
    document.title = siteTitle;

    // Update Meta Tags
    const setMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const setOg = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard SEO
    setMeta('description', description);
    
    // OpenGraph (Facebook, LinkedIn, iMessage)
    setOg('og:title', siteTitle);
    setOg('og:description', description);
    setOg('og:image', image);
    setOg('og:type', type);
    setOg('og:url', canonicalUrl || currentUrl);
    setOg('og:site_name', COMPANY_NAME);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', siteTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

  }, [siteTitle, description, image, type, canonicalUrl, currentUrl]);

  // JSON-LD Injection for LLMs/Google
  // This allows ChatGPT/Gemini to "read" the entity data directly
  useEffect(() => {
    if (schema) {
      let script = document.getElementById('json-ld-schema');
      if (!script) {
        script = document.createElement('script');
        script.id = 'json-ld-schema';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }
  }, [schema]);

  return null;
};

export default SEO;
