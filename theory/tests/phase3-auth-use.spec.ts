import { test, expect } from "@playwright/test";

// Tell this test file to use the saved state
test.use({ storageState: ".auth/user.json" });

test("Verify secure area access without logging in again", async ({ page }) => {
  // Navigate directly to the secure page
  await page.goto("https://the-internet.herokuapp.com/secure");

  // We should be already logged in based on the injected cookies/storage
  await expect(
    page.getByRole("heading", { name: "Secure Area" }),
  ).toBeVisible();
});
