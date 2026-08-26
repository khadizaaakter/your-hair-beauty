const fs = require('fs');
const path = require('path');
const { chromium, devices } = require('playwright');

(async () => {
  const outDir = path.join(process.cwd(), 'ui-audit');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const targets = [
    { id: 'home', url: 'https://yourhairbeauty.co.uk/' },
    { id: 'shop_sale', url: 'https://yourhairbeauty.co.uk/shop?filter=sale' },
    { id: 'checkout', url: 'https://yourhairbeauty.co.uk/checkout' },
  ];

  const configs = [
    { name: 'desktop_fold', options: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile_fold', options: { ...devices['iPhone 13'] } },
  ];

  const browser = await chromium.launch({ headless: true });
  for (const cfg of configs) {
    const context = await browser.newContext(cfg.options);
    for (const t of targets) {
      const page = await context.newPage();
      await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: path.join(outDir, `${cfg.name}_${t.id}.png`) });
      await page.close();
    }
    await context.close();
  }
  await browser.close();
  console.log('done');
})();
