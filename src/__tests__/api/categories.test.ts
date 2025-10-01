import { GET } from "@/app/api/categories/route";

describe("/api/categories", () => {
  it("returns all categories successfully", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(data.timestamp).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  });

  it("returns categories with correct structure", async () => {
    const response = await GET();
    const data = await response.json();

    const firstCategory = data.data[0];
    expect(firstCategory).toHaveProperty("id");
    expect(firstCategory).toHaveProperty("name");
    expect(firstCategory).toHaveProperty("description");
    expect(firstCategory).toHaveProperty("products");
    expect(Array.isArray(firstCategory.products)).toBe(true);
  });

  it("returns valid timestamp", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.timestamp).toBeDefined();
    expect(typeof data.timestamp).toBe("string");
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });

  it("returns products with correct structure", async () => {
    const response = await GET();
    const data = await response.json();

    const firstProduct = data.data[0].products[0];
    expect(firstProduct).toHaveProperty("id");
    expect(firstProduct).toHaveProperty("name");
    expect(firstProduct).toHaveProperty("description");
    expect(firstProduct).toHaveProperty("image");
    expect(firstProduct).toHaveProperty("features");
    expect(Array.isArray(firstProduct.features)).toBe(true);
  });
});
