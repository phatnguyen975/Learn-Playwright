import { test, expect } from "@playwright/test";

test("Upload a file securely", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/upload");

  // Best Practice: Use setInputFiles for standard input[type="file"]
  // Path is relative to the test file execution context
  await page.locator("#file-upload").setInputFiles("package.json"); // uploading an existing local file
  await page.getByRole("button", { name: "Upload" }).click();

  await expect(
    page.getByRole("heading", { name: "File Uploaded!" }),
  ).toBeVisible();
  await expect(page.locator("#uploaded-files")).toContainText("package.json");
});
