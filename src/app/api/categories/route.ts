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

export async function GET() {
  try {
    const data = readProductsData();
    return NextResponse.json({
      data: data.categories,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
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

    const newCategory: Category = {
      id: body.id,
      name: body.name,
      description: body.description,
      products: body.products || [],
    };

    // Read existing data
    const data = readProductsData();

    // Check for duplicate category ID
    const existingCategory = data.categories.find(
      (cat: Category) => cat.id === newCategory.id
    );
    if (existingCategory) {
      return NextResponse.json(
        {
          error: "Category already exists",
          message: `A category with ID '${newCategory.id}' already exists`,
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Add the new category
    data.categories.push(newCategory);

    // Write back to file
    writeProductsData(data);

    return NextResponse.json(
      {
        data: newCategory,
        message: "Category created successfully",
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create category",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
