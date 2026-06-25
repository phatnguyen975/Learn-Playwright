<div align="center">
  <h1>Playwright Theory</h1>
  <small>
    <strong>Author:</strong> Nguyễn Tấn Phát
  </small> <br />
  <sub>June 25, 2026</sub>
</div>

## Table of Contents

1. [Playwright Fundamentals & Environment Setup](#1-playwright-fundamentals--environment-setup)
2. [Core Concepts (Locators, Actions & Assertions)](#2-core-concepts-locators-actions--assertions)
3. [Advanced Automation Scenarios](#3-advanced-automation-scenarios)
4. [Framework Design & Architecture](#4-framework-design--architecture)
5. [Execution, CI/CD & Best Practices](#5-execution-cicd--best-practices)

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

### 1.5. Global Configuration (`playwright.config.ts`)

At the heart of any production-grade Playwright framework is the `playwright.config.ts` file. This file dictates global behaviors, allowing you to centralize your configuration instead of hardcoding values inside individual tests.

**Core Configuration Concepts:**

- **`baseURL`**: Defining a base URL allows you to use relative paths in your test files (e.g., `await page.goto('/login')` instead of the full URL). This makes switching between staging and production environments seamless.
- **Timeouts Hierarchy**: Playwright handles timing elegantly through different layers to prevent indefinite hangs:
  - **Global Timeout**: The absolute maximum time for the entire test run to complete.
  - **Test Timeout**: Maximum time for a single test to execute (default is 30,000ms).
  - **Expect Timeout**: Maximum time for `expect()` assertions to retry and succeed (default is 5,000ms).
  - **Action Timeout**: Maximum time to wait for a locator to become actionable (e.g., waiting for a button to be clickable).

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 30000, // Test timeout
  expect: {
    timeout: 5000, // Assertion timeout
  },
  use: {
    baseURL: "https://playwright.dev", // Base URL for the framework
    actionTimeout: 10000, // Actionability timeout
  },
});
```

### 1.6. Exercise: The First Script

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
- **Logical Operators (`and`, `or`):** Highly effective for dynamic UI states, such as A/B testing layouts, changing localization, or unpredictable popups.
  - `locator.or()`: Matches if either of the locators is found.
    ```typescript
    // Handles cases where a button might say "Close" OR "Dismiss"
    const closeBtn = page
      .getByRole("button", { name: "Close" })
      .or(page.getByRole("button", { name: "Dismiss" }));
    ```
  - `locator.and()`: Matches elements that satisfy both conditions, useful for intersecting generic locators.
    ```typescript
    // Finds a button that also has a specific title attribute
    const submitBtn = page
      .getByRole("button")
      .and(page.getByTitle("Submit Form"));
    ```

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

### 2.4. Custom Waits & Advanced Assertions

While Playwright's auto-waiting covers 90% of use cases, complex Single Page Applications (SPAs) often require explicit synchronization strategies.

**Custom Waits:**

- `page.waitForLoadState('networkidle')`: Pauses execution until there are no network connections for at least 500ms. Highly useful when navigating to heavy, dynamically loaded pages.
- `page.waitForResponse(urlOrPredicate)`: Waits for a specific API response to return before proceeding, ensuring the backend has processed an action.

**Advanced Assertions (Polling & Retrying):** Sometimes, a UI action triggers an asynchronous background job (like processing an uploaded file) that takes longer than the standard expect timeout to reflect on the UI.

- `expect.toPass()`: Automatically retries an entire block of code until it succeeds or times out.
- `expect.poll()`: Periodically polls a synchronous function until it returns the expected condition.

```typescript
// Example of expect.toPass() for a slow-loading state
await expect(async () => {
  const status = await page.getByTestId("processing-status").textContent();
  expect(status).toBe("Completed");
}).toPass({
  timeout: 15000, // Custom timeout for this specific block
  intervals: [1000, 2000, 5000], // Custom retry intervals
});
```

### 2.5. Exercise: TodoMVC Automation

We will use the official Playwright TodoMVC demo application. Create a new file named `tests/phase2-core-mechanics.spec.ts`.

```typescript
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

### 3.5. API Testing & UI/API Hybrid Automation

Playwright is not just a browser automation tool; it includes a powerful, built-in `APIRequestContext` to send HTTP(S) requests directly from Node.js.

**Why use API requests in a UI framework?**

- **Direct API Testing:** You can validate REST/GraphQL endpoint responses, status codes, and JSON schemas without opening a browser.
- **Hybrid Automation (Best Practice):** The most efficient way to test a UI is to use the API to instantly set up the prerequisites (e.g., creating a user, injecting database records) and then use the browser only to verify the final UI state. This drastically reduces execution time and flakiness compared to navigating through multiple setup screens via UI.

### 3.6. Device Emulation & Permissions

Modern web applications are responsive and location-aware. Playwright allows you to simulate various device parameters and grant browser permissions dynamically at the `BrowserContext` level.

- **Viewport & Devices:** You can emulate specific mobile devices (like 'iPhone 13' or 'Pixel 5'), which automatically configures the viewport size, user agent, and touch screen capabilities.
- **Environment Simulation:** You can set the exact `geolocation` (latitude and longitude), `timezoneId`, and `locale`.
- **Permissions:** Browsers normally prompt users with a popup when a site requests access to the clipboard, camera, or location. In automation, you bypass this by pre-granting permissions using `context.grantPermissions()`.

### 3.7. Practical Exercises

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

#### Exercise 5: UI/API Hybrid Automation

Create `tests/phase3-hybrid-api.spec.ts`. We will use a public testing API (`reqres.in`) to demonstrate creating data via API and validating the response.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Hybrid API and UI Automation", () => {
  test("Create a post via API and validate response", async ({ request }) => {
    // 1. Send a POST request explicitly defining headers and payload
    // Best Practice: Always define headers explicitly to avoid server rejection (HTTP 400)
    const response = await request.post(
      "https://jsonplaceholder.typicode.com/posts",
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: {
          title: "Playwright Automation",
          body: "Learning Hybrid Testing",
          userId: 1,
        },
      },
    );

    // 2. Assert the HTTP status code for resource creation
    expect(response.status()).toBe(201);
    expect(response.ok()).toBeTruthy();

    // 3. Parse the JSON response body
    const responseBody = await response.json();

    // 4. Validate the payload structure
    expect(responseBody.title).toBe("Playwright Automation");
    expect(responseBody.body).toBe("Learning Hybrid Testing");
    expect(responseBody).toHaveProperty("id");
  });
});
```

To run this specific test:

```bash
npx playwright test tests/phase3-hybrid-api.spec.ts --headed
```

#### Exercise 6: Device Emulation & Geolocation

Create `tests/phase3-emulation.spec.ts`. We will configure the test to simulate a user located in Tokyo, Japan, using a mobile viewport.

```typescript
import { test, expect } from "@playwright/test";

