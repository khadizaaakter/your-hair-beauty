const { chromium, devices } = require('playwright');
(async ()=>{
  const browser = await chromium.launch({ headless:true });
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();

  await page.goto('https://yourhairbeauty.co.uk/shop', { waitUntil:'domcontentloaded', timeout:60000 });
  await page.waitForTimeout(4500);

  const addButtons = page.locator('button:has-text("Add to Cart")');
  const count = await addButtons.count();
  console.log('ADD_BUTTON_COUNT', count);
  if (count > 0) {
    await addButtons.first().click({ force: true });
    await page.waitForTimeout(1500);
  }

  const cartStore = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    const hit = keys.find(k => k.toLowerCase().includes('cart'));
    return {
      keys,
      hit,
      value: hit ? localStorage.getItem(hit) : null,
    };
  });

  console.log('CART_STORAGE_KEY', cartStore.hit);
  console.log('CART_STORAGE_VALUE', cartStore.value);

  await browser.close();
})();
