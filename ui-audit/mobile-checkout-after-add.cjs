const { chromium, devices } = require('playwright');
(async ()=>{
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();
  await page.goto('https://yourhairbeauty.co.uk/shop', {waitUntil:'domcontentloaded', timeout:60000});
  await page.waitForTimeout(5000);
  const btn = page.locator('button:has-text("Add to Cart")').first();
  if (await btn.count()) {
    await btn.click();
    await page.waitForTimeout(1000);
  }
  await page.goto('https://yourhairbeauty.co.uk/checkout', {waitUntil:'domcontentloaded', timeout:60000});
  await page.waitForTimeout(3000);
  const empty = await page.locator('text=Your cart is empty').count();
  console.log('empty_count', empty);
  await page.screenshot({path:'c:/Users/Nakib PC/Desktop/Sunny/yourhairbeauty/ui-audit/mobile_checkout_after_add_working.png'});
  await browser.close();
})();
