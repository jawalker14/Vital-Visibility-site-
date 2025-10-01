import { defineConfig } from 'vite';
import { resolve } from 'path';

// Configure Vite to build a multi-page static site.
// Each HTML page is an entry so it gets emitted to dist/.
export default defineConfig({
  // Treat this as a Multi-Page App so unknown routes return 404 instead of falling back to index.html
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        contactSuccess: resolve(__dirname, 'contact-success.html'),
  // Use directory index pages for primary sections
  aboutIndex: resolve(__dirname, 'about/index.html'),
  contactIndex: resolve(__dirname, 'contact/index.html'),
  pricingIndex: resolve(__dirname, 'pricing/index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        servicesIndex: resolve(__dirname, 'services/index.html'),
        servicesWebsites: resolve(__dirname, 'services/websites.html'),
        servicesMaintenance: resolve(__dirname, 'services/maintenance.html'),
        servicesGoogleAds: resolve(__dirname, 'services/google-ads.html'),
        servicesMetaAds: resolve(__dirname, 'services/meta-ads.html'),
        servicesMetaContent: resolve(__dirname, 'services/meta-content.html'),
        servicesBranding: resolve(__dirname, 'services/branding.html'),
        servicesLogo: resolve(__dirname, 'services/logo.html'),
        resourcesIndex: resolve(__dirname, 'resources/index.html'),
        notFound: resolve(__dirname, '404.html'),
        maintenance: resolve(__dirname, 'maintenance.html'),
      },
    },
  },
});

