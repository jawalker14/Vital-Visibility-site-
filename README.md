# Vital Visibility static site

This site is a static multi-page app (MPA) built with Vite. Each page is a standalone HTML file. We intentionally use explicit `.html` links to avoid trailing-slash and extensionless routing ambiguity on Vercel.

## Linking convention
- Use absolute, explicit `.html` paths for internal navigation: `/index.html`, `/about.html`, `/services.html`, `/pricing.html`, `/contact.html`.
- For section pages inside `/services/`, link to their `.html` files, e.g. `/services/websites.html`.
- Avoid extensionless (`/about`) and trailing-slash (`/about/`) internal links.
- Canonical tags should point to the exact `.html` URL for pages that are `.html` files.

## Vercel config
We ship a minimal `vercel.json` to prevent redirect loops and map popular paths to the correct files via rewrites only:

```
{
  "cleanUrls": false,
  "trailingSlash": false,
  "redirects": [],
  "rewrites": [
    { "source": "/about", "destination": "/about.html" },
    { "source": "/about/", "destination": "/about.html" },
    { "source": "/pricing", "destination": "/pricing.html" },
    { "source": "/pricing/", "destination": "/pricing.html" },
    { "source": "/services", "destination": "/services.html" },
    { "source": "/services/", "destination": "/services.html" },
    { "source": "/contact", "destination": "/contact.html" },
    { "source": "/contact/", "destination": "/contact.html" },
    { "source": "/resources", "destination": "/resources/index.html" },
    { "source": "/resources/", "destination": "/resources/index.html" },
    { "source": "/services/websites", "destination": "/services/websites.html" },
    { "source": "/services/maintenance", "destination": "/services/maintenance.html" },
    { "source": "/services/google-ads", "destination": "/services/google-ads.html" },
    { "source": "/services/meta-ads", "destination": "/services/meta-ads.html" },
    { "source": "/services/meta-content", "destination": "/services/meta-content.html" },
    { "source": "/services/branding", "destination": "/services/branding.html" },
    { "source": "/services/logo", "destination": "/services/logo.html" }
  ]
}
```

## Local testing
- Dev server: `npm run preview` (Vite static preview) or `npx serve .`
- E2E sanity: `npm run test:e2e`
- Link audit: `npm run audit:links`

## Deployment
Push to the protected branch; Vercel will deploy. After deploy, test in Chrome DevTools → Network (Preserve log, Disable cache) that navigation to About/Services/Pricing/Contact have 200 HTML with no repeated 30x chains.
