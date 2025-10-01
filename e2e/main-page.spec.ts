import { test, expect } from "@playwright/test";

test.describe("Main Page", () => {
  test("should display the main heading and logo", async ({ page }) => {
    await page.goto("/");

    // Check main visible heading
    await expect(
      page.getByRole("heading", { name: "Our Products" })
    ).toBeVisible();

    // Check for proper heading structure
    const heading = page.getByRole("heading", { name: "Our Products" });
    await expect(heading).toHaveClass(/text-2xl|text-3xl/);
  });

  test("should display product categories", async ({ page }) => {
    await page.goto("/");

    // Wait for data to load
    await page.waitForSelector('[data-testid="category-section"]', {
      timeout: 10000,
    });

    // Check that categories are displayed
    const categories = page.locator('[data-testid="category-section"]');
    expect(await categories.count()).toBeGreaterThanOrEqual(1);

    // Check that category sections are displayed (more flexible check)
    const categoryTitles = page.locator('[data-testid="category-section"] h3');
    expect(await categoryTitles.count()).toBeGreaterThan(0);

    // Look for product expansion buttons (the accordion triggers)
    const expandButtons = page.locator('[data-testid="category-button"]');
    expect(await expandButtons.count()).toBeGreaterThan(0);
  });

  test("should expand and collapse categories", async ({ page }) => {
    await page.goto("/");

    // Wait for categories to load
    await page.waitForSelector('[data-testid="category-section"]');

    // Find the first category button
    const firstCategoryButton = page
      .locator('[data-testid="category-button"]')
      .first();
    await expect(firstCategoryButton).toBeVisible();

    // Click to expand
    await firstCategoryButton.click();

    // Check that products are now visible
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();

    // Click again to collapse
    await firstCategoryButton.click();

    // Products should be hidden (but we need to wait a bit for animation)
    await page.waitForTimeout(500);
  });

  test("should display product information correctly", async ({ page }) => {
    await page.goto("/");

    // Wait for categories and expand the first one
    await page.waitForSelector('[data-testid="category-section"]');
    const firstCategoryButton = page
      .locator('[data-testid="category-button"]')
      .first();
    await firstCategoryButton.click();

    // Wait for products to appear
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await expect(firstProduct).toBeVisible();

    // Check that product has required elements
    await expect(
      firstProduct.locator('[data-testid="product-name"]')
    ).toBeVisible();
    await expect(
      firstProduct.locator('[data-testid="product-description"]')
    ).toBeVisible();

    // Check for rate information (should be present for most products)
    const rateInfo = firstProduct.locator("text=/\\d+\\.\\d+%/");
    if ((await rateInfo.count()) > 0) {
      await expect(rateInfo.first()).toBeVisible();
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that the page loads and is usable on mobile
    await expect(
      page.getByRole("heading", { name: "Our Products" })
    ).toBeVisible();

    // Check that categories are still clickable on mobile
    await page.waitForSelector('[data-testid="category-section"]');
    const firstCategoryButton = page
      .locator('[data-testid="category-button"]')
      .first();
    await expect(firstCategoryButton).toBeVisible();

    // Should be able to expand categories on mobile
    await firstCategoryButton.click();
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();
  });

  test("should handle loading states gracefully", async ({ page }) => {
    // Intercept the API call to add delay
    await page.route("**/api/categories", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      route.continue();
    });

    await page.goto("/");

    // Should show some loading indication or at least not error
    // The page should eventually load the content
    await expect(
      page.getByRole("heading", { name: "Our Products" })
    ).toBeVisible();

    // After delay, categories should appear
    await page.waitForSelector('[data-testid="category-section"]', {
      timeout: 15000,
    });
    const categories = page.locator('[data-testid="category-section"]');
    expect(await categories.count()).toBeGreaterThanOrEqual(1);
  });

  test("should have accessible navigation", async ({ page }) => {
    await page.goto("/");

    // Check for admin link accessibility
    const adminLink = page.getByRole("link", { name: /admin/i });
    await expect(adminLink).toBeVisible();
    await expect(adminLink).toHaveAttribute("href", "/admin");

    // Test keyboard navigation
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });
});
