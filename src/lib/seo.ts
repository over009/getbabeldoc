import { site } from '../config';

export function pageUrl(pathname: string): string {
  const base = site.url.replace(/\/$/, '');
  const pathOnly = pathname.split('?')[0] ?? '/';
  if (pathOnly === '/' || pathOnly === '') return `${base}/`;
  const withLeading = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
  const withSlash = withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  return `${base}${withSlash}`;
}

export function assetUrl(pathname: string): string {
  const base = site.url.replace(/\/$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: pageUrl(item.href),
    })),
  };
}

export function faqLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function webApplicationLd(tool: {
  name: string;
  description: string;
  slug: string;
  browserRequirements: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: pageUrl(`/tools/${tool.slug}/`),
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: tool.browserRequirements,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    isAccessibleForFree: true,
    description: tool.description,
  };
}

export function websiteLd(description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: pageUrl('/'),
    description,
    inLanguage: 'en',
  };
}

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: pageUrl('/'),
    logo: assetUrl(site.logoPath),
    email: site.contactEmail,
  };
}
