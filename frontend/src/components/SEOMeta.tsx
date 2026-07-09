import { useEffect } from 'react';

interface SEOMetaProps {
  title: string;
  description: string;
  canonical: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  faqList?: Array<{ question: string; answer: string }>;
  breadcrumbs?: Array<{ name: string; item: string }>;
  pageType?: 'article' | 'product' | 'howto' | 'webpage';
  authorName?: string;
  authorRole?: string;
  datePublished?: string;
  dateModified?: string;
  steps?: Array<{ name: string; text: string }>;
  price?: string;
  priceCurrency?: string;
}

export function SEOMeta({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = 'https://ekam-woad.vercel.app/apple-touch-icon.png',
  noindex = false,
  faqList,
  breadcrumbs,
  pageType = 'webpage',
  authorName,
  authorRole,
  datePublished,
  dateModified,
  steps,
  price,
  priceCurrency
}: SEOMetaProps) {
  useEffect(() => {
    // 1. Title (Requirement: 30-60 characters, primary keyword first 30 chars)
    document.title = title;

    // 2. Meta Description (Requirement: 120-160 characters)
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonical);

    // 4. Open Graph Tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:url': canonical,
      'og:image': ogImage,
      'og:type': ogType,
      'og:site_name': 'Ekam'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // 5. Twitter Card Tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': ogImage
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // 6. Robots Meta
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

    // 7. Theme Color
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', '#4d8eff');

    // 8. JSON-LD Structured Data Graph
    const organizationId = "https://ekam-woad.vercel.app/#organization";
    const websiteId = "https://ekam-woad.vercel.app/#website";
    const authorId = authorName
      ? `https://ekam-woad.vercel.app/#author-${authorName.toLowerCase().replace(/\s+/g, '-')}`
      : organizationId;

    const graph: any[] = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": organizationId,
        "name": "Ekam",
        "url": "https://ekam-woad.vercel.app",
        "logo": {
          "@type": "ImageObject",
          "url": "https://ekam-woad.vercel.app/apple-touch-icon.png",
          "width": "180",
          "height": "180"
        },
        "email": "support@ekam-chat.com",
        "telephone": "+1-800-555-EKAM",
        "foundingDate": "2026-01-01",
        "sameAs": [
          "https://github.com/Kkushak16/Ekam",
          "https://x.com/EkamChat",
          "https://www.linkedin.com/company/ekam-chat"
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": websiteId,
        "url": "https://ekam-woad.vercel.app",
        "name": "Ekam",
        "description": "Secure Real-Time Messaging Workspace",
        "publisher": {
          "@id": organizationId
        },
        "datePublished": "2026-06-20T08:00:00Z",
        "dateModified": dateModified || "2026-07-09T03:00:00Z"
      },
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonical}/#webpage`,
        "url": canonical,
        "name": title,
        "isPartOf": {
          "@id": websiteId
        },
        "description": description,
        "datePublished": datePublished || "2026-07-09T00:00:00Z",
        "dateModified": dateModified || "2026-07-09T03:00:00Z",
        "publisher": {
          "@id": organizationId
        }
      }
    ];

    // Person Author schema if applicable
    if (authorName) {
      graph.push({
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": authorId,
        "name": authorName,
        "jobTitle": authorRole || "Contributor",
        "worksFor": {
          "@id": organizationId
        },
        "sameAs": [
          "https://github.com/Kkushak16"
        ]
      });
    }

    if (breadcrumbs && breadcrumbs.length > 0) {
      graph.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "@id": `${canonical}/#breadcrumb`,
        "itemListElement": breadcrumbs.map((b, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": b.name,
          "item": b.item
        }))
      });
    }

    if (faqList && faqList.length > 0) {
      graph.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${canonical}/#faq`,
        "mainEntity": faqList.map(f => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      });
    }

    if (pageType === 'article') {
      graph.push({
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${canonical}/#article`,
        "isPartOf": {
          "@id": `${canonical}/#webpage`
        },
        "headline": title,
        "description": description,
        "image": ogImage,
        "datePublished": datePublished || "2026-07-09T00:00:00Z",
        "dateModified": dateModified || "2026-07-09T03:00:00Z",
        "publisher": {
          "@id": organizationId
        },
        "author": {
          "@id": authorId
        }
      });
    }

    if (pageType === 'product') {
      graph.push({
        "@context": "https://schema.org",
        "@type": ["Product", "SoftwareApplication"],
        "@id": `${canonical}/#product`,
        "name": "Ekam Chat Platform",
        "description": description,
        "image": ogImage,
        "applicationCategory": "CommunicationApplication",
        "operatingSystem": "Web, Windows, macOS, Linux, iOS, Android",
        "softwareVersion": "1.2.0",
        "offers": {
          "@type": "Offer",
          "price": price || "0.00",
          "priceCurrency": priceCurrency || "USD",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@id": organizationId
          }
        },
        "brand": {
          "@type": "Brand",
          "name": "Ekam"
        }
      });
    }

    if (pageType === 'howto' && steps && steps.length > 0) {
      graph.push({
        "@context": "https://schema.org",
        "@type": "HowTo",
        "@id": `${canonical}/#howto`,
        "name": title,
        "description": description,
        "image": ogImage,
        "publisher": {
          "@id": organizationId
        },
        "datePublished": datePublished || "2026-07-09T00:00:00Z",
        "dateModified": dateModified || "2026-07-09T03:00:00Z",
        "step": steps.map((s, idx) => ({
          "@type": "HowToStep",
          "position": idx + 1,
          "name": s.name,
          "text": s.text,
          "url": `${canonical}/#step-${idx + 1}`
        }))
      });
    }

    // Embed JSON-LD script
    let scriptLd = document.querySelector('script[id="jsonld-structured-data"]');
    if (!scriptLd) {
      scriptLd = document.createElement('script');
      scriptLd.setAttribute('id', 'jsonld-structured-data');
      scriptLd.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptLd);
    }
    scriptLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graph
    });

  }, [title, description, canonical, ogType, ogImage, noindex, faqList, breadcrumbs, pageType, authorName, authorRole, datePublished, dateModified, steps, price, priceCurrency]);

  return null;
}
export default SEOMeta;
