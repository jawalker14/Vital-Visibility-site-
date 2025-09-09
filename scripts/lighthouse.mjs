#!/usr/bin/env node
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { execSync } from 'child_process';

// Config: simple performance budgets
const budgets = {
  performance: 90,
  accessibility: 95,
  'best-practices': 95,
  seo: 95,
  lcp: 2500,
  cls: 0.1,
  tti: 3000,
  inp: 200
};

function runLighthouse(url) {
  const result = JSON.parse(execSync(`npx lighthouse ${url} --output=json --quiet`).toString());
  const scores = {
    performance: Math.round(result.categories.performance.score * 100),
    accessibility: Math.round(result.categories.accessibility.score * 100),
    'best-practices': Math.round(result.categories['best-practices'].score * 100),
    seo: Math.round(result.categories.seo.score * 100),
    lcp: result.audits['largest-contentful-paint'].numericValue,
    cls: result.audits['cumulative-layout-shift'].numericValue,
    tti: result.audits['interactive'].numericValue,
    inp: result.audits['experimental-interaction-to-next-paint']?.numericValue || 0
  };
  let failed = false;
  for (const key in budgets) {
    if (key === 'lcp' || key === 'tti' || key === 'inp') {
      if (scores[key] > budgets[key]) failed = true;
    } else if (key === 'cls') {
      if (scores[key] > budgets[key]) failed = true;
    } else {
      if (scores[key] < budgets[key]) failed = true;
    }
  }
  if (failed) {
    console.error('Lighthouse budgets not met:', scores);
    process.exit(1);
  } else {
    console.log('Lighthouse budgets met:', scores);
  }
}

const url = process.env.LH_URL || 'http://localhost:5173';

const opts = {
  logLevel: 'error',
  output: 'json',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  port: 0,
  formFactor: 'mobile',
  screenEmulation: { mobile: true, width: 360, height: 640, deviceScaleFactor: 2, disabled: false },
  throttling: lighthouse.throttling.mobileRegluar3G || lighthouse.throttling.throttlingPreset || undefined
};

function checkBudgets(lhr) {
  let failed = false;
  const audits = lhr.audits;
  const tti = audits['interactive'].numericValue; // ms
  const lcp = audits['largest-contentful-paint'].numericValue; // ms
  const tbt = audits['total-blocking-time'].numericValue; // ms
  const cls = audits['cumulative-layout-shift'].numericValue; // unitless

  const results = {
    performance: lhr.categories.performance.score * 100,
    accessibility: lhr.categories.accessibility.score * 100,
    bestPractices: lhr.categories['best-practices'].score * 100,
    seo: lhr.categories.seo.score * 100,
    tti,
    lcp,
    tbt,
    cls
  };

  const thresholds = { perf: 90, a11y: 95, bp: 95, seo: 95 };
  if (results.performance < thresholds.perf) failed = true;
  if (results.accessibility < thresholds.a11y) failed = true;
  if (results.bestPractices < thresholds.bp) failed = true;
  if (results.seo < thresholds.seo) failed = true;
  if (lcp > 2500 || cls > 0.1 || tti > 3000 || tbt > 200) failed = true;

  console.log('[Lighthouse] Scores:', results);
  if (failed) {
    console.error('Performance budgets or scores not met.');
    process.exit(1);
  } else {
    console.log('All performance budgets and scores met.');
  }
}

(async () => {
  const chrome = await launch({ chromeFlags: ['--headless'] });
  const runnerResult = await lighthouse(url, { ...opts, port: chrome.port });
  await chrome.kill();
  checkBudgets(runnerResult.lhr);
  runLighthouse(url);
})();

