import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminPage from "@/app/admin/page";

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Test wrapper with QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("AdminPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no categories", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
      }),
    } as Response);

    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "No Categories Found" })
      ).toBeDefined();
      expect(
        screen.getByText(
          "Get started by creating your first product category. You can add products to categories once they're created."
        )
      ).toBeDefined();
    });
  });

  it("displays loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    expect(screen.getByText("Loading...")).toBeDefined();
  });

  it("displays error state when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error: Failed to fetch/)).toBeDefined();
    });
  });

  it("displays categories when loaded successfully", async () => {
    const mockCategories = [
      {
        id: "test-category",
        name: "Test Category",
        description: "Test description",
        products: [
          {
            id: "test-product",
            name: "Test Product",
            description: "Test product description",
            image: "/test.svg",
            features: ["Feature 1"],
          },
        ],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockCategories,
      }),
    } as Response);

    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Category")).toBeDefined();
      expect(screen.getByText("1 products")).toBeDefined();
    });
  });

  it("displays create first category button", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
      }),
    } as Response);

    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Create First Category")).toBeDefined();
    });
  });

  it("renders admin panel with categories", async () => {
    const mockCategories = [
      {
        id: "savings",
        name: "Savings",
        description: "Save money for your future",
        products: [
          {
            id: "simple-saver",
            name: "Simple Saver",
            description: "Easy access savings account",
            image: "/assets/simple_saver.svg",
            features: ["Instant access", "No fees"],
          },
        ],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: mockCategories,
      }),
    } as Response);

    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Admin Panel" })
      ).toBeDefined();
      expect(screen.getByText("Savings")).toBeDefined();
      expect(screen.getByText("Add Category")).toBeDefined();
    });
  });
});

describe("AdminPage Form Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to setup component with test data
  const setupWithCategories = () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "savings",
            name: "Savings",
            description: "Save money for your future",
            products: [
              {
                id: "simple-saver",
                name: "Simple Saver",
                description: "Easy access savings account",
                image: "/assets/simple_saver.svg",
                features: ["Instant access", "No fees"],
              },
            ],
          },
        ],
      }),
    } as Response);

    return render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );
  };

  describe("Category Form Validation", () => {
    it("should show validation error for invalid category ID format", async () => {
      setupWithCategories();

      await waitFor(() => {
        expect(screen.getByText("Add Category")).toBeDefined();
      });

      const addCategoryButton = screen.getByText("Add Category");
      addCategoryButton.click();

      await waitFor(() => {
        expect(screen.getByLabelText(/Category ID/)).toBeDefined();
      });

      const idInput = screen.getByLabelText(/Category ID/);

      // Type invalid ID with spaces and special characters
      fireEvent.change(idInput, { target: { value: "Invalid Category!" } });

      await waitFor(() => {
        expect(
          screen.getByText(
            /can only contain lowercase letters, numbers, underscores, and dashes/
          )
        ).toBeDefined();
      });
    });

    it("should clean and validate mixed case input for category ID", async () => {
      setupWithCategories();

      await waitFor(() => {
        expect(screen.getByText("Add Category")).toBeDefined();
      });

      const addCategoryButton = screen.getByText("Add Category");
      addCategoryButton.click();

      await waitFor(() => {
        expect(screen.getByLabelText(/Category ID/)).toBeDefined();
      });

      const idInput = screen.getByLabelText(/Category ID/) as HTMLInputElement;

      // Type mixed case with spaces - should be cleaned
      fireEvent.change(idInput, { target: { value: "  MIXED-Case_ID  " } });

      await waitFor(() => {
        expect(idInput.value).toBe("mixed-case_id");
      });
    });

    it("should disable save button when validation error exists", async () => {
      setupWithCategories();

      await waitFor(() => {
        expect(screen.getByText("Add Category")).toBeDefined();
      });

      const addCategoryButton = screen.getByText("Add Category");
      addCategoryButton.click();

      await waitFor(() => {
        expect(screen.getByLabelText(/Category ID/)).toBeDefined();
      });

      const idInput = screen.getByLabelText(/Category ID/);
      const saveButton = screen.getByText("Save Category");

      // Initially should be enabled (assuming other fields are filled)
      expect(saveButton.hasAttribute("disabled")).toBe(false);

      // Type invalid ID
      fireEvent.change(idInput, { target: { value: "Invalid ID!" } });

      await waitFor(() => {
        expect(saveButton.hasAttribute("disabled")).toBe(true);
        expect(saveButton.className).toContain("bg-gray-400");
        expect(saveButton.className).toContain("cursor-not-allowed");
      });
    });
  });

  describe("Product Form Validation", () => {
    it("should show validation error for invalid product ID format", async () => {
      setupWithCategories();

      await waitFor(() => {
        expect(screen.getByText("Savings")).toBeDefined();
      });

      // Click on category to expand
      const savingsCategory = screen.getByText("Savings");
      savingsCategory.click();

      await waitFor(() => {
        expect(screen.getByText("Add Product")).toBeDefined();
      });

      const addProductButton = screen.getByText("Add Product");
      addProductButton.click();

      await waitFor(() => {
        expect(screen.getByLabelText(/Product ID/)).toBeDefined();
      });

      const idInput = screen.getByLabelText(/Product ID/);

      // Type invalid ID
      fireEvent.change(idInput, { target: { value: "Invalid Product!" } });

      await waitFor(() => {
        expect(
          screen.getByText(
            /can only contain lowercase letters, numbers, underscores, and dashes/
          )
        ).toBeDefined();
      });
    });

    it("should clean and validate mixed case input for product ID", async () => {
      setupWithCategories();

      await waitFor(() => {
        expect(screen.getByText("Savings")).toBeDefined();
      });

      // Click on category to expand
      const savingsCategory = screen.getByText("Savings");
      savingsCategory.click();

      await waitFor(() => {
        expect(screen.getByText("Add Product")).toBeDefined();
      });

      const addProductButton = screen.getByText("Add Product");
      addProductButton.click();

      await waitFor(() => {
        expect(screen.getByLabelText(/Product ID/)).toBeDefined();
      });

      const idInput = screen.getByLabelText(/Product ID/) as HTMLInputElement;

      // Type mixed case with spaces - should be cleaned
      fireEvent.change(idInput, { target: { value: "  PRODUCT-Name_123  " } });

      await waitFor(() => {
        expect(idInput.value).toBe("product-name_123");
      });
    });

    it("should disable save button when validation error exists in product form", async () => {
      setupWithCategories();

      await waitFor(() => {
        expect(screen.getByText("Savings")).toBeDefined();
      });

      // Click on category to expand
      const savingsCategory = screen.getByText("Savings");
      savingsCategory.click();

      await waitFor(() => {
        expect(screen.getByText("Add Product")).toBeDefined();
      });

      const addProductButton = screen.getByText("Add Product");
      addProductButton.click();

      await waitFor(() => {
        expect(screen.getByLabelText(/Product ID/)).toBeDefined();
      });

      const idInput = screen.getByLabelText(/Product ID/);
      const saveButton = screen.getByText("Save Product");

      // Initially should be enabled
      expect(saveButton.hasAttribute("disabled")).toBe(false);

      // Type invalid ID
      fireEvent.change(idInput, { target: { value: "Invalid Product ID!" } });

      await waitFor(() => {
        expect(saveButton.hasAttribute("disabled")).toBe(true);
        expect(saveButton.className).toContain("bg-gray-400");
        expect(saveButton.className).toContain("cursor-not-allowed");
      });
    });
  });
});
