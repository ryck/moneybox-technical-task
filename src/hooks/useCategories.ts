import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Category, Product } from "@/types/products";

// Query Keys
export const queryKeys = {
  categories: ["categories"] as const,
  category: (id: string) => ["categories", id] as const,
  products: (categoryId: string) =>
    ["categories", categoryId, "products"] as const,
};

// API Functions
const api = {
  getCategories: async (): Promise<{ data: Category[] }> => {
    const response = await fetch("/api/categories");
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    return response.json();
  },

  createCategory: async (
    category: Omit<Category, "id">
  ): Promise<{ data: Category }> => {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create category");
    }
    return response.json();
  },

  updateCategory: async (category: Category): Promise<{ data: Category }> => {
    const response = await fetch(`/api/categories/${category.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update category");
    }
    return response.json();
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete category");
    }
  },

  createProduct: async (
    categoryId: string,
    product: Omit<Product, "id">
  ): Promise<{ data: Product }> => {
    const response = await fetch(`/api/categories/${categoryId}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create product");
    }
    return response.json();
  },

  updateProduct: async (
    categoryId: string,
    product: Product
  ): Promise<{ data: Product }> => {
    const response = await fetch(
      `/api/categories/${categoryId}/products/${product.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update product");
    }
    return response.json();
  },

  deleteProduct: async (
    categoryId: string,
    productId: string
  ): Promise<void> => {
    const response = await fetch(
      `/api/categories/${categoryId}/products/${productId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete product");
    }
  },
};

// Query Hooks
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.getCategories,
    select: (data) => data.data,
  });
}

// Mutation Hooks
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createCategory,
    onSuccess: (data) => {
      queryClient.setQueryData(
        queryKeys.categories,
        (old: { data: Category[] } | undefined) => {
          if (!old) return { data: [data.data] };
          return { data: [...old.data, data.data] };
        }
      );
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateCategory,
    onSuccess: (data) => {
      queryClient.setQueryData(
        queryKeys.categories,
        (old: { data: Category[] } | undefined) => {
          if (!old) return { data: [data.data] };
          return {
            data: old.data.map((category) =>
              category.id === data.data.id ? data.data : category
            ),
          };
        }
      );
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: (_, categoryId) => {
      queryClient.setQueryData(
        queryKeys.categories,
        (old: { data: Category[] } | undefined) => {
          if (!old) return { data: [] };
          return {
            data: old.data.filter((category) => category.id !== categoryId),
          };
        }
      );
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      product,
    }: {
      categoryId: string;
      product: Omit<Product, "id">;
    }) => api.createProduct(categoryId, product),
    onSuccess: (data, { categoryId }) => {
      queryClient.setQueryData(
        queryKeys.categories,
        (old: { data: Category[] } | undefined) => {
          if (!old) return { data: [] };
          return {
            data: old.data.map((category) =>
              category.id === categoryId
                ? { ...category, products: [...category.products, data.data] }
                : category
            ),
          };
        }
      );
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      product,
    }: {
      categoryId: string;
      product: Product;
    }) => api.updateProduct(categoryId, product),
    onSuccess: (data, { categoryId }) => {
      queryClient.setQueryData(
        queryKeys.categories,
        (old: { data: Category[] } | undefined) => {
          if (!old) return { data: [] };
          return {
            data: old.data.map((category) =>
              category.id === categoryId
                ? {
                    ...category,
                    products: category.products.map((product) =>
                      product.id === data.data.id ? data.data : product
                    ),
                  }
                : category
            ),
          };
        }
      );
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      productId,
    }: {
      categoryId: string;
      productId: string;
    }) => api.deleteProduct(categoryId, productId),
    onSuccess: (_, { categoryId, productId }) => {
      queryClient.setQueryData(
        queryKeys.categories,
        (old: { data: Category[] } | undefined) => {
          if (!old) return { data: [] };
          return {
            data: old.data.map((category) =>
              category.id === categoryId
                ? {
                    ...category,
                    products: category.products.filter(
                      (product) => product.id !== productId
                    ),
                  }
                : category
            ),
          };
        }
      );
    },
  });
}
