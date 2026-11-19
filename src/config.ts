function readEnv(name: 'PUBLIC_GA_MEASUREMENT_ID' | 'PUBLIC_GSC_VERIFICATION'): string {
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
  gaMeasurementId: readEnv('PUBLIC_GA_MEASUREMENT_ID'),
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
