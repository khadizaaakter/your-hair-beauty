const { chromium, devices } = require('playwright');
(async ()=>{
  const browser = await chromium.launch({ headless:true });
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();

  await page.goto('https://yourhairbeauty.co.uk/shop', { waitUntil:'domcontentloaded', timeout:60000 });
  await page.waitForTimeout(4000);

  const addButtons = page.locator('button:has-text("Add to Cart")');
  const count = await addButtons.count();
  console.log('ADD_BUTTON_COUNT', count);

  if (count > 0) {
    await addButtons.first().click({ force: true });
    await page.waitForTimeout(1200);
  }

  const badge = page.locator('span', { hasText: '1' }).first();
  const cartText = await page.content();
  console.log('HAS_CART_TEXT', cartText.includes('Cart'));

  await page.goto('https://yourhairbeauty.co.uk/checkout', { waitUntil:'domcontentloaded', timeout:60000 });
  await page.waitForTimeout(3000);
  const emptyTextVisible = await page.locator('text=Your cart is empty').count();
  console.log('EMPTY_TEXT_COUNT', emptyTextVisible);
  await page.screenshot({ path:'c:/Users/Nakib PC/Desktop/Sunny/yourhairbeauty/ui-audit/mobile_checkout_after_fix.png' });

  await browser.close();
})();
