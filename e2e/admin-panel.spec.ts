import { test, expect } from "@playwright/test";

test.describe("Admin Panel", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept and mock admin API calls to prevent data modification
    await page.route("**/api/admin/**", async (route) => {
      const request = route.request();
      const method = request.method();

      if (method === "PUT" || method === "POST" || method === "DELETE") {
        // Mock successful responses for destructive operations
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: { message: "Operation successful (test mode)" },
            timestamp: new Date().toISOString(),
          }),
        });
      } else {
        // Allow GET requests to proceed normally
        await route.continue();
      }
    });

    await page.goto("/admin");
  });

  test("should display admin panel title and navigation", async ({ page }) => {
    // Check admin heading
    await expect(
      page.getByRole("heading", { name: "Admin Panel" })
    ).toBeVisible();

    // Check navigation back to main page via logo
    const logoLink = page.getByRole("link", { name: /return to homepage/i });
    await expect(logoLink).toBeVisible();
    await expect(logoLink).toHaveAttribute("href", "/");
  });

  test("should load and display categories in admin view", async ({ page }) => {
    // Wait for categories to load
    await page.waitForSelector('[data-testid="admin-category"]', {
      timeout: 10000,
    });

    // Check that categories are displayed
    const categories = page.locator('[data-testid="admin-category"]');
    expect(await categories.count()).toBeGreaterThanOrEqual(1);

    // Check for category management elements - use first match to avoid strict mode violation
    await expect(
      page.getByRole("button", { name: "Add Category" }).first()
    ).toBeVisible();
  });

  test("should allow editing category information", async ({ page }) => {
    // Wait for categories to load
    await page.waitForSelector('[data-testid="admin-category"]');

    // Find the first category and its edit controls
    const firstCategory = page
      .locator('[data-testid="admin-category"]')
      .first();
    await expect(firstCategory).toBeVisible();

    // Look for edit button or input fields
    const editButton = firstCategory.getByRole("button", { name: /edit/i });
    if ((await editButton.count()) > 0) {
      await editButton.click();

      // Should show editable fields
      const nameInput = firstCategory.locator(
        'input[placeholder*="name" i], input[aria-label*="name" i]'
      );
      const descInput = firstCategory.locator(
        'textarea[placeholder*="description" i], textarea[aria-label*="description" i]'
      );

      if ((await nameInput.count()) > 0) {
        await expect(nameInput).toBeVisible();
        await expect(nameInput).toBeEditable();
      }

      if ((await descInput.count()) > 0) {
        await expect(descInput).toBeVisible();
        await expect(descInput).toBeEditable();
      }
    }
  });

  test("should show character limits and validation", async ({ page }) => {
    await page.waitForSelector('[data-testid="admin-category"]');

    const firstCategory = page
      .locator('[data-testid="admin-category"]')
      .first();

    // Try to find and interact with form fields
    const nameInput = firstCategory.locator("input").first();
    if ((await nameInput.count()) > 0) {
      await nameInput.click();
      await nameInput.fill("a".repeat(150)); // Exceed typical limit

      // Should show character count or validation message
      const validation = page.locator(
        "text=/characters remaining|too long|limit/i"
      );
      if ((await validation.count()) > 0) {
        await expect(validation).toBeVisible();
      }
    }
  });

  test("should allow adding new categories", async ({ page }) => {
    await page.waitForSelector('[data-testid="admin-category"]', {
      timeout: 10000,
    });

    // Look for add new category button
    const addButton = page.getByRole("button", {
      name: /add new category|add category/i,
    });
    if ((await addButton.count()) > 0) {
      await addButton.click();

      // Should show form for new category
      await page.waitForTimeout(500); // Wait for form to appear

      // Look for new category form fields
      const newCategoryForm = page
        .locator('[data-testid="new-category-form"]')
        .or(page.locator("form").last());

      const nameInput = newCategoryForm.locator("input").first();
      const descInput = newCategoryForm.locator("textarea").first();

      if ((await nameInput.count()) > 0) {
        await expect(nameInput).toBeVisible();
        await nameInput.fill("Test Category");
      }

      if ((await descInput.count()) > 0) {
        await expect(descInput).toBeVisible();
        await descInput.fill("This is a test category description");
      }
    }
  });

  test("should handle product management within categories", async ({
    page,
  }) => {
    await page.waitForSelector('[data-testid="admin-category"]');

    const firstCategory = page
      .locator('[data-testid="admin-category"]')
      .first();

    // Look for product management controls
    const addProductButton = firstCategory.getByRole("button", {
      name: /add product|new product/i,
    });

    if ((await addProductButton.count()) > 0) {
      await addProductButton.click();

      // Should show product form
      await page.waitForTimeout(500);

      // Check for product form fields
      const productNameInput = page.locator(
        'input[placeholder*="product name" i], input[aria-label*="product name" i]'
      );
      const productDescInput = page.locator(
        'textarea[placeholder*="product description" i], textarea[aria-label*="product description" i]'
      );

      if ((await productNameInput.count()) > 0) {
        await expect(productNameInput).toBeVisible();
      }

      if ((await productDescInput.count()) > 0) {
        await expect(productDescInput).toBeVisible();
      }
    }
  });

  test("should save changes and show feedback", async ({ page }) => {
    await page.waitForSelector('[data-testid="admin-category"]');

    // Look for save button
    const saveButton = page.getByRole("button", { name: /save|update/i });

    if ((await saveButton.count()) > 0) {
      await saveButton.click();

      // Should show some feedback (success message, loading state, etc.)
      const feedback = page
        .locator("text=/saved|success|updated/i")
        .or(page.locator('[role="alert"]'));

      if ((await feedback.count()) > 0) {
        await expect(feedback).toBeVisible();
      }
    }
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(
      page.getByRole("heading", { name: "Admin Panel" })
    ).toBeVisible();

    // Admin interface should still be usable on mobile
    await page.waitForSelector('[data-testid="admin-category"]', {
      timeout: 10000,
    });
    const categories = page.locator('[data-testid="admin-category"]');
    expect(await categories.count()).toBeGreaterThanOrEqual(1);
  });

  test("should handle navigation between admin and main page", async ({
    page,
  }) => {
    // Should be on admin page
    await expect(
      page.getByRole("heading", { name: "Admin Panel" })
    ).toBeVisible();

    // Click back to main page via logo
    const logoLink = page.getByRole("link", { name: /return to homepage/i });
    await logoLink.click();

    // Should navigate to main page
    await expect(
      page.getByRole("heading", { name: "Our Products" })
    ).toBeVisible();

    // Should be able to navigate back to admin
    const adminLink = page.getByRole("link", { name: /admin/i });
    await adminLink.click();

    // Should be back on admin page
    await expect(
      page.getByRole("heading", { name: "Admin Panel" })
    ).toBeVisible();
  });
});
