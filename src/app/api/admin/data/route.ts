import { NextRequest, NextResponse } from "next/server";
import { ProductsData } from "@/types/products";
import { validateProductsData, formatValidationErrors } from "@/lib/validation";
import fs from "fs";
import path from "path";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Comprehensive validation using the validation utility
    const validation = validateProductsData(body);

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

    // Cast to ProductsData after validation
    const data: ProductsData = body;

    // Write to the JSON file
    const filePath = path.join(process.cwd(), "src", "data", "products.json");
    const jsonString = JSON.stringify(data, null, 2);

    fs.writeFileSync(filePath, jsonString, "utf8");

    return NextResponse.json({
      data: { message: "Data saved successfully" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "products.json");
    const fileContent = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContent);

    return NextResponse.json({
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error reading data:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to read data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
