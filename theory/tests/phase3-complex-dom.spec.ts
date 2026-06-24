import { test, expect } from "@playwright/test";

test.describe("Advanced DOM Handling", () => {
  test("Handle JavaScript Confirm Dialog", async ({ page }) => {
    await page.goto("https://the-internet.herokuapp.com/javascript_alerts");

    // Best Practice: Setup the listener BEFORE triggering the action
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toBe("I am a JS Confirm");
      await dialog.accept(); // Simulate clicking "OK"
    });

    // Trigger the dialog
    await page.getByRole("button", { name: "Click for JS Confirm" }).click();

    // Verify the outcome on the page
    await expect(page.locator("#result")).toHaveText("You clicked: Ok");
  });

  test("Handle Multiple Tabs", async ({ context, page }) => {
    await page.goto("https://the-internet.herokuapp.com/windows");

    // Best Practice: Wait for the event and trigger the action concurrently
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.getByRole("link", { name: "Click Here" }).click(),
    ]);

    // Wait for the new tab to load
    await newPage.waitForLoadState();

    // Verify the new tab's content
    await expect(newPage.getByRole("heading")).toHaveText("New Window");

    // The original page is still accessible
    await expect(
      page.getByRole("heading", { name: "Opening a new window" }),
    ).toBeVisible();
  });
});
