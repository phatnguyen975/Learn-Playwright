import { type Page, type Locator } from "@playwright/test";

export class SearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchResults: Locator;

  constructor(page: Page) {
    this.page = page;
    // Centralizing locators
    this.searchInput = page.getByPlaceholder("Search docs");
    this.searchButton = page.getByRole("button", { name: "Search" });
    this.searchResults = page.locator(".DocSearch-Hit");
  }

  async navigate() {
    await this.page.goto("https://playwright.dev/");
  }

  async searchFor(query: string) {
    // Triggering the search modal
    await this.searchButton.click();
    // Filling the query
    await this.searchInput.fill(query);
  }
}
