import { chromium, firefox, webkit } from "playwright";

describe("Playwright Tests", () => {
  let browser;
  let context;

  beforeAll(async () => {
    browser = await chromium.launch();
    context = await browser.newContext({
      recordVideo: {
        dir: "videos/", // Directory to save videos
        size: { width: 1280, height: 720 }, // Video resolution
      },
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it("should work", async () => {
    const page = await context.newPage();
    await page.goto("http://frontend:6969");
    expect(await page.title()).toBe("Register");
  });

  it("should register a user", async () => {
    const page = await context.newPage();
    await page.goto("http://frontend:6969");
    await page.fill('input[id="email"]', "example2@gmail.com");
    await page.fill('input[id="password"]', "passwordds");
    await page.fill('input[id="confirmPassword"]', "passwordds");
    await page.click('button[type="submit"]');
    await page.waitForSelector('input[id="login-email"]'); // Specific to the login page
    const pageTitle = await page.title();

    expect(pageTitle).toBe("Login");
  });
});
