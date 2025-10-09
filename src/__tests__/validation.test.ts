import {
  validateCategory,
  validateProduct,
  validateProductsData,
  formatValidationErrors,
  validationUtils,
} from "@/lib/validation";

describe("API Validation", () => {
  describe("validateCategory", () => {
    test("should validate valid category", () => {
      const category = {
        id: "test_category",
        name: "Test Category",
        description: "A test category",
        products: [],
      };

      const result = validateCategory(category);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should accept category with valid ID format including dashes", () => {
      const category = {
        id: "test-category_123", // Valid characters including dash
        name: "Test Category",
        description: "A test category",
        products: [],
      };

      const result = validateCategory(category);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject category with invalid ID format", () => {
      const category = {
        id: "Test Category!", // Invalid characters
        name: "Test Category",
        description: "A test category",
        products: [],
      };

      const result = validateCategory(category);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "category-id",
          code: "INVALID_FORMAT",
        })
      );
    });

    test("should reject category with name too long", () => {
      const category = {
        id: "test_category",
        name: "A".repeat(101), // Exceeds 100 character limit
        description: "A test category",
        products: [],
      };

      const result = validateCategory(category);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "category-name",
          code: "MAX_LENGTH",
        })
      );
    });

    test("should reject category with missing required fields", () => {
      const category = {
        id: "",
        name: "",
        description: "",
      };

      const result = validateCategory(category);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("validateProduct", () => {
    test("should validate valid product", () => {
      const product = {
        id: "test_product",
        name: "Test Product",
        description: "A test product",
        image: "/assets/test.svg",
        features: ["Feature 1", "Feature 2"],
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should accept product with valid ID format including dashes", () => {
      const product = {
        id: "test-product_123", // Valid characters including dash
        name: "Test Product",
        description: "A test product",
        features: [],
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject product with invalid ID format", () => {
      const product = {
        id: "Test Product!", // Invalid characters
        name: "Test Product",
        description: "A test product",
        features: [],
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "product-id",
          code: "INVALID_FORMAT",
        })
      );
    });

    test("should reject product with description too long", () => {
      const product = {
        id: "test_product",
        name: "Test Product",
        description: "A".repeat(1001), // Exceeds 1000 character limit
        features: [],
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "product-description",
          code: "MAX_LENGTH",
        })
      );
    });

    test("should reject product with features text too long", () => {
      const longFeature = "A".repeat(2001); // Exceeds 2000 character limit
      const product = {
        id: "test_product",
        name: "Test Product",
        description: "A test product",
        features: [longFeature],
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "features",
          code: "MAX_LENGTH",
        })
      );
    });

    test("should reject product with empty features", () => {
      const product = {
        id: "test_product",
        name: "Test Product",
        description: "A test product",
        features: ["Valid feature", "", "Another valid feature"], // Empty feature
      };

      const result = validateProduct(product);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "features[1]",
          code: "REQUIRED",
        })
      );
    });
  });

  describe("validateProductsData", () => {
    test("should validate valid products data", () => {
      const data = {
        categories: [
          {
            id: "category1",
            name: "Category 1",
            description: "First category",
            products: [
              {
                id: "product1",
                name: "Product 1",
                description: "First product",
                image: "/assets/product1.svg",
                features: ["Feature 1", "Feature 2"],
              },
            ],
          },
        ],
      };

      const result = validateProductsData(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject data with duplicate category IDs", () => {
      const data = {
        categories: [
          {
            id: "duplicate_id",
            name: "Category 1",
            description: "First category",
            products: [],
          },
          {
            id: "duplicate_id", // Duplicate ID
            name: "Category 2",
            description: "Second category",
            products: [],
          },
        ],
      };

      const result = validateProductsData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "categories[1].id",
          code: "DUPLICATE",
        })
      );
    });

    test("should reject data with duplicate product IDs within category", () => {
      const data = {
        categories: [
          {
            id: "category1",
            name: "Category 1",
            description: "First category",
            products: [
              {
                id: "duplicate_product",
                name: "Product 1",
                description: "First product",
                features: [],
              },
              {
                id: "duplicate_product", // Duplicate ID
                name: "Product 2",
                description: "Second product",
                features: [],
              },
            ],
          },
        ],
      };

      const result = validateProductsData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "categories[0].products[1].id",
          code: "DUPLICATE",
        })
      );
    });

    test("should reject invalid data structure", () => {
      const data = {
        // Missing categories array
      };

      const result = validateProductsData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "categories",
          code: "REQUIRED",
        })
      );
    });
  });

  describe("formatValidationErrors", () => {
    test("should format validation errors correctly", () => {
      const errors = [
        { field: "name", message: "Name is required", code: "REQUIRED" },
        { field: "name", message: "Name too long", code: "MAX_LENGTH" },
        {
          field: "description",
          message: "Description is required",
          code: "REQUIRED",
        },
      ];

      const formatted = formatValidationErrors(errors);

      expect(formatted).toEqual({
        message: "Validation failed",
        errors: {
          name: [
            { message: "Name is required", code: "REQUIRED" },
            { message: "Name too long", code: "MAX_LENGTH" },
          ],
          description: [
            { message: "Description is required", code: "REQUIRED" },
          ],
        },
      });
    });
  });
});