// Best Practice: Apply emulation settings at the test or describe block level
test.use({
  geolocation: { latitude: 35.6895, longitude: 139.6917 }, // Tokyo coordinates
  permissions: ["geolocation"], // Grant GPS access automatically
  viewport: { width: 390, height: 844 }, // iPhone 12/13 dimensions
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
});

test("Verify geolocation feature on a stable map provider", async ({
  page,
}) => {
  // Navigate to a site dedicated to testing automation
  await page.goto("https://the-internet.herokuapp.com/geolocation");

  // 1. Trigger the geolocation request by clicking the button
  await page.getByRole("button", { name: "Where am I?" }).click();

  // 2. Locate the output elements
  const latValue = page.locator("#lat-value");
  const longValue = page.locator("#long-value");

  // 3. Assert that the exact injected coordinates are displayed
  await expect(latValue).toContainText("35.6895");
  await expect(longValue).toContainText("139.6917");
});
```

To run this specific test:

```bash
npx playwright test tests/phase3-emulation.spec.ts --headed
```

## 4. Framework Design & Architecture

### 4.1. Architecture Overview & Best Practice Folder Structure

As your test suite scales to hundreds of scenarios, having locators and actions scattered across multiple files becomes a maintenance nightmare. A robust, production-grade automation framework requires a strict separation of concerns.

To achieve this, we organize our Playwright project into a specific directory tree. The core logic (Pages, Fixtures, Utils) must sit alongside the `tests` directory, not inside it.

**Standard Enterprise Framework Directory Tree:**

```text
playwright-automation-project/
├── .github/workflows/         # CI/CD pipeline configurations (e.g., GitHub Actions YAML files)
├── .auth/                     # Ignored in Git. Stores authentication states (cookies/tokens) to bypass login
├── fixtures/                  # Custom Playwright fixtures for automated setup/teardown and POM injection
├── pages/                     # Page Object Model (POM) classes containing locators and UI actions
├── test-data/                 # External data files (JSON, CSV) used for Data-Driven Testing
├── tests/                     # The actual executable test scenarios (*.spec.ts)
│   ├── api/                   # API-only tests
│   ├── e2e/                   # End-to-end UI tests
│   └── visual/                # Visual regression tests (image comparisons)
├── utils/                     # Reusable helper functions (e.g., random data generators, date formatters)
├── .env                       # Ignored in Git. Local environment variables (URLs, secrets, credentials)
├── .prettierrc                # Formatting rules to enforce code style consistency across the team
├── playwright.config.ts       # Global Playwright configuration (timeouts, retries, reporters, baseURL)
└── package.json               # Node.js dependencies and project scripts
```

### 4.2. Page Object Model (POM): Separation of Concerns

The Page Object Model (POM) solves maintainability issues by separating the UI structure from the test logic. You create a class for each page (or component). This class encapsulates all the locators and actions for that specific page.

**Key principles of POM in Playwright:**

- Locators are defined in the constructor or as private class properties.
- Methods represent user actions (e.g., `login(username, password)`, `searchForProduct(item)`).
- Assertions should generally be kept inside the test files, not in the POM, to maintain clear test intent (though structural assertions like `waitForLoadState` can live in POM).

### 4.3. Playwright Fixtures: The Ultimate Setup/Teardown

While `beforeEach` and `afterEach` hooks are common in standard testing frameworks, Playwright introduces **Fixtures**. Fixtures are isolated environments established for each test.

**Why Fixtures are superior:**

- **Encapsulation:** Setup and teardown logic are combined in one place.
- **Reusable:** You can define a fixture once and use it across hundreds of test files.
- **On-Demand (Lazy Loading):** Playwright only sets up the fixture if the specific test asks for it.
- **Isolation:** Each test gets a fresh instance of the fixture, preventing state leakage.

By combining POM with Fixtures, you can automatically inject instantiated Page Objects directly into your tests!

### 4.4. Data-Driven Testing (Parameterized Tests)

You often need to run the same test scenario with multiple sets of data (e.g., testing search functionality with different keywords, or testing login with various invalid credentials). Playwright natively supports parameterized testing using standard JavaScript `for...of` loops within a `test.describe` block.

### 4.5. Environment Variables Configuration (`.env`)

Hardcoding URLs, usernames, or passwords directly into your test files is a critical security vulnerability and an anti-pattern. Enterprise frameworks use environment variables to manage different configurations (Dev, Staging, Prod) seamlessly.

We utilize the `dotenv` package to load variables from a `.env` file into `process.env`.

**Setup:**

1. Install the package: `npm install -D dotenv`
2. Create a `.env` file at the project root:

```env
BASE_URL=https://staging.playwright.dev
TEST_USERNAME=admin
TEST_PASSWORD=SuperSecretPassword!
```

3. Load it inside your `playwright.config.ts`:

```typescript
import { defineConfig } from "@playwright/test";
import * as dotenv from "dotenv";

