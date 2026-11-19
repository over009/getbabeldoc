function readEnv(name: 'PUBLIC_GSC_VERIFICATION'): string {
  const value = import.meta.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

export const site = {
  name: 'BabelDoc',
  url: 'https://getbabeldoc.com',
  tagline: 'Everyday tools, made simple.',
  locale: 'en_US',
  language: 'en',
  contactEmail: 'hello@getbabeldoc.com',
  // Committed ID so Workers Builds emits gtag without a build variable.
  gaMeasurementId: 'G-G85NF5TB16',
  // DNS already verifies Search Console. Leave this empty.
  gscVerification: readEnv('PUBLIC_GSC_VERIFICATION'),
  /**
   * Reserved ad slots stay hidden until this is turned on.
   * Their min-height rules are already in CSS so enabling them does not jump the page.
   */
  adsEnabled: false,
  ogImagePath: '/og/default.png',
  ogImageAlt: 'BabelDoc — Everyday tools, made simple.',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  logoPath: '/logo.png',
} as const;

export const GSC_PLACEHOLDER = 'GSC_VERIFICATION_PLACEHOLDER';
