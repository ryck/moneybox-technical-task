import { Category, Product } from "@/types/products";

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Character limits matching frontend
const LIMITS = {
  CATEGORY_ID: 50,
  CATEGORY_NAME: 100,
  CATEGORY_DESCRIPTION: 500,
  PRODUCT_ID: 50,
  PRODUCT_NAME: 100,
  PRODUCT_DESCRIPTION: 1000,
  PRODUCT_FEATURES: 2000,
} as const;

// Helper function to validate string length
function validateStringLength(
  value: string,
  fieldName: string,
  maxLength: number,
  required: boolean = true
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (required && (!value || value.trim().length === 0)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required`,
      code: "REQUIRED",
    });
    return errors;
  }

  if (value?.length > maxLength) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be ${maxLength} characters or less`,
      code: "MAX_LENGTH",
    });
  }

  return errors;
}

// Helper function to validate ID format
function validateId(id: string, fieldName: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // ID should only contain lowercase letters, numbers, underscores, and dashes
  const idPattern = /^[a-z0-9_-]+$/;
  if (id && !idPattern.test(id)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} can only contain lowercase letters, numbers, underscores, and dashes`,
      code: "INVALID_FORMAT",
    });
  }

  return errors;
}

// Export utilities for UI validation
export const validationUtils = {
  // ID pattern for client-side validation
  idPattern: /^[a-z0-9_-]+$/,

  // Check if ID format is valid
  isValidIdFormat: (id: string): boolean => {
    if (!id) return true;
    const cleanId = id.trim().toLowerCase();
    return /^[a-z0-9_-]+$/.test(cleanId);
  },

  // Get ID validation error message
  getIdFormatError: (fieldName: string): string => {
    return `${fieldName} can only contain lowercase letters, numbers, underscores, and dashes`;
  },

  // Clean and format ID (trim and lowercase)
  cleanId: (id: string): string => {
    return id.trim().toLowerCase();
  },

  // Character limits for UI
  limits: LIMITS,
};

// Validate category data
export function validateCategory(
  category: Partial<Category>
): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate ID
  errors.push(
    ...validateStringLength(
      category.id || "",
      "category-id",
      LIMITS.CATEGORY_ID
    )
  );
  errors.push(...validateId(category.id || "", "category-id"));

  // Validate name
  errors.push(
    ...validateStringLength(
      category.name || "",
      "category-name",
      LIMITS.CATEGORY_NAME
    )
  );

  // Validate description
  errors.push(
    ...validateStringLength(
      category.description || "",
      "category-description",
      LIMITS.CATEGORY_DESCRIPTION
    )
  );

  // Validate products array
  if (category.products !== undefined && !Array.isArray(category.products)) {
    errors.push({
      field: "products",
      message: "Products must be an array",
      code: "INVALID_TYPE",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate product data
export function validateProduct(product: Partial<Product>): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate ID
  errors.push(
    ...validateStringLength(product.id || "", "product-id", LIMITS.PRODUCT_ID)
  );
  errors.push(...validateId(product.id || "", "product-id"));

  // Validate name
  errors.push(
    ...validateStringLength(
      product.name || "",
      "product-name",
      LIMITS.PRODUCT_NAME
    )
  );

  // Validate description
  errors.push(
    ...validateStringLength(
      product.description || "",
      "product-description",
      LIMITS.PRODUCT_DESCRIPTION
    )
  );

  // Validate image path (optional)
  if (product.image !== undefined && typeof product.image !== "string") {
    errors.push({
      field: "image",
      message: "Image path must be a string",
      code: "INVALID_TYPE",
    });
  }

  // Validate features
  if (product.features !== undefined) {
    if (!Array.isArray(product.features)) {
      errors.push({
        field: "features",
        message: "Features must be an array",
        code: "INVALID_TYPE",
      });
    } else {
      // Check total length of features text
      const featuresText = product.features?.join("\n") || "";
      if (featuresText.length > LIMITS.PRODUCT_FEATURES) {
        errors.push({
          field: "features",
          message: `Features text must be ${LIMITS.PRODUCT_FEATURES} characters or less`,
          code: "MAX_LENGTH",
        });
      }

      // Validate each feature
      product.features?.forEach((feature, index) => {
        if (typeof feature !== "string") {
          errors.push({
            field: `features[${index}]`,
            message: `Feature ${index + 1} must be a string`,
            code: "INVALID_TYPE",
          });
        } else if (feature.trim().length === 0) {
          errors.push({
            field: `features[${index}]`,
            message: `Feature ${index + 1} cannot be empty`,
            code: "REQUIRED",
          });
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Validate complete products data structure
export function validateProductsData(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  // Check top-level structure
  if (!data || typeof data !== "object") {
    errors.push({
      field: "data",
      message: "Data must be an object",
      code: "INVALID_TYPE",
    });
    return { isValid: false, errors };
  }

  const dataObj = data as Record<string, unknown>;

  if (!dataObj.categories || !Array.isArray(dataObj.categories)) {
    errors.push({
      field: "categories",
      message: "Categories array is required",
      code: "REQUIRED",
    });
    return { isValid: false, errors };
  }

  // Validate each category
  const categoryIds = new Set<string>();
  dataObj.categories.forEach((category: unknown, categoryIndex: number) => {
    const categoryObj = category as Partial<Category>;
    const categoryValidation = validateCategory(categoryObj);

    // Add field prefixes for better error reporting
    categoryValidation.errors.forEach((error) => {
      errors.push({
        ...error,
        field: `categories[${categoryIndex}].${error.field}`,
      });
    });

    // Check for duplicate category IDs
    if (categoryObj.id) {
      if (categoryIds.has(categoryObj.id)) {
        errors.push({
          field: `categories[${categoryIndex}].id`,
          message: `Duplicate category ID: ${categoryObj.id}`,
          code: "DUPLICATE",
        });
      } else {
        categoryIds.add(categoryObj.id);
      }
    }

    // Validate products in this category
    if (Array.isArray(categoryObj.products)) {
      const productIds = new Set<string>();
      categoryObj.products.forEach((product: unknown, productIndex: number) => {
        const productObj = product as Partial<Product>;
        const productValidation = validateProduct(productObj);

        // Add field prefixes for better error reporting
        productValidation.errors.forEach((error) => {
          errors.push({
            ...error,
            field: `categories[${categoryIndex}].products[${productIndex}].${error.field}`,
          });
        });

        // Check for duplicate product IDs within category
        if (productObj.id) {
          if (productIds.has(productObj.id)) {
            errors.push({
              field: `categories[${categoryIndex}].products[${productIndex}].id`,
              message: `Duplicate product ID in category: ${productObj.id}`,
              code: "DUPLICATE",
            });
          } else {
            productIds.add(productObj.id);
          }
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper function to format validation errors for API response
export function formatValidationErrors(errors: ValidationError[]) {
  return {
    message: "Validation failed",
    errors: errors.reduce(
      (acc, error) => {
        if (!acc[error.field]) {
          acc[error.field] = [];
        }
        acc[error.field].push({
          message: error.message,
          code: error.code,
        });
        return acc;
      },
      {} as Record<string, Array<{ message: string; code: string }>>
    ),
  };
}