// Character limit validation tests
describe("Character Limits", () => {
  test("category ID should be limited to 50 characters", () => {
    const category = {
      id: "a".repeat(51), // 51 characters
      name: "Test",
      description: "Test",
      products: [],
    };

    const result = validateCategory(category);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: "category-id",
        code: "MAX_LENGTH",
      })
    );
  });

  test("category name should be limited to 100 characters", () => {
    const category = {
      id: "test",
      name: "a".repeat(101), // 101 characters
      description: "Test",
      products: [],
    };

    const result = validateCategory(category);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: "category-name",
        code: "MAX_LENGTH",
      })
    );
  });

  test("category description should be limited to 500 characters", () => {
    const category = {
      id: "test",
      name: "Test",
      description: "a".repeat(501), // 501 characters
      products: [],
    };

    const result = validateCategory(category);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: "category-description",
        code: "MAX_LENGTH",
      })
    );
  });

  test("product description should be limited to 1000 characters", () => {
    const product = {
      id: "test",
      name: "Test",
      description: "a".repeat(1001), // 1001 characters
      features: [],
    };

    const result = validateProduct(product);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: "product-description",
        code: "MAX_LENGTH",
      })
    );
  });

  test("product features should be limited to 2000 characters total", () => {
    const product = {
      id: "test",
      name: "Test",
      description: "Test",
      features: ["a".repeat(2001)], // 2001 characters
    };

    const result = validateProduct(product);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        field: "features",
        code: "MAX_LENGTH",
      })
    );
  });
});

