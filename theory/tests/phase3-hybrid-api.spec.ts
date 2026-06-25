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
