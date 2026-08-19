import React, { useEffect } from 'react';
import { Product } from '../types';

interface SEOHeadProps {
  product?: Product | null;
  category?: string | null;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ product, category }) => {
  useEffect(() => {
    if (product) {
      document.title = `${product.title} — Elite Fashion Hub Australia`;

      // Update OpenGraph meta tags dynamically
      const updateMeta = (prop: string, content: string) => {
        let el = document.querySelector(`meta[property="${prop}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute('property', prop);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      updateMeta('og:title', `${product.title} | Elite Fashion Hub High Fashion`);
      updateMeta('og:description', product.description.slice(0, 160));
      if (product.images?.[0]?.src) {
        updateMeta('og:image', product.images[0].src);
      }
      updateMeta('og:price:amount', product.price.toString());
      updateMeta('og:price:currency', 'AUD');

      // Inject / Update Product JSON-LD schema
      let script = document.getElementById('product-jsonld') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = 'product-jsonld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }

      const productSchema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.title,
        image: product.images.map((img) => img.src),
        description: product.description,
        sku: product.sku,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'Elite Fashion Hub',
        },
        offers: {
          '@type': 'Offer',
          url: window.location.href,
          priceCurrency: 'AUD',
          price: product.price,
          availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'Elite Fashion Hub',
          },
        },
      };
      script.textContent = JSON.stringify(productSchema);
    } else if (category) {
      document.title = `${category} Collection — Elite Fashion Hub`;
    } else {
      document.title = 'Elite Fashion Hub — High Fashion & Luxury Atelier';
    }
  }, [product, category]);

  return null;
};
