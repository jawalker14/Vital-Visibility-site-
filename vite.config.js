import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// Configure Vite to build a multi-page static site.
// Each HTML page is an entry so it gets emitted to dist/.
export default defineConfig({
  appType: 'mpa',
  plugins: [
    {
      name: 'custom-404-handler',
      configurePreviewServer(server) {
        // Add a fallback handler for 404 errors
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          
          // Skip if this is a request for existing static files or API routes
          if (url.startsWith('/css/') || url.startsWith('/js/') || url.startsWith('/images/') || 
              url.startsWith('/api/') || url.includes('.') || url === '/') {
            return next();
          }
          
          // Check if this is a known route that has a corresponding HTML file
          const knownRoutes = [
            '/about', '/contact', '/pricing', '/privacy', '/terms', 
            '/services', '/contact-success', '/404'
          ];
          
          if (knownRoutes.some(route => url.startsWith(route))) {
            return next();
          }
          
          // This is likely a 404 - serve the 404.html content with 404 status
          const notFoundPath = path.resolve(__dirname, 'dist/404.html');
          if (fs.existsSync(notFoundPath)) {
            const content = fs.readFileSync(notFoundPath, 'utf-8');
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            res.end(content);
            return;
          }
          
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        contact: resolve(__dirname, 'contact.html'),
        contactSuccess: resolve(__dirname, 'contact-success.html'),
        pricing: resolve(__dirname, 'pricing.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        servicesRoot: resolve(__dirname, 'services.html'),
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

