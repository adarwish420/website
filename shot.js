// Render index.html to screenshots in light + dark mode using headless Chrome.
// Usage: npm install && npm run shot
// Requires Chrome: npx puppeteer browsers install chrome
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const base = path.join(require('os').homedir(), '.cache/puppeteer/chrome');
  if (fs.existsSync(base)) {
    const ver = fs.readdirSync(base).find(d => d.startsWith('linux'));
    if (ver) return path.join(base, ver, 'chrome-linux64/chrome');
  }
  throw new Error('Chrome not found. Run: npx puppeteer browsers install chrome');
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
  const fileUrl = 'file://' + path.resolve('index.html');

  await page.goto(fileUrl, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'shot-light.png' });

  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: 'shot-dark.png' });

  await browser.close();
  console.log('Wrote shot-light.png and shot-dark.png');
})();
