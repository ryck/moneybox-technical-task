import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "@/app/page";

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

describe("Home", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays loading state initially", () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByText("Loading financial products...")).toBeDefined();
  });

  it("displays error state when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load financial products")
      ).toBeDefined();
      expect(
        screen.getByText(
          "Please try refreshing the page or contact support if the problem persists."
        )
      ).toBeDefined();
    });
  });

  it("displays categories when loaded successfully", async () => {
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
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText("Savings")).toBeDefined();
      expect(screen.getByText("Save money for your future")).toBeDefined();
    });
  });

  it("renders header and footer with categories", async () => {
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
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole("banner")).toBeDefined(); // Header
      expect(screen.getByRole("contentinfo")).toBeDefined(); // Footer
      expect(screen.getByText("Made with ❤️ for Moneybox")).toBeDefined();
    });
  });

  it("has accessible main content", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
      }),
    } as Response);

    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    await waitFor(() => {
      const mainElement = screen.getByRole("main");
      expect(mainElement).toBeDefined();
      expect(mainElement.getAttribute("id")).toBe("main-content");
    });
  });
});
