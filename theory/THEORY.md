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
