#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function validateProductsJSON() {
  const filePath = path.join(__dirname, "../src/data/products.json");

  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Check top-level structure
    if (!data.categories || !Array.isArray(data.categories)) {
      throw new Error('Missing or invalid "categories" array');
    }

    // Validate each category
    data.categories.forEach((category, categoryIndex) => {
      if (!category.id || typeof category.id !== "string") {
        throw new Error(`Category ${categoryIndex}: Missing or invalid "id"`);
      }

      if (!category.name || typeof category.name !== "string") {
        throw new Error(`Category ${categoryIndex}: Missing or invalid "name"`);
      }

      if (!category.description || typeof category.description !== "string") {
        throw new Error(
          `Category ${categoryIndex}: Missing or invalid "description"`
        );
      }

      if (!category.products || !Array.isArray(category.products)) {
        throw new Error(
          `Category ${categoryIndex}: Missing or invalid "products" array`
        );
      }

      // Validate each product
      category.products.forEach((product, productIndex) => {
        if (!product.id || typeof product.id !== "string") {
          throw new Error(
            `Category ${categoryIndex}, Product ${productIndex}: Missing or invalid "id"`
          );
        }

        if (!product.name || typeof product.name !== "string") {
          throw new Error(
            `Category ${categoryIndex}, Product ${productIndex}: Missing or invalid "name"`
          );
        }

        if (!product.description || typeof product.description !== "string") {
          throw new Error(
            `Category ${categoryIndex}, Product ${productIndex}: Missing or invalid "description"`
          );
        }

        if (!product.image || typeof product.image !== "string") {
          throw new Error(
            `Category ${categoryIndex}, Product ${productIndex}: Missing or invalid "image"`
          );
        }

        if (!product.features || !Array.isArray(product.features)) {
          throw new Error(
            `Category ${categoryIndex}, Product ${productIndex}: Missing or invalid "features" array`
          );
        }

        // Check if image file exists
        const imagePath = path.join(__dirname, "../public", product.image);
        if (!fs.existsSync(imagePath)) {
          console.warn(`Warning: Image file not found: ${product.image}`);
        }
      });
    });

    console.log("✅ Products JSON validation passed!");
    console.log(
      `📊 Found ${
        data.categories.length
      } categories with ${data.categories.reduce(
        (sum, cat) => sum + cat.products.length,
        0
      )} total products`
    );

    return true;
  } catch (error) {
    console.error("❌ Products JSON validation failed:");
    console.error(error.message);
    return false;
  }
}

if (require.main === module) {
  const isValid = validateProductsJSON();
  process.exit(isValid ? 0 : 1);
}

module.exports = validateProductsJSON;