// Read from default ".env" file.
dotenv.config();

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL,
  },
});
```

### 4.6. Utilities & Helpers (`utils/`)

Not all code belongs in a Page Object or a Test file. Functions that format dates, generate random strings for unique emails, or parse specific files should be centralized in a `utils/` directory. This keeps your POM classes purely focused on UI interaction.

**Example `utils/DataGenerator.ts`:**

```typescript
export class DataGenerator {
  /**
   * Generates a random email address to bypass unique constraints during registration testing.
   */
  static generateRandomEmail(): string {
    const timestamp = new Date().getTime();
    return `testuser_${timestamp}@automation.com`;
  }
}
```

### 4.7. Code Standards: Linters and Formatters

Maintaining a clean codebase is critical for a team. To enforce a standard style—specifically the Google Java/JS Style Guide adapted for TypeScript, which strictly enforces a **4-space indentation**—we utilize Prettier and ESLint.

**Example `.prettierrc` for 4-space Google Style:**

```json
{
  "tabWidth": 4,
  "useTabs": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100
}
```

### 4.8. Playwright CLI Command Cheat Sheet

Mastering the Command Line Interface (CLI) is essential for local debugging and CI/CD execution. Run these commands from your project root.

| Command                                  | Description                                                                                    |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------- |
| `npx playwright test`                    | Runs all tests in headless mode (default for CI/CD).                                           |
| `npx playwright test --headed`           | Runs tests with the browser UI visible.                                                        |
| `npx playwright test --ui`               | Opens the interactive UI Mode (Best for time-travel debugging and tracing).                    |
| `npx playwright test --debug`            | Opens the Playwright Inspector to step through code line-by-line.                              |
| `npx playwright test --project=chromium` | Runs tests only on the specified browser engine.                                               |
| `npx playwright test file.spec.ts:10`    | Runs a specific test starting at line 10 of `file.spec.ts`.                                    |
| `npx playwright show-report`             | Opens the HTML report generated from the last test run.                                        |
| `npx playwright codegen`                 | Opens the Inspector to record your browser actions and generate Playwright code automatically. |

### 4.9. Practical Exercises

#### Exercise 1: Creating a Page Object

Create a new folder named `pages` and add the file `pages/SearchPage.ts`.

```typescript
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
```

#### Exercise 2: Creating a Custom Fixture to Inject the POM

Create a new folder named `fixtures` and add `fixtures/pomFixture.ts`. This is a best practice to avoid using `new SearchPage(page)` in every test.

```typescript
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
```

#### Exercise 3: Using the POM and Fixture in a Test

Create `tests/phase4-pom-architecture.spec.ts`. Notice how clean the test becomes.

```typescript
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
```

To run this specific test:

```bash
npx playwright test tests/phase4-pom-architecture.spec.ts --headed
```

#### Exercise 4: Data-Driven Testing

Create `tests/phase4-data-driven.spec.ts`.

```typescript
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
```

To run this specific test:

```bash
npx playwright test tests/phase4-data-driven.spec.ts --headed
```

## 5. Execution, CI/CD & Best Practices

### 5.1. Parallel Execution, Sharding & Report Merging

Execution speed is critical in a professional CI/CD pipeline. Playwright is designed for speed, utilizing multiple worker processes.

- **Default Behavior:** By default, Playwright runs multiple test _files_ in parallel (using multiple workers), but tests _inside_ a single file run sequentially.
- **Fully Parallel:** You can force tests within a single file to run in parallel by adding `test.describe.configure({ mode: 'parallel' })`.
- **Sharding:** When you have thousands of tests, a single machine is not enough. Playwright allows you to split (shard) your test suite across multiple CI machines. For example, `npx playwright test --shard=1/3` runs the first third of the tests.
- **Merging Reports (Best Practice):** When you use sharding across multiple CI nodes, each node generates a partial `.zip` blob report. You must collect all these blobs into a single directory on a final CI job and merge them into a unified HTML report:
  ```bash
  npx playwright merge-reports --reporter html ./all-blob-reports
  ```

### 5.2. Visual Regression Testing

Functional testing verifies _if_ it works; Visual Regression Testing verifies _how it looks_. Playwright can take screenshots of your pages or components and compare them pixel-by-pixel against a baseline image.

- **API:** `await expect(page).toHaveScreenshot('landing-page.png')`
- **Workflow:** The first time you run this, it will fail because there is no baseline. Playwright creates the baseline image. On subsequent runs, it compares the new screenshot to the baseline. If they differ (e.g., a button moved, a font changed), the test fails and generates a visual diff.

### 5.3. Artifact Collection & Reporters

When tests run in headless mode on a CI server and fail, you cannot physically see the screen. Playwright automatically collects debugging artifacts based on your `playwright.config.ts` configuration.

- **Traces:** The ultimate debugging tool (captures DOM state, network, console logs).
- **Videos:** Records a video of the test execution.
- **Screenshots:** Captures the screen exactly when an assertion fails.
- **Reporters:** Playwright includes a built-in `html` reporter that bundles all these artifacts into a beautiful, interactive web page.

### 5.4. CI/CD Integration (GitHub Actions)

A framework is useless if it only runs on your local machine. Integrating Playwright into GitHub Actions (or GitLab CI, Jenkins) ensures your tests run automatically on every Pull Request or code push. Playwright runs in `headless` mode (no UI) during CI to maximize performance.

### 5.5. Practical Exercises

#### Exercise 1: Visual Regression Testing

Create a new file `tests/phase5-visual-regression.spec.ts`. We will use the Playwright homepage to detect UI changes.

```typescript
import { test, expect } from "@playwright/test";

