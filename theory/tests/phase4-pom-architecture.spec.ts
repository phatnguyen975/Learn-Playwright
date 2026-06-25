// Import our custom test with fixtures, NOT the default @playwright/test
import { test, expect } from "../fixtures/pomFixture";

test.describe("Architecture Implementation", () => {
  // We inject 'searchPage' directly into the test arguments!
  test("Should search for a concept using POM and Fixtures", async ({
    searchPage,
  }) => {
    await searchPage.navigate();
    await searchPage.searchFor("Locators");

    // Assertions remain in the test file
    await expect(searchPage.searchResults.first()).toBeVisible();
    await expect(searchPage.searchResults.first()).toContainText("Locators");
  });
});
