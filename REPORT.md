# Vital Visibility Production Hardening Report

## Summary of Changes
- Repo setup: Added package.json, lint/format/test/audit scripts, and devDependencies.
- Added vercel.json for redirects, headers, and caching.
- Created scripts/lighthouse.mjs for performance budgets.
- Added .env.example for required secrets.
- (Further sections will be updated as changes are made.)

## Metrics Before/After
| Metric        | Before | After |
|--------------|--------|-------|
| Performance  |   --   |   --  |
| Accessibility|   --   |   --  |
| Best Practices|  --   |   --  |
| SEO          |   --   |   --  |

## Known Trade-offs & Follow-ups
- Initial setup; further improvements will be tracked per section.

## How to Run
- Lint: `npm run lint`
- Format: `npm run format`
- E2E Tests: `npm run test:e2e`
- Lighthouse Audit: `npm run audit:lighthouse`

## Deployment Steps (Vercel)
- Push to main or open PR; CI will run lint, tests, and audits.
- Required env vars: see .env.example

---
(Sections will be expanded as work progresses.)

