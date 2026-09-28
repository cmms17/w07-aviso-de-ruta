const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 460, height: 760 } });
  const filePath = 'file://' + path.resolve(__dirname, 'mockup.html');
  await page.goto(filePath);
  const phone = await page.$('.phone');
  await phone.screenshot({ path: path.resolve(__dirname, 'mockup-aviso-ruta.png') });
  await browser.close();
  console.log('done');
})();
