import { test as baseTest } from "@playwright/test";
import { SearchPage } from "../pages/SearchPage";

// Declare the types of your fixtures
type MyFixtures = {
  searchPage: SearchPage;
};

// Extend the base test to include our custom fixture
export const test = baseTest.extend<MyFixtures>({
  // The fixture definition
  searchPage: async ({ page }, use) => {
    // Setup Phase: Instantiate the Page Object
    const searchPage = new SearchPage(page);

    // Action Phase: Pass the instantiated object to the test
    await use(searchPage);

    // Teardown Phase (Optional): Runs after the test finishes.
    // Playwright handles browser teardown natively, but you can add cleanup logic here.
  },
});

export { expect } from "@playwright/test";
