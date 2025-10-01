import { GET } from "@/app/api/health/route";

// Mock fs module
jest.mock("fs", () => ({
  readFileSync: jest.fn(),
}));

describe("/api/health", () => {
  beforeEach(async () => {
    // Set up successful fs mock for most tests
    const fs = await import("fs");
    const mockReadFileSync = fs.readFileSync as jest.MockedFunction<
      typeof fs.readFileSync
    >;
    mockReadFileSync.mockImplementation(() =>
      JSON.stringify({ version: "1.0.0" })
    );
  });

  it("returns healthy status successfully", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("OK");
    expect(data.version).toBeDefined();
    expect(typeof data.version).toBe("string");
    expect(data.timestamp).toBeDefined();
  });

  it("returns only required fields", async () => {
    const response = await GET();
    const data = await response.json();

    // Should only have these 3 fields for healthy response
    const expectedKeys = ["status", "version", "timestamp"];
    const actualKeys = Object.keys(data);

    expect(actualKeys.sort()).toEqual(expectedKeys.sort());
  });

  it("returns valid timestamp format", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    expect(typeof data.timestamp).toBe("string");
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });

  it("returns version from package.json", async () => {
    const response = await GET();
    const data = await response.json();

    // Version should match package.json format (semantic versioning)
    expect(data.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("returns ERROR status with error message when unhealthy", async () => {
    const fs = await import("fs");
    const mockReadFileSync = fs.readFileSync as jest.MockedFunction<
      typeof fs.readFileSync
    >;

    // Mock fs.readFileSync to throw an error (override the beforeEach mock)
    mockReadFileSync.mockImplementation(() => {
      throw new Error("File not found");
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("ERROR");
    expect(data.error).toBe("File not found");
    expect(data.version).toBe("unknown");
    expect(data.timestamp).toBeDefined();

    // Reset the mock back to the successful one from beforeEach
    mockReadFileSync.mockImplementation(() =>
      JSON.stringify({ version: "1.0.0" })
    );
  });
});
