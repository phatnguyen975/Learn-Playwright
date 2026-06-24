import { test, expect } from "@playwright/test";

test("Mock API to test empty state UI", async ({ page }) => {
  // Best Practice: Route setup must happen before page navigation
  await page.route("*/**/api/v1/fruits", async (route) => {
    // Fulfill the request with an empty array to simulate no data
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });

  await page.goto("https://demo.playwright.dev/api-mocking/");

  // Because we mocked the API to return no fruits, we assert that the UI handles this correctly
  // The demo site will show an empty list. We verify no list items exist
  const fruitList = page.getByRole("listitem");
  await expect(fruitList).toHaveCount(0);
});
