import { PUT, GET } from "@/app/api/admin/data/route";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

// Mock fs module
jest.mock("fs");
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock path module
jest.mock("path");
const mockPath = path as jest.Mocked<typeof path>;

describe("/api/admin/data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPath.join.mockReturnValue("/mock/path/products.json");
  });

  describe("PUT", () => {
    it("saves valid data successfully", async () => {
      const validData = {
        categories: [
          {
            id: "test",
            name: "Test Category",
            description: "Test description",
            products: [
              {
                id: "product1",
                name: "Test Product",
                description: "Test product description",
                image: "/test.svg",
                features: ["Feature 1", "Feature 2"],
              },
            ],
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/admin/data", {
        method: "PUT",
        body: JSON.stringify(validData),
        headers: { "Content-Type": "application/json" },
      });

      mockFs.writeFileSync.mockImplementation(() => {});

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.message).toBe("Data saved successfully");
      expect(data.timestamp).toBeDefined();
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        "/mock/path/products.json",
        expect.stringContaining('"id": "test"'),
        "utf8"
      );
    });

    it("returns 400 for invalid data structure", async () => {
      const invalidData = { invalid: "data" };

      const request = new NextRequest("http://localhost:3000/api/admin/data", {
        method: "PUT",
        body: JSON.stringify(invalidData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toBeDefined();
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it("returns 400 for invalid category structure", async () => {
      const invalidData = {
        categories: [
          { id: "test" }, // Missing name, description and products
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/admin/data", {
        method: "PUT",
        body: JSON.stringify(invalidData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toBeDefined();
    });

    it("returns 400 for category missing description", async () => {
      const invalidData = {
        categories: [
          {
            id: "test",
            name: "Test Category",
            // Missing description
            products: [],
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/admin/data", {
        method: "PUT",
        body: JSON.stringify(invalidData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Validation failed");
      expect(data.details).toBeDefined();
    });

    it("returns 500 when file write fails", async () => {
      const validData = {
        categories: [
          {
            id: "test",
            name: "Test Category",
            description: "Test description",
            products: [],
          },
        ],
      };

      const request = new NextRequest("http://localhost:3000/api/admin/data", {
        method: "PUT",
        body: JSON.stringify(validData),
        headers: { "Content-Type": "application/json" },
      });

      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error("Write failed");
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Write failed");
    });
  });

  describe("GET", () => {
    it("returns data successfully", async () => {
      const mockData = {
        categories: [
          {
            id: "test",
            name: "Test Category",
            description: "Test description",
            products: [],
          },
        ],
      };

      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockData));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockData);
      expect(data.timestamp).toBeDefined();
      expect(mockFs.readFileSync).toHaveBeenCalledWith(
        "/mock/path/products.json",
        "utf8"
      );
    });

    it("returns 500 when file read fails", async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error("Read failed");
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Read failed");
    });
  });
});
