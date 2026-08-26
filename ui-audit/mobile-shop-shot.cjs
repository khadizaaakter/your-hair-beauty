const { chromium, devices } = require('playwright');
(async ()=>{
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();
  await page.goto('https://yourhairbeauty.co.uk/shop', {waitUntil:'domcontentloaded', timeout:60000});
  await page.waitForTimeout(5000);
  await page.screenshot({path:'c:/Users/Nakib PC/Desktop/Sunny/yourhairbeauty/ui-audit/mobile_shop_default_after_fix.png', fullPage:true});
  const buttons = await page.locator('button:has-text("Add to Cart")').allTextContents();
  console.log('buttons', buttons.length, buttons.slice(0,3));
  await browser.close();
})();
