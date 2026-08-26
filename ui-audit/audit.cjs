const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

const baseUrl = 'https://yourhairbeauty.co.uk';
const pages = [
  { id: 'home', url: '/' },
  { id: 'shop_sale', url: '/shop?filter=sale' },
  { id: 'shop_collection', url: '/shop?collection=summer' },
  { id: 'checkout', url: '/checkout' },
  { id: 'wishlist', url: '/wishlist' },
  { id: 'pay_success', url: '/pay/success?ref=test-ref' },
];

const outDir = path.join(process.cwd(), 'ui-audit');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const profiles = [
  {
    name: 'desktop',
    contextOptions: {
      viewport: { width: 1440, height: 900 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    },
  },
  {
    name: 'mobile',
    contextOptions: {
      ...devices['iPhone 13'],
    },
  },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = [];

  for (const profile of profiles) {
    const context = await browser.newContext(profile.contextOptions);

    for (const pageDef of pages) {
      const page = await context.newPage();
      const logs = [];
      const errors = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          logs.push({ type: msg.type(), text: msg.text() });
        }
      });
      page.on('pageerror', (err) => errors.push(String(err)));

      const fullUrl = `${baseUrl}${pageDef.url}`;
      const item = {
        profile: profile.name,
        page: pageDef.id,
        url: fullUrl,
        status: null,
        finalUrl: null,
        loadError: null,
        overflow: null,
        horizontalScroll: null,
        consoleIssues: [],
        pageErrors: [],
        screenshot: `${profile.name}_${pageDef.id}.png`,
      };

      try {
        const response = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(2500);
        item.status = response ? response.status() : null;
        item.finalUrl = page.url();

        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const winWidth = window.innerWidth;
          const docWidth = doc ? doc.scrollWidth : 0;
          const bodyWidth = body ? body.scrollWidth : 0;
          return {
            winWidth,
            docWidth,
            bodyWidth,
            overflow: docWidth > winWidth + 1 || bodyWidth > winWidth + 1,
            horizontalScroll: window.scrollX,
          };
        });

        item.overflow = metrics.overflow;
        item.horizontalScroll = metrics.horizontalScroll;

        const shotPath = path.join(outDir, item.screenshot);
        await page.screenshot({ path: shotPath, fullPage: true });
      } catch (e) {
        item.loadError = String(e);
      }

      item.consoleIssues = logs.slice(0, 20);
      item.pageErrors = errors.slice(0, 20);
      report.push(item);

      await page.close();
    }

    await context.close();
  }

  await browser.close();

  const reportPath = path.join(outDir, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Report written: ${reportPath}`);
})();
