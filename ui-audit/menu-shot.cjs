const { chromium, devices } = require('playwright');
(async ()=>{
  const browser = await chromium.launch({ headless:true });
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();
  await page.goto('https://yourhairbeauty.co.uk/', { waitUntil:'domcontentloaded', timeout:60000 });
  await page.waitForTimeout(3000);
  await page.click('button[aria-label="Open menu"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path:'c:/Users/Nakib PC/Desktop/Sunny/yourhairbeauty/ui-audit/mobile_menu_open.png' });
  await browser.close();
})();