test.describe("Visual Regression Testing", () => {
  test("Verify Playwright Homepage UI remains intact", async ({ page }) => {
    await page.goto("https://playwright.dev/");

    // Wait for the page to be fully loaded and animations to settle
    await page.waitForLoadState("networkidle");

    // Best Practice: Mask dynamic content (like version numbers or moving carousels)
    // to prevent false positives in image comparison
    // We will mask the main header text just as an example of the capability
    await expect(page).toHaveScreenshot("playwright-homepage.png", {
      mask: [page.locator(".hero__title")],
      maxDiffPixels: 100, // Allow a tiny margin of error (e.g., anti-aliasing differences)
    });
  });
});
```

_Note: Run `npx playwright test tests/phase5-visual-regression.spec.ts` twice. The first run creates the baseline image. The second run performs the actual comparison._

#### Exercise 2: Fully Parallel Execution

Create a new file `tests/phase5-parallel-execution.spec.ts` to demonstrate forcing parallel execution within a single file.

```typescript
import { test, expect } from "@playwright/test";

// Best Practice: Opt-in to fully parallel mode for this specific test suite
test.describe.configure({ mode: "parallel" });

test.describe("Parallel Tests Block", () => {
  test("Independent Test 1: Navigation", async ({ page }) => {
    await page.goto("https://playwright.dev/");
    await expect(page).toHaveTitle(/Playwright/);
  });

  test("Independent Test 2: Search UI", async ({ page }) => {
    await page.goto("https://playwright.dev/");
    const searchBtn = page.getByRole("button", { name: "Search" });
    await expect(searchBtn).toBeVisible();
  });

  test("Independent Test 3: Footer Links", async ({ page }) => {
    await page.goto("https://playwright.dev/");
    const gitHubLink = page.getByRole("link", { name: "GitHub repository" });
    await expect(gitHubLink).toBeVisible();
  });
});
```

#### Exercise 3: Enterprise CI/CD Pipeline with Sharding (GitHub Actions)

Running all tests on a single CI machine is a bottleneck. This advanced YAML uses GitHub Actions' `matrix` strategy to spin up 3 separate machines simultaneously (sharding), and a final job to merge their reports.

Create exactly at this path: `.github/workflows/playwright.yml`.

```yaml
name: Playwright Enterprise Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # 1. THE TEST JOB (Runs on multiple machines in parallel)
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shardIndex: [1, 2, 3]
        shardTotal: [3]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests (Sharded)
        # This command uses the matrix variables to split the workload
        run: npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}

      - name: Upload blob report to GitHub Actions Artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: blob-report-${{ matrix.shardIndex }}
          path: blob-report
          retention-days: 1

  # 2. THE MERGE JOB (Runs only after all test machines finish)
  merge-reports:
    if: always()
    needs: [test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Install dependencies
        run: npm ci

      - name: Download all blob reports from previous jobs
        uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true

      - name: Merge into single HTML Report
        run: npx playwright merge-reports --reporter html ./all-blob-reports

      - name: Upload Unified HTML Report
        uses: actions/upload-artifact@v4
        with:
          name: playwright-unified-report
          path: playwright-report
          retention-days: 14
```
