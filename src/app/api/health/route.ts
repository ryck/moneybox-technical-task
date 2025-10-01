import { NextResponse } from "next/server";
import { HealthCheckResponse } from "@/types/products";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Read package.json to get version
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent);

    const healthData: HealthCheckResponse = {
      status: "OK",
      version: packageJson.version,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(healthData);
  } catch (error) {
    const errorResponse: HealthCheckResponse = {
      status: "ERROR",
      version: "unknown",
      error: error instanceof Error ? error.message : "Health check failed",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}
