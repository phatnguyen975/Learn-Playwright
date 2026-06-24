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

## 3. Advanced Automation Scenarios

### 3.1. Handling Complex DOMs (Tabs, Iframes, and Dialogs)

Modern web applications are rarely just a single flat page. Playwright provides native, seamless APIs to handle complex browser environments.

- **System Dialogs (Alerts, Confirms, Prompts):** By default, Playwright auto-dismisses all JavaScript dialogs so they do not block test execution. To interact with them, you must set up an event listener **before** the action that triggers the dialog.
  - **API:** `page.on('dialog', handler)`
  - **Actions:** `dialog.accept()`, `dialog.dismiss()`, `dialog.message()`.
- **Multiple Pages (Tabs/Windows):** When an action opens a new tab, you need to instruct Playwright to wait for that new page event and assign it to a new variable.
  - **API:** `const [newPage] = await Promise.all([ context.waitForEvent('page'), page.click('a[target="_blank"]') ])`
- **Iframes:** Playwright treats iframes as isolated documents. You cannot directly query an element inside an iframe from the main page. You must use a `FrameLocator` to enter the iframe's context first.
  - **API:** `page.frameLocator('#iframe-id').getByRole('button')`

### 3.2. Network Interception & API Mocking

This is one of Playwright's most powerful features. You can intercept network traffic to modify requests, abort them (e.g., block tracking scripts to speed up tests), or mock responses. Mocking is crucial for testing UI edge cases (like server errors or empty states) without needing the backend to actually generate those conditions.

- **Intercepting Requests:** `await page.route(urlPattern, handler)`
- **Modifying Responses:** `route.fulfill({ status: 500, body: 'Error' })` or `route.fulfill({ json: mockData })`
- **Continuing Requests:** `route.continue()` (let the request pass through).

### 3.3. Handling File Uploads and Downloads

Playwright handles the native OS file picker dialogues securely without needing external tools.

- **Uploads:** If the page uses standard `<input type="file">`, you can use `locator.setInputFiles('path/to/file')`. If the upload is triggered dynamically and requires waiting for a file chooser event, you use `page.waitForEvent('filechooser')`.
- **Downloads:** You must wait for the download event to occur, which gives you access to the download object to verify filenames or save the file to a specific path.
  - **API:** `const download = await page.waitForEvent('download'); await download.saveAs('/path')`.

### 3.4. State Management (Authentication Reusability)

Logging in before every single test makes execution slow. Playwright allows you to log in once, save the authentication state (Cookies, Local Storage, Session Storage) into a JSON file, and then inject that state into a new `BrowserContext` for all subsequent tests.

- **Save State:** `await page.context().storageState({ path: 'auth.json' });`
- **Use State:** Configure it in `playwright.config.ts` or inject it into specific test files using `test.use({ storageState: 'auth.json' });`.

### 3.5. Practical Exercises

#### Exercise 1: Dialogs, Tabs, and Iframes

Create `tests/phase3-complex-dom.spec.ts`. We will use standard testing grounds for this.

```typescript
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
```

To run this specific test:

```bash
npx playwright test tests/phase3-complex-dom.spec.ts --headed
```

#### Exercise 2: Network Mocking

Create `tests/phase3-network-mocking.spec.ts`. We will intercept an API call to test the UI's empty state.

```typescript
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
```

To run this specific test:

```bash
npx playwright test tests/phase3-network-mocking.spec.ts --headed
```

#### Exercise 3: File Upload & Download

Create `tests/phase3-file-transfer.spec.ts`.

```typescript
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
```

To run this specific test:

```bash
npx playwright test tests/phase3-file-transfer.spec.ts --headed
```

#### Exercise 4: Authentication State Reuse

First, create `tests/phase3-auth-setup.spec.ts` to log in and save the state.

```typescript
import { test, expect } from "@playwright/test";

const authFile = ".auth/user.json";

test("Login and save session state", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/login");

  await page.getByLabel("Username").fill("tomsmith");
  await page.getByLabel("Password").fill("SuperSecretPassword!");
  await page.getByRole("button", { name: "Login" }).click();

  // Assert successful login
  await expect(page.locator("#flash")).toContainText(
    "You logged into a secure area!",
  );

  // Best Practice: Save the storage state (cookies/tokens) to a file
  await page.context().storageState({ path: authFile });
});
```

Then, create `tests/phase3-auth-use.spec.ts` to use that saved state without logging in again.

```typescript
import { test, expect } from "@playwright/test";

// Tell this test file to use the saved state
test.use({ storageState: ".auth/user.json" });

test("Verify secure area access without logging in again", async ({ page }) => {
  // Navigate directly to the secure page
  await page.goto("https://the-internet.herokuapp.com/secure");

  // We should be already logged in based on the injected cookies/storage
  await expect(
    page.getByRole("heading", { name: "Secure Area" }),
  ).toBeVisible();
});
```

To run this specific test:

```bash
npx playwright test tests/phase3-auth-setup.spec.ts --headed
npx playwright test tests/phase3-auth-use.spec.ts --headed
```
