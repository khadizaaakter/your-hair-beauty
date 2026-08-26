const { chromium, devices } = require('playwright');

async function captureCheckout(profileName, contextOptions, outPath) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  await page.goto('https://yourhairbeauty.co.uk/shop', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);

  const addBtn = page.locator('button:has-text("Add to Cart")').first();
  const count = await addBtn.count();

  if (count > 0) {
    if (profileName === 'desktop') {
      const card = addBtn.locator('xpath=ancestor::*[contains(@class,"group")]').first();
      await card.hover({ force: true });
      await page.waitForTimeout(300);
    }
    await addBtn.click({ force: true });
    await page.waitForTimeout(1000);
  }

  await page.goto('https://yourhairbeauty.co.uk/checkout', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: outPath });

  await browser.close();
}

(async ()=>{
  await captureCheckout('desktop', { viewport: { width: 1440, height: 900 } }, 'c:/Users/Nakib PC/Desktop/Sunny/yourhairbeauty/ui-audit/desktop_checkout_with_item.png');
  await captureCheckout('mobile', { ...devices['iPhone 13'] }, 'c:/Users/Nakib PC/Desktop/Sunny/yourhairbeauty/ui-audit/mobile_checkout_with_item.png');
  console.log('done');
})();
