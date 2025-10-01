export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  features?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  products: Product[];
}

export interface ProductsData {
  categories: Category[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  timestamp: string;
}

export interface HealthCheckResponse {
  status: "OK" | "ERROR";
  version: string;
  timestamp: string;
  error?: string;
}
