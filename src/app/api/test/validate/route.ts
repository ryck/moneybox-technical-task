import { NextRequest, NextResponse } from "next/server";
import { validateProductsData, formatValidationErrors } from "@/lib/validation";

// Test endpoint that validates data without saving it
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

    // For testing, we just return success without actually saving
    return NextResponse.json({
      data: {
        message: "Data validated successfully (test mode)",
        validated: true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to validate data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Test validation endpoint - use PUT to validate data",
    timestamp: new Date().toISOString(),
  });
}
