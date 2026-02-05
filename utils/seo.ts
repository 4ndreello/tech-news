export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
}

export const DEFAULT_SEO: SEOMetadata = {
  title: 'TechNews - Notícias de Tecnologia em Tempo Real',
  description:
    'Agregador de notícias de tecnologia do Hacker News, TabNews, Dev.to, Lobsters e Twitter. Fique por dentro das últimas novidades em programação, desenvolvimento web e tecnologia.',
  keywords: [
    'tecnologia',
    'programação',
    'desenvolvimento',
    'hacker news',
    'tabnews',
    'dev.to',
    'notícias tech',
    'agregador de notícias',
    'web development',
    'software engineering',
  ],
  ogImage: 'https://technews.example.com/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  canonicalUrl: 'https://technews.example.com',
};

export function generateMetaTags(metadata: Partial<SEOMetadata> = {}): string {
  const seo = { ...DEFAULT_SEO, ...metadata };

  const tags: string[] = [
    `<title>${seo.title}</title>`,
    `<meta name="description" content="${seo.description}" />`,
  ];

  if (seo.keywords && seo.keywords.length > 0) {
    tags.push(`<meta name="keywords" content="${seo.keywords.join(', ')}" />`);
  }

  // Open Graph tags
  tags.push(`<meta property="og:title" content="${seo.title}" />`);
  tags.push(`<meta property="og:description" content="${seo.description}" />`);
  tags.push(`<meta property="og:type" content="${seo.ogType}" />`);

  if (seo.ogImage) {
    tags.push(`<meta property="og:image" content="${seo.ogImage}" />`);
  }

  if (seo.canonicalUrl) {
    tags.push(`<meta property="og:url" content="${seo.canonicalUrl}" />`);
    tags.push(`<link rel="canonical" href="${seo.canonicalUrl}" />`);
  }

  // Twitter Card tags
  tags.push(`<meta name="twitter:card" content="${seo.twitterCard}" />`);
  tags.push(`<meta name="twitter:title" content="${seo.title}" />`);
  tags.push(`<meta name="twitter:description" content="${seo.description}" />`);

  if (seo.ogImage) {
    tags.push(`<meta name="twitter:image" content="${seo.ogImage}" />`);
  }

  return tags.join('\n    ');
}

export function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TechNews',
    description: DEFAULT_SEO.description,
    url: DEFAULT_SEO.canonicalUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${DEFAULT_SEO.canonicalUrl}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechNews',
      url: DEFAULT_SEO.canonicalUrl,
    },
  };
}

export function updateDocumentMeta(metadata: Partial<SEOMetadata> = {}) {
  const seo = { ...DEFAULT_SEO, ...metadata };

  // Update title
  document.title = seo.title;

  // Update or create meta tags
  updateMetaTag('description', seo.description);

  if (seo.keywords && seo.keywords.length > 0) {
    updateMetaTag('keywords', seo.keywords.join(', '));
  }

  // Open Graph
  updateMetaTag('og:title', seo.title, 'property');
  updateMetaTag('og:description', seo.description, 'property');
  updateMetaTag('og:type', seo.ogType || 'website', 'property');

  if (seo.ogImage) {
    updateMetaTag('og:image', seo.ogImage, 'property');
  }

  if (seo.canonicalUrl) {
    updateMetaTag('og:url', seo.canonicalUrl, 'property');
    updateCanonicalLink(seo.canonicalUrl);
  }

  // Twitter Card
  updateMetaTag('twitter:card', seo.twitterCard || 'summary_large_image');
  updateMetaTag('twitter:title', seo.title);
  updateMetaTag('twitter:description', seo.description);

  if (seo.ogImage) {
    updateMetaTag('twitter:image', seo.ogImage);
  }
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function updateCanonicalLink(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = url;
}
