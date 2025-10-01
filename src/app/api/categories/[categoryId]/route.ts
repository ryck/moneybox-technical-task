import { NextRequest, NextResponse } from "next/server";
import { Category } from "@/types/products";
import { validateCategory, formatValidationErrors } from "@/lib/validation";
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
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
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

    return NextResponse.json({
      data: category,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch category",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// PUT - Update a specific category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const body = await request.json();

    // Validate the category data
    const validation = validateCategory(body);

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
    if (body.id && body.id !== categoryId) {
      return NextResponse.json(
        {
          error: "ID mismatch",
          message: "Category ID in request body must match the URL parameter",
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const updatedCategory: Category = {
      id: categoryId,
      name: body.name,
      description: body.description,
      products: body.products || [],
    };

    // Read existing data
    const data = readProductsData();

    // Find and update the category
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

    data.categories[categoryIndex] = updatedCategory;

    // Write back to file
    writeProductsData(data);

    return NextResponse.json({
      data: updatedCategory,
      message: "Category updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update category",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;

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

    // Remove the category
    const deletedCategory = data.categories.splice(categoryIndex, 1)[0];

    // Write back to file
    writeProductsData(data);

    return NextResponse.json({
      data: deletedCategory,
      message: "Category deleted successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete category",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
