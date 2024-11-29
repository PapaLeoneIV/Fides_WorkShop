import { chromium, firefox, webkit } from 'playwright';

describe('Playwright Tests', () => {
  let browser;
  
  beforeAll(async () => {
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should work', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:6969');
    expect(await page.title()).toBe('BikHo');
  });
});
