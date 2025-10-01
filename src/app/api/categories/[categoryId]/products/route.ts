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

// POST - Create a new product in a category
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
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

    const newProduct: Product = {
      id: body.id,
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

    // Check for duplicate product ID within the category
    const existingProduct = data.categories[categoryIndex].products.find(
      (prod: Product) => prod.id === newProduct.id
    );
    if (existingProduct) {
      return NextResponse.json(
        {
          error: "Product already exists",
          message: `A product with ID '${newProduct.id}' already exists in this category`,
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // Add the new product to the category
    data.categories[categoryIndex].products.push(newProduct);

    // Write back to file
    writeProductsData(data);

    return NextResponse.json(
      {
        data: newProduct,
        message: "Product created successfully",
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create product",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
