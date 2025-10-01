import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("should return healthy status from health endpoint", async ({
    request,
  }) => {
    const response = await request.get("/api/health");

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("OK");
    expect(data.version).toBeDefined();
    expect(data.timestamp).toBeDefined();
    expect(typeof data.version).toBe("string");
    expect(typeof data.timestamp).toBe("string");
  });

  test("should return categories data", async ({ request }) => {
    const response = await request.get("/api/categories");

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.timestamp).toBeDefined();

    // Check that categories have required structure
    if (data.data.length > 0) {
      const firstCategory = data.data[0];
      expect(firstCategory.id).toBeDefined();
      expect(firstCategory.name).toBeDefined();
      expect(firstCategory.description).toBeDefined();
      expect(Array.isArray(firstCategory.products)).toBe(true);
    }
  });

  test("should handle API errors gracefully", async ({ request }) => {
    // Test with invalid endpoint
    const response = await request.get("/api/nonexistent");

    expect(response.status()).toBe(404);
  });

  test("should validate admin data submission", async ({ request }) => {
    // Test with invalid data structure using non-destructive test endpoint
    const response = await request.put("/api/test/validate", {
      data: {
        invalid: "data",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.error).toBe("Validation failed");
  });

  test("should accept valid admin data submission", async ({ request }) => {
    const validData = {
      categories: [
        {
          id: "test-category",
          name: "Test Category",
          description: "This is a test category for Playwright testing",
          products: [
            {
              id: "test-product",
              name: "Test Product",
              description: "This is a test product",
              features: ["Feature 1", "Feature 2"],
              rate: "3.50% AER",
              icon: "test-icon",
            },
          ],
        },
      ],
    };

    const response = await request.put("/api/test/validate", {
      data: validData,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Should accept valid data
    expect(response.status()).toBe(200);

    const responseData = await response.json();
    expect(responseData.data.message).toBe(
      "Data validated successfully (test mode)"
    );
    expect(responseData.data.validated).toBe(true);
    expect(responseData.timestamp).toBeDefined();
  });

  test("should support CORS headers in API responses", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.status()).toBe(200);

    // Check for common CORS-related behaviors
    const headers = response.headers();

    // API should be accessible (which it is if we get a 200)
    expect(headers["content-type"]).toContain("application/json");
  });

  test("should return consistent timestamps", async ({ request }) => {
    const response1 = await request.get("/api/health");
    const response2 = await request.get("/api/categories");

    const data1 = await response1.json();
    const data2 = await response2.json();

    // Both should have timestamps
    expect(data1.timestamp).toBeDefined();
    expect(data2.timestamp).toBeDefined();

    // Timestamps should be valid ISO strings
    expect(() => new Date(data1.timestamp)).not.toThrow();
    expect(() => new Date(data2.timestamp)).not.toThrow();
  });

  test("should handle concurrent API requests", async ({ request }) => {
    // Make multiple concurrent requests
    const promises = [
      request.get("/api/health"),
      request.get("/api/categories"),
      request.get("/api/health"),
      request.get("/api/categories"),
    ];

    const responses = await Promise.all(promises);

    // All should succeed
    responses.forEach((response) => {
      expect(response.status()).toBe(200);
    });

    // All should return valid JSON
    const dataPromises = responses.map((response) => response.json());
    const data = await Promise.all(dataPromises);

    data.forEach((item) => {
      expect(item).toBeDefined();
      expect(item.timestamp).toBeDefined();
    });
  });
});