describe("Validation Helper Functions", () => {
  describe("validationUtils", () => {
    describe("cleanId", () => {
      test("should trim whitespace and convert to lowercase", () => {
        expect(validationUtils.cleanId("  SIMPLE-SAVER  ")).toBe(
          "simple-saver"
        );
        expect(validationUtils.cleanId("CASH_ISA")).toBe("cash_isa");
        expect(validationUtils.cleanId("  test123  ")).toBe("test123");
        expect(validationUtils.cleanId("  Mixed_Case-ID  ")).toBe(
          "mixed_case-id"
        );
      });

      test("should handle empty and null-like values", () => {
        expect(validationUtils.cleanId("")).toBe("");
        expect(validationUtils.cleanId("   ")).toBe("");
      });

      test("should preserve valid lowercase IDs", () => {
        expect(validationUtils.cleanId("valid-id")).toBe("valid-id");
        expect(validationUtils.cleanId("simple_saver")).toBe("simple_saver");
        expect(validationUtils.cleanId("test123")).toBe("test123");
      });
    });

    describe("isValidIdFormat", () => {
      test("should accept valid ID formats", () => {
        expect(validationUtils.isValidIdFormat("simple-saver")).toBe(true);
        expect(validationUtils.isValidIdFormat("cash_isa")).toBe(true);
        expect(validationUtils.isValidIdFormat("test123")).toBe(true);
        expect(validationUtils.isValidIdFormat("a")).toBe(true);
        expect(validationUtils.isValidIdFormat("123")).toBe(true);
      });

      test("should accept empty string", () => {
        expect(validationUtils.isValidIdFormat("")).toBe(true);
      });

      test("should clean and validate mixed case input", () => {
        expect(validationUtils.isValidIdFormat("  SIMPLE-SAVER  ")).toBe(true);
        expect(validationUtils.isValidIdFormat("CASH_ISA")).toBe(true);
        expect(validationUtils.isValidIdFormat("  Mixed_Case  ")).toBe(true);
      });

      test("should reject invalid characters after cleaning", () => {
        expect(validationUtils.isValidIdFormat("simple saver")).toBe(false); // spaces
        expect(validationUtils.isValidIdFormat("simple@saver")).toBe(false); // special chars
        expect(validationUtils.isValidIdFormat("simple.saver")).toBe(false); // periods
        expect(validationUtils.isValidIdFormat("simple/saver")).toBe(false); // slashes
      });

      test("should handle edge cases", () => {
        expect(validationUtils.isValidIdFormat("-")).toBe(true); // single dash
        expect(validationUtils.isValidIdFormat("_")).toBe(true); // single underscore
        expect(validationUtils.isValidIdFormat("a-b_c123")).toBe(true); // mixed valid chars
      });
    });

    describe("getIdFormatError", () => {
      test("should return formatted error message with field name", () => {
        const categoryError = validationUtils.getIdFormatError("category-id");
        expect(categoryError).toBe(
          "category-id can only contain lowercase letters, numbers, underscores, and dashes"
        );

        const productError = validationUtils.getIdFormatError("product-id");
        expect(productError).toBe(
          "product-id can only contain lowercase letters, numbers, underscores, and dashes"
        );
      });

      test("should work with any field name", () => {
        const customError = validationUtils.getIdFormatError("Custom Field");
        expect(customError).toBe(
          "Custom Field can only contain lowercase letters, numbers, underscores, and dashes"
        );
      });
    });

    describe("limits", () => {
      test("should provide correct character limits", () => {
        expect(validationUtils.limits.CATEGORY_ID).toBe(50);
        expect(validationUtils.limits.CATEGORY_NAME).toBe(100);
        expect(validationUtils.limits.CATEGORY_DESCRIPTION).toBe(500);
        expect(validationUtils.limits.PRODUCT_ID).toBe(50);
        expect(validationUtils.limits.PRODUCT_NAME).toBe(100);
        expect(validationUtils.limits.PRODUCT_DESCRIPTION).toBe(1000);
        expect(validationUtils.limits.PRODUCT_FEATURES).toBe(2000);
      });
    });

    describe("idPattern", () => {
      test("should match valid ID patterns", () => {
        expect(validationUtils.idPattern.test("simple-saver")).toBe(true);
        expect(validationUtils.idPattern.test("cash_isa")).toBe(true);
        expect(validationUtils.idPattern.test("test123")).toBe(true);
        expect(validationUtils.idPattern.test("a")).toBe(true);
      });

      test("should reject invalid ID patterns", () => {
        expect(validationUtils.idPattern.test("Simple-Saver")).toBe(false); // uppercase
        expect(validationUtils.idPattern.test("simple saver")).toBe(false); // space
        expect(validationUtils.idPattern.test("simple@saver")).toBe(false); // special char
        expect(validationUtils.idPattern.test("")).toBe(false); // empty string
      });
    });
  });
});

describe("Internal Helper Functions", () => {
  // Note: These are internal functions but we can test them indirectly through the main validation functions

  describe("validateStringLength behavior", () => {
    test("should validate required fields through validateCategory", () => {
      const categoryWithEmptyId = {
        id: "",
        name: "Test",
        description: "Test description",
      };

      const result = validateCategory(categoryWithEmptyId);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "category-id",
          code: "REQUIRED",
        })
      );
    });

    test("should validate max length through validateCategory", () => {
      const categoryWithLongId = {
        id: "a".repeat(51), // Exceeds 50 char limit
        name: "Test",
        description: "Test description",
      };

      const result = validateCategory(categoryWithLongId);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "category-id",
          code: "MAX_LENGTH",
        })
      );
    });
  });

  describe("validateId behavior", () => {
    test("should validate ID format through validateProduct", () => {
      const productWithInvalidId = {
        id: "Invalid ID!",
        name: "Test Product",
        description: "Test description",
      };

      const result = validateProduct(productWithInvalidId);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: "product-id",
          code: "INVALID_FORMAT",
        })
      );
    });

    test("should accept valid ID formats through validation", () => {
      const productWithValidId = {
        id: "valid-product_123",
        name: "Test Product",
        description: "Test description",
      };

      const result = validateProduct(productWithValidId);
      // Should not have INVALID_FORMAT error
      const formatErrors = result.errors.filter(
        (e) => e.code === "INVALID_FORMAT"
      );
      expect(formatErrors).toHaveLength(0);
    });
  });
});
