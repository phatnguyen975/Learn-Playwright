import { test, expect } from "@playwright/test";

const authFile = ".auth/user.json";

test("Login and save session state", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/login");

  await page.getByLabel("Username").fill("tomsmith");
  await page.getByLabel("Password").fill("SuperSecretPassword!");
  await page.getByRole("button", { name: "Login" }).click();

  // Assert successful login
  await expect(page.locator("#flash")).toContainText(
    "You logged into a secure area!",
  );

  // Best Practice: Save the storage state (cookies/tokens) to a file
  await page.context().storageState({ path: authFile });
});
