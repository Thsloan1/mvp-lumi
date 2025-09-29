// SEO optimization utilities
export class SEOOptimizer {
  // Dynamic meta tag management
  static updateMetaTags(data: {
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  }) {
    // Update title
    if (data.title) {
      document.title = data.title;
    }
    
    // Update meta description
    this.updateMetaTag('description', data.description);
    this.updateMetaTag('keywords', data.keywords);
    
    // Update Open Graph tags
    this.updateMetaTag('og:title', data.ogTitle, 'property');
    this.updateMetaTag('og:description', data.ogDescription, 'property');
    this.updateMetaTag('og:image', data.ogImage, 'property');
    
    // Update canonical URL
    if (data.canonicalUrl) {
      this.updateLinkTag('canonical', data.canonicalUrl);
    }
  }

  private static updateMetaTag(name: string, content?: string, attribute: string = 'name') {
    if (!content) return;
    
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  private static updateLinkTag(rel: string, href: string) {
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', rel);
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  // Structured data for rich snippets
  static addStructuredData(data: any) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // Add organization structured data
  static addOrganizationData() {
    const organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Human Potential Partners",
      "description": "AI-powered classroom behavior support for early childhood educators",
      "url": "https://lumi.app",
      "logo": "https://lumi.app/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "support@lumi.app"
      },
      "sameAs": [
        "https://linkedin.com/company/human-potential-partners",
        "https://twitter.com/lumiapp"
      ]
    };
    
    this.addStructuredData(organizationData);
  }

  // Add software application structured data
  static addSoftwareApplicationData() {
    const appData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Lumi: Classroom Behavior Coach",
      "description": "Real-time AI behavior coach for early childhood educators",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "297",
        "priceCurrency": "USD",
        "priceValidUntil": "2025-12-31"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "127"
      }
    };
    
    this.addStructuredData(appData);
  }
}