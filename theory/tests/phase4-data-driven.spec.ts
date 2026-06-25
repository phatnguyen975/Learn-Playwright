import { test, expect } from "../fixtures/pomFixture";

// Array of test data (can also be imported from an external .json file)
const searchData = [
  { keyword: "Assertions", expectedText: "Assertions" },
  { keyword: "Fixtures", expectedText: "Fixtures" },
  { keyword: "Network", expectedText: "Network" },
];

test.describe("Data-Driven Search Tests", () => {
  // Loop through the data array to create parameterized tests
  for (const data of searchData) {
    // The test name is dynamic based on the data
    test(`Should display correct results for: ${data.keyword}`, async ({
      searchPage,
    }) => {
      await searchPage.navigate();
      await searchPage.searchFor(data.keyword);

      // Verify the results contain the expected text
      await expect(searchPage.searchResults.first()).toContainText(
        data.expectedText,
      );
    });
  }
});
