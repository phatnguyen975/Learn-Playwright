import { test, expect } from "@playwright/test";

test.describe("Visual Regression Testing", () => {
  test("Verify Playwright Homepage UI remains intact", async ({ page }) => {
    await page.goto("https://playwright.dev/");

    // Wait for the page to be fully loaded and animations to settle
    await page.waitForLoadState("networkidle");

    // Best Practice: Mask dynamic content (like version numbers or moving carousels)
    // to prevent false positives in image comparison
    // We will mask the main header text just as an example of the capability
    await expect(page).toHaveScreenshot("playwright-homepage.png", {
      mask: [page.locator(".hero__title")],
      maxDiffPixels: 100, // Allow a tiny margin of error (e.g., anti-aliasing differences)
    });
  });
});
