const { chromium } = require('playwright');
(async ()=>{
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await context.newPage();
  await page.goto('https://yourhairbeauty.co.uk/', {waitUntil:'domcontentloaded', timeout:60000});
  await page.waitForTimeout(8000);
  await page.screenshot({path:'c:/Users/Nakib PC/Desktop/Sunny/yourhairbeauty/ui-audit/desktop_fold_home_8s.png'});
  await browser.close();
})();
