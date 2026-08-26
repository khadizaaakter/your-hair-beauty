const { chromium, devices } = require('playwright');
(async ()=>{
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();
  await page.goto('https://yourhairbeauty.co.uk/shop', {waitUntil:'domcontentloaded', timeout:60000});
  await page.waitForTimeout(5000);
  const btn = page.locator('button:has-text("Add to Cart")').first();
  console.log('count', await page.locator('button:has-text("Add to Cart")').count());
  console.log('visible', await btn.isVisible());
  console.log('enabled', await btn.isEnabled());
  const box = await btn.boundingBox();
  console.log('box', box);
  if (box) {
    await btn.click();
    await page.waitForTimeout(1200);
    const cart = await page.evaluate(() => localStorage.getItem('yhb_cart'));
    console.log('cart', cart);
  }
  await browser.close();
})();
