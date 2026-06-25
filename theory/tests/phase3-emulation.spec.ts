import { test, expect } from "@playwright/test";

// Best Practice: Apply emulation settings at the test or describe block level
test.use({
  geolocation: { latitude: 35.6895, longitude: 139.6917 }, // Tokyo coordinates
  permissions: ["geolocation"], // Grant GPS access automatically
  viewport: { width: 390, height: 844 }, // iPhone 12/13 dimensions
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
});

test("Verify geolocation feature on a stable map provider", async ({
  page,
}) => {
  // Navigate to a site dedicated to testing automation
  await page.goto("https://the-internet.herokuapp.com/geolocation");

  // 1. Trigger the geolocation request by clicking the button
  await page.getByRole("button", { name: "Where am I?" }).click();

  // 2. Locate the output elements
  const latValue = page.locator("#lat-value");
  const longValue = page.locator("#long-value");

  // 3. Assert that the exact injected coordinates are displayed
  await expect(latValue).toContainText("35.6895");
  await expect(longValue).toContainText("139.6917");
});
