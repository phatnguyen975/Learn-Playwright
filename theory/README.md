<div align="center">
  <h1>Playwright Theory</h1>
  <small>
    <strong>Author:</strong> Nguyễn Tấn Phát
  </small> <br />
  <sub>June 25, 2026</sub>
</div>

## 1. Playwright Fundamentals & Environment Setup

### 1.1. Playwright Architecture & Why It Excels

Playwright operates differently from legacy automation tools like Selenium. Instead of relying on intermediate drivers (like ChromeDriver) and HTTP requests to communicate with browsers, Playwright uses a persistent WebSocket connection via the Chrome DevTools Protocol (CDP) for Chromium, and similar native debugging protocols for Firefox and WebKit.

**Key Advantages:**

- **Out-of-Process Execution:** Your test scripts and the browser run in different processes. Playwright intercepts network traffic, modifies the DOM, and listens to browser events natively without typical WebDriver flakiness.
- **Auto-Waiting:** It automatically waits for elements to be actionable (visible, enabled, stable) before performing actions, eliminating the need for arbitrary `Thread.sleep()` or hardcoded timeouts.

### 1.2. Environment Setup

Run the following in your terminal:

```bash
# Initialize a new Playwright project
npm init playwright@latest

# During initialization, select:
# 1. TypeScript (Recommended for robust automation)
# 2. Default e2e test folder
# 3. Add GitHub Actions workflow (Optional)
# 4. Install Playwright browsers (Y)
```

### 1.3. Core Concepts: Browser, Context, and Page

Playwright structures test execution hierarchically:

- **`Browser`:** The physical browser instance (Chromium, Firefox, WebKit). Launching a browser is resource-intensive.
- **`BrowserContext`:** An isolated, incognito-like session within a Browser. Contexts do not share cookies, cache, or local storage. You can create multiple contexts within a single browser, making parallel testing extremely fast.
- **`Page`:** A single tab or window within a `BrowserContext`.

### 1.4. Debugging Arsenal

Playwright provides powerful, built-in debugging tools:

- **Playwright Inspector:** Steps through your code line-by-line, showing the exact element it is targeting. Run with: `npx playwright test --debug`.
- **Trace Viewer:** A post-execution debugging tool. It captures a full "trace" of the test, including DOM snapshots, network requests, console logs, and actions. Run with: `npx playwright show-trace trace.zip`.
- **UI Mode:** A time-traveling visual interface. It opens a dedicated window where you can run tests, inspect the DOM at any point in time, and edit code. Run with: `npx playwright test --ui`.

### 1.5. Exercise: The First Script

Let's apply the core concepts. Open your IDE, create `tests/phase1-example.spec.ts`, and insert this code:

```typescript
import { test, expect } from "@playwright/test";

test("Basic navigation and verification", async ({ page }) => {
  // 1. Navigate to the website
  await page.goto("https://playwright.dev/");

  // 2. Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);

  // 3. Locate the 'Get started' link using a user-facing locator and click it
  const getStartedLink = page.getByRole("link", { name: "Get started" });
  await getStartedLink.click();

  // 4. Verify the URL changed
  await expect(page).toHaveURL(/.*intro/);

  // 5. Verify the heading is visible
  await expect(
    page.getByRole("heading", { name: "Installation" }),
  ).toBeVisible();
});
```

Run this specific test in your terminal:

```bash
npx playwright test tests/phase1-example.spec.ts --headed
```

## 2. Core Concepts (Locators, Actions & Assertions)

### 2.1. User-Facing Locators: The Playwright Philosophy

Playwright strongly advocates for testing applications the way real users interact with them. Instead of relying on brittle CSS classes or deep XPath queries, Playwright provides built-in "user-facing" locators.

**The Core Locator APIs:**

- `page.getByRole()`: The most resilient locator. It locates elements by their ARIA role, ARIA attributes, and accessible name (e.g., `page.getByRole('button', { name: 'Submit' })`).
- `page.getByText()`: Locates elements containing specific text.
- `page.getByLabel()`: Locates a form control by the text of its associated `<label>`.
- `page.getByPlaceholder()`: Locates an input by its placeholder attribute.
- `page.getByAltText()`: Locates images by their `alt` text alternative.
- `page.getByTitle()`: Locates elements by their `title` attribute.
- `page.getByTestId()`: Locates elements based on the `data-testid` attribute (highly recommended when elements lack accessible attributes).

**Advanced Locator Features:**

- **Chaining & Filtering:** You can chain locators to narrow down the search: `page.locator('form').getByRole('button')`. You can also filter: `page.getByRole('listitem').filter({ hasText: 'Product A' })`.
- **Strictness:** Playwright locators are strict by default. If a locator resolves to multiple elements when an action is performed, Playwright will throw an error to prevent accidental interactions. You must resolve this by using `.first()`, `.last()`, `.nth(index)`, or refining the locator.

### 2.2. Actions & Interactions

Playwright performs automatic actionability checks before dispatching events. This means it ensures the element is visible, stable (not animating), receives events (not obscured by other elements), and is enabled before interacting.

**Common Actions:**

- `click()`: Clicks the element.
- `fill()`: Fills an input field (clears it first).
- `type()`: Types character by character (use `fill` instead unless testing keyboard events).
- `press()`: Focuses the element and presses a specific key or combination (e.g., `page.getByRole('textbox').press('Enter')`).
- `check()` / `uncheck()`: Toggles a checkbox or radio button.
- `selectOption()`: Selects one or multiple options in a `<select>` dropdown.
- `hover()`: Hovers the mouse over the element.
- `dragTo()`: Drags the element to a target locator.

**Bypassing Actionability (The "Force" Flag):** If you intentionally want to interact with a hidden element or bypass the actionability checks, you can use the force option: `await element.click({ force: true })`.

### 2.3. Web-First Assertions

Unlike standard assertions (which evaluate a condition instantly and fail if false), Playwright's `expect` assertions are "async" and will **auto-retry** until the condition is met or the timeout is reached.

**Key Assertions:**

- `await expect(locator).toBeVisible()`
- `await expect(locator).toBeHidden()`
- `await expect(locator).toBeEnabled()`
- `await expect(locator).toBeDisabled()`
- `await expect(locator).toHaveText('Welcome')` (Exact match or regex)
- `await expect(locator).toContainText('error')` (Substring match)
- `await expect(locator).toHaveValue('John Doe')` (Input values)
- `await expect(locator).toHaveCount(3)` (Asserting list length)

**Soft Assertions:** If you want a test to continue running even if an assertion fails (useful for compiling a list of UI issues in one run), use `expect.soft()`:
`await expect.soft(page.getByText('Bonus')).toBeVisible();`

### 2.4. Exercise: TodoMVC Automation

We will use the official Playwright TodoMVC demo application. Create a new file named `tests/phase2-core-mechanics.spec.ts`.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Phase 2: TodoMVC Core Interactions", () => {
  // Navigate to the demo application before each test
  test.beforeEach(async ({ page }) => {
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
```

To run this specific test:

```bash
npx playwright test tests/phase2-core-mechanics.spec.ts --headed
```
