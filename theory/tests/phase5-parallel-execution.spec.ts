import { test, expect } from "@playwright/test";

// Best Practice: Opt-in to fully parallel mode for this specific test suite
test.describe.configure({ mode: "parallel" });

test.describe("Parallel Tests Block", () => {
  test("Independent Test 1: Navigation", async ({ page }) => {
    await page.goto("https://playwright.dev/");
    await expect(page).toHaveTitle(/Playwright/);
  });

  test("Independent Test 2: Search UI", async ({ page }) => {
    await page.goto("https://playwright.dev/");
    const searchBtn = page.getByRole("button", { name: "Search" });
    await expect(searchBtn).toBeVisible();
  });

  test("Independent Test 3: Footer Links", async ({ page }) => {
    await page.goto("https://playwright.dev/");
    const gitHubLink = page.getByRole("link", { name: "GitHub repository" });
    await expect(gitHubLink).toBeVisible();
  });
});
