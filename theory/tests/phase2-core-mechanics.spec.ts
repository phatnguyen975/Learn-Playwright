import { test, expect } from "@playwright/test";

test.describe("Phase 2: TodoMVC Core Interactions", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the demo application before each test
    await page.goto("https://demo.playwright.dev/todomvc/");
  });

  test("should allow adding, completing, and filtering todo items", async ({
    page,
  }) => {
    // 1. Locators: Find the input field using placeholder
    const newTodoInput = page.getByPlaceholder("What needs to be done?");

    // 2. Actions: Fill and press Enter to add items
    await newTodoInput.fill("Learn Playwright Locators");
    await newTodoInput.press("Enter");

    await newTodoInput.fill("Master Web-First Assertions");
    await newTodoInput.press("Enter");

    // 3. Assertions: Verify the list has exactly 2 items
    const todoItems = page.getByTestId("todo-item");
    await expect(todoItems).toHaveCount(2);

    // 4. Chaining & Actions: Find the first todo, locate its checkbox, and check it
    const firstTodo = todoItems.filter({
      hasText: "Learn Playwright Locators",
    });
    await firstTodo.getByRole("checkbox").check();

    // 5. Assertions: Verify the item is marked as completed (checking the CSS class)
    await expect(firstTodo).toHaveClass(/completed/);

    // 6. Actions: Click the "Active" filter link
    const activeFilter = page.getByRole("link", { name: "Active" });
    await activeFilter.click();

    // 7. Assertions: Verify only 1 item is visible in the Active view
    await expect(todoItems).toHaveCount(1);
    await expect(page.getByText("Master Web-First Assertions")).toBeVisible();
    await expect(page.getByText("Learn Playwright Locators")).toBeHidden();
  });
});
