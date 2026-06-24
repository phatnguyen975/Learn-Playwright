import { test, expect } from "@playwright/test";

test("Basic navigation and verification", async ({ page }) => {
  // 1. Navigate to the website
  await page.goto("https://playwright.dev/");

  // 2. Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);

  // 3. Locate the 'Get started' link using a user-facing locator and click it
  const getStartedLink = page.getByRole("link", { name: "Get started" });
  await getStartedLink.click();

  // 4. Verify the URL changed
  await expect(page).toHaveURL(/.*intro/);

  // 5. Verify the heading is visible
  await expect(
    page.getByRole("heading", { name: "Installation" }),
  ).toBeVisible();
});
