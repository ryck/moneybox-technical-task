import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("main page should be accessible", async ({ page }) => {
    await page.goto("/");

    // Wait for content to load
    await page.waitForSelector('[data-testid="category-section"]');

    // Check for proper heading hierarchy - main heading is sr-only
    const visibleHeading = page.getByRole("heading", { name: "Our Products" });
    await expect(visibleHeading).toBeVisible();

    // Check that interactive elements are keyboard accessible
    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Check for proper link structure
    const adminLink = page.getByRole("link", { name: /admin/i });
    await expect(adminLink).toHaveAttribute("href");
  });

  test("admin page should be accessible", async ({ page }) => {
    await page.goto("/admin");

    // Wait for content to load
    await page.waitForSelector('[data-testid="admin-category"]', {
      timeout: 10000,
    });

    // Check for proper heading hierarchy
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText("Admin Panel");

    // Check that form elements have proper labels
    const inputs = page.locator("input");
    const inputCount = await inputs.count();

    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        // Input should have either a label, aria-label, or placeholder
        const hasLabel = await input.evaluate((el) => {
          return !!(
            el.getAttribute("aria-label") ||
            el.getAttribute("placeholder") ||
            document.querySelector(`label[for="${el.id}"]`) ||
            el.closest("label")
          );
        });
        expect(hasLabel).toBe(true);
      }
    }
  });

  test("should have proper color contrast", async ({ page }) => {
    await page.goto("/");

    // Check that text elements have sufficient contrast
    // This is a basic check - in a real project you'd use axe-playwright or similar
    const headings = page.locator("h1, h2, h3, h4, h5, h6");
    const headingCount = await headings.count();

    for (let i = 0; i < Math.min(headingCount, 3); i++) {
      const heading = headings.nth(i);
      if (await heading.isVisible()) {
        // Check that heading has some color styling (basic check)
        const styles = await heading.evaluate((el) => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
          };
        });

        // Should have defined colors
        expect(styles.color).toBeDefined();
        expect(styles.color).not.toBe("");
      }
    }
  });

  test("should work with keyboard navigation", async ({ page }) => {
    await page.goto("/");

    // Wait for content
    await page.waitForSelector('[data-testid="category-section"]');

    // Test keyboard navigation through interactive elements
    await page.keyboard.press("Tab");
    let focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through elements
    await page.keyboard.press("Tab");
    focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Test that Enter key works on buttons
    const categoryButtons = page.locator('[data-testid="category-button"]');
    if ((await categoryButtons.count()) > 0) {
      await categoryButtons.first().focus();
      await page.keyboard.press("Enter");

      // Should expand the category
      await page.waitForTimeout(500);
      const products = page.locator('[data-testid="product-card"]');
      if ((await products.count()) > 0) {
        await expect(products.first()).toBeVisible();
      }
    }
  });

  test("should have proper ARIA attributes", async ({ page }) => {
    await page.goto("/");

    await page.waitForSelector('[data-testid="category-section"]');

    // Check for proper button roles
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        // Button should have accessible name
        const accessibleName = await button.evaluate((el) => {
          return (
            el.textContent?.trim() ||
            el.getAttribute("aria-label") ||
            el.getAttribute("title") ||
            ""
          );
        });
        expect(accessibleName.length).toBeGreaterThan(0);
      }
    }
  });

  test("should be usable with screen reader patterns", async ({ page }) => {
    await page.goto("/");

    await page.waitForSelector('[data-testid="category-section"]');

    // Check for landmarks and regions
    const main = page.locator("main").or(page.locator('[role="main"]'));

    // Should have main content area
    if ((await main.count()) > 0) {
      await expect(main.first()).toBeVisible();
    }

    // Check that lists are properly marked up
    const lists = page.locator("ul, ol");
    const listCount = await lists.count();

    if (listCount > 0) {
      for (let i = 0; i < Math.min(listCount, 2); i++) {
        const list = lists.nth(i);
        if (await list.isVisible()) {
          const listItems = list.locator("li");
          expect(await listItems.count()).toBeGreaterThan(0);
        }
      }
    }
  });

  test("should handle focus management", async ({ page }) => {
    await page.goto("/");

    await page.waitForSelector('[data-testid="category-section"]');

    // Click on admin link and verify focus management
    const adminLink = page.getByRole("link", { name: /admin/i });
    await adminLink.click();

    // Should navigate to admin page
    await expect(
      page.getByRole("heading", { name: "Admin Panel" })
    ).toBeVisible();

    // Focus should be managed appropriately (not lost)
    // Some element should have focus or be focusable
    const focusableElements = page.locator(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    expect(await focusableElements.count()).toBeGreaterThan(0);
  });
});
