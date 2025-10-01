import { NextRequest, NextResponse } from "next/server";
import { Category, Product } from "@/types/products";
import { validateProduct, formatValidationErrors } from "@/lib/validation";
import fs from "fs";
import path from "path";

// Default empty data structure
const defaultData = { categories: [] };

// Helper function to read products data
function readProductsData() {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "products.json");
    if (!fs.existsSync(filePath)) {
      return defaultData;
    }
    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch {
    return defaultData;
  }
}

// Helper function to write products data
function writeProductsData(data: unknown) {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "products.json");
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, "utf8");
  } catch (error) {
    throw new Error(
      `Failed to write products data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoryId: string; productId: string }> }
) {
  try {
    const { categoryId, productId } = await params;
    const data = readProductsData();
    const category = data.categories.find(
      (cat: Category) => cat.id === categoryId
    );

    if (!category) {
      return NextResponse.json(
        {
          error: "Category not found",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const product = category.products.find(
      (prod: Product) => prod.id === productId
    );

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found",
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: product,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch product",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// PUT - Update a specific product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string; productId: string }> }
) {
  try {
    const { categoryId, productId } = await params;
    const body = await request.json();

    // Validate the product data
    const validation = validateProduct(body);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: formatValidationErrors(validation.errors),
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Check if the ID in the body matches the URL parameter
    if (body.id && body.id !== productId) {
      return NextResponse.json(
        {
          error: "ID mismatch",
          message: "Product ID in request body must match the URL parameter",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const updatedProduct: Product = {
      id: productId,
      name: body.name,
      description: body.description,
      image: body.image || "",
      features: body.features || [],
    };

    // Read existing data
    const data = readProductsData();

    // Find the category
    const categoryIndex = data.categories.findIndex(
      (cat: Category) => cat.id === categoryId
    );
    if (categoryIndex === -1) {
      return NextResponse.json(
        {
          error: "Category not found",
          message: `No category found with ID '${categoryId}'`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Find and update the product
    const productIndex = data.categories[categoryIndex].products.findIndex(
      (prod: Product) => prod.id === productId
    );
    if (productIndex === -1) {
      return NextResponse.json(
        {
          error: "Product not found",
          message: `No product found with ID '${productId}' in category '${categoryId}'`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    data.categories[categoryIndex].products[productIndex] = updatedProduct;

    // Write back to file
    writeProductsData(data);

    return NextResponse.json({
      data: updatedProduct,
      message: "Product updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update product",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ categoryId: string; productId: string }> }
) {
  try {
    const { categoryId, productId } = await params;

    // Read existing data
    const data = readProductsData();

    // Find the category
    const categoryIndex = data.categories.findIndex(
      (cat: Category) => cat.id === categoryId
    );
    if (categoryIndex === -1) {
      return NextResponse.json(
        {
          error: "Category not found",
          message: `No category found with ID '${categoryId}'`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Find and remove the product
    const productIndex = data.categories[categoryIndex].products.findIndex(
      (prod: Product) => prod.id === productId
    );
    if (productIndex === -1) {
      return NextResponse.json(
        {
          error: "Product not found",
          message: `No product found with ID '${productId}' in category '${categoryId}'`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Remove the product
    const deletedProduct = data.categories[categoryIndex].products.splice(
      productIndex,
      1
    )[0];

    // Write back to file
    writeProductsData(data);

    return NextResponse.json({
      data: deletedProduct,
      message: "Product deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete product",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
