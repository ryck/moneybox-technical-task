"use client";

import { useState } from "react";
import { Category, Product } from "@/types/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { validationUtils } from "@/lib/validation";
import Image from "next/image";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useCategories";

const AdminPage = () => {
  // TanStack Query hooks
  const {
    data: categories = [],
    isLoading: loading,
    error: queryError,
  } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Local UI state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Convert query error to string for display
  const displayError = error || (queryError ? String(queryError) : null);

  const handleSaveCategory = async (category: Category) => {
    try {
      const isEditing = categories.find((c) => c.id === category.id);

      if (isEditing) {
        await updateCategoryMutation.mutateAsync(category);
      } else {
        await createCategoryMutation.mutateAsync(category);
      }

      setEditingCategory(null);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${
              categories.find((c) => c.id === category.id) ? "update" : "create"
            } category`
      );
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category and all its products?"
      )
    )
      return;

    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
      setSelectedCategory(null);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    }
  };

  const handleSaveProduct = async (product: Product, categoryId: string) => {
    try {
      const category = categories.find((c) => c.id === categoryId);
      if (!category) {
        throw new Error("Category not found");
      }

      const isEditing = category.products.find((p) => p.id === product.id);

      if (isEditing) {
        await updateProductMutation.mutateAsync({ categoryId, product });
      } else {
        await createProductMutation.mutateAsync({ categoryId, product });
      }

      setEditingProduct(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    }
  };

  const handleDeleteProduct = async (productId: string, categoryId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProductMutation.mutateAsync({ categoryId, productId });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  if (loading)
    return (
      <motion.div
        className="p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
          />
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </motion.div>
    );

  if (displayError)
    return (
      <motion.div
        className="p-6 text-red-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Error: {displayError}
      </motion.div>
    );

  // No categories available state for admin
  if (!loading && !displayError && categories?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              {/* Icon */}
              <div className="w-24 h-24 mx-auto mb-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No Categories Found
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-8 leading-relaxed">
                Get started by creating your first product category. You can add
                products to categories once they&apos;re created.
              </p>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setEditingCategory({
                    id: "",
                    name: "",
                    description: "",
                    products: [],
                  })
                }
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create First Category
              </motion.button>
            </div>
          </motion.div>
        </main>

        {/* Modal for category creation */}
        <AnimatePresence>
          {editingCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setEditingCategory(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
              >
                <CategoryForm
                  category={editingCategory}
                  onSave={handleSaveCategory}
                  onCancel={() => setEditingCategory(null)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <motion.main
        className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 id="main-content" className="text-3xl font-bold text-gray-900">
            Admin Panel
          </h1>
          <p className="mt-2 text-gray-600">
            Manage categories and products for the Moneybox application
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Categories List */}
          <motion.div
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Categories
              </h2>
              <motion.button
                onClick={() => {
                  setEditingProduct(null); // Clear any product form
                  setEditingCategory({
                    id: "",
                    name: "",
                    description: "",
                    products: [],
                  });
                }}
                disabled={editingProduct !== null}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                  editingProduct !== null
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Add Category
              </motion.button>
            </div>

            <div className="space-y-3">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  className={`p-4 rounded-lg cursor-pointer border transition-all duration-200 ${
                    selectedCategory === category.id
                      ? "bg-blue-50 border-blue-200 shadow-sm"
                      : "hover:bg-gray-50 border-gray-200 hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  data-testid="admin-category"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {category.products?.length || 0} products
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct(null); // Clear any product form
                          setEditingCategory(category);
                        }}
                        disabled={editingProduct !== null}
                        className={`p-2 rounded-lg transition-colors duration-200 ${
                          editingProduct !== null
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        title={
                          editingProduct !== null
                            ? "Finish editing product first"
                            : "Edit category"
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete category"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Products List */}
          <AnimatePresence>
            {selectedCategory && (
              <motion.div
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Products
                  </h2>
                  <motion.button
                    onClick={() => {
                      setEditingCategory(null); // Clear any category form
                      setEditingProduct({
                        id: "",
                        name: "",
                        description: "",
                        image: "",
                        features: [],
                      });
                    }}
                    disabled={editingCategory !== null}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${
                      editingCategory !== null
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    Add Product
                  </motion.button>
                </div>

                <div className="space-y-3">
                  {categories.find((c) => c.id === selectedCategory)?.products
                    .length === 0 ? (
                    <motion.div
                      className="text-center text-gray-500 py-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.svg
                        className="w-8 h-8 text-gray-300 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </motion.svg>
                      <p className="text-sm">
                        No products in this category yet.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click &quot;Add Product&quot; to get started.
                      </p>
                    </motion.div>
                  ) : (
                    categories
                      .find((c) => c.id === selectedCategory)
                      ?.products.map((product, index) => (
                        <motion.div
                          key={product.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  product.image
                                    ? "bg-gradient-to-br from-gray-50 to-gray-100"
                                    : "bg-red-50 border-2 border-dashed border-red-200"
                                }`}
                              >
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                    onError={(e) => {
                                      // Replace with fallback icon if image fails to load
                                      const target =
                                        e.target as HTMLImageElement;
                                      const container = target.parentElement;
                                      if (container) {
                                        container.className =
                                          "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-50 border-2 border-dashed border-red-200";
                                        container.innerHTML = `
                                          <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        `;
                                      }
                                    }}
                                  />
                                ) : (
                                  <svg
                                    className="w-6 h-6 text-red-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1}
                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {product.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {product.description}
                                </p>
                                <div className="flex items-center mt-2">
                                  <p className="text-xs text-gray-500">
                                    {product.features?.length || 0} features
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => {
                                  setEditingCategory(null); // Clear any category form
                                  setEditingProduct(product);
                                }}
                                disabled={editingCategory !== null}
                                className={`p-2 rounded-lg transition-colors duration-200 ${
                                  editingCategory !== null
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                }`}
                                title={
                                  editingCategory !== null
                                    ? "Finish editing category first"
                                    : "Edit product"
                                }
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteProduct(
                                    product.id,
                                    selectedCategory
                                  )
                                }
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete product"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Forms */}
          <motion.div
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <AnimatePresence mode="wait">
              {editingCategory && (
                <motion.div
                  key="category-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CategoryForm
                    category={editingCategory}
                    onSave={handleSaveCategory}
                    onCancel={() => setEditingCategory(null)}
                  />
                </motion.div>
              )}

              {editingProduct && selectedCategory && (
                <motion.div
                  key="product-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductForm
                    product={editingProduct}
                    onSave={(product) =>
                      handleSaveProduct(product, selectedCategory)
                    }
                    onCancel={() => setEditingProduct(null)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {!editingCategory && !editingProduct && (
              <motion.div
                key="empty-state"
                className="text-center text-gray-500 py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-sm mx-auto">
                  <motion.svg
                    className="w-12 h-12 text-gray-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ opacity: 0, rotate: -180 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </motion.svg>
                  <motion.p
                    className="text-lg font-medium text-gray-900 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    Get Started
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    Select a category to view products, or click &quot;Add
                    Category&quot; to create a new one.
                  </motion.p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </motion.main>

      <Footer />
    </div>
  );
};

function CategoryForm({
  category,
  onSave,
  onCancel,
}: {
  category: Category;
  onSave: (category: Category) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(category);
  const [idError, setIdError] = useState<string>("");

  // Validate ID format in real-time
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawId = e.target.value;
    const cleanId = validationUtils.cleanId(rawId);
    setFormData({ ...formData, id: cleanId });

    // Real-time validation
    if (cleanId && !validationUtils.isValidIdFormat(cleanId)) {
      setIdError(validationUtils.getIdFormatError("Category ID"));
    } else {
      setIdError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.description || idError)
      return;
    onSave(formData);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mr-3">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          {category.id ? "Edit Category" : "Add Category"}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label
            htmlFor="category-id"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category ID{" "}
            <span className="text-gray-400">({formData.id.length}/50)</span>
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          </label>
          <input
            id="category-id"
            name="id"
            type="text"
            value={formData.id}
            onChange={handleIdChange}
            className={`block w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400 text-gray-900 ${
              idError ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., savings-accounts, investments"
            maxLength={50}
            required
            aria-describedby="category-id-help category-id-error"
            aria-invalid={
              idError || (!formData.id && formData.id !== category.id)
                ? "true"
                : "false"
            }
          />
          {idError && (
            <p
              id="category-id-error"
              className="mt-1 text-xs text-red-500"
              role="alert"
            >
              {idError}
            </p>
          )}
          <p id="category-id-help" className="mt-1 text-xs text-gray-500">
            Unique identifier for this category (used in URLs and data storage)
          </p>
        </div>

        <div>
          <label
            htmlFor="category-name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category Name{" "}
            <span className="text-gray-400">({formData.name.length}/100)</span>
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          </label>
          <input
            id="category-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400 text-gray-900"
            placeholder="e.g., Savings Accounts"
            maxLength={100}
            required
            aria-describedby="category-name-help"
            aria-invalid={!formData.name ? "true" : "false"}
          />
          <p id="category-name-help" className="mt-1 text-xs text-gray-500">
            Display name for this category as shown to users
          </p>
        </div>

        <div>
          <label
            htmlFor="category-description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description{" "}
            <span className="text-gray-400">
              ({formData.description.length}/500)
            </span>
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          </label>
          <textarea
            id="category-description"
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400 text-gray-900"
            placeholder="Describe this category of products..."
            rows={3}
            maxLength={500}
            required
            aria-describedby="category-description-help"
            aria-invalid={!formData.description ? "true" : "false"}
          />
          <p
            id="category-description-help"
            className="mt-1 text-xs text-gray-500"
          >
            Brief description of this product category for users
          </p>
        </div>

        <div
          className="flex space-x-3 pt-4"
          role="group"
          aria-label="Form actions"
        >
          <button
            type="submit"
            disabled={!!idError}
            className={`px-6 py-2 rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              idError
                ? "bg-gray-400 text-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 focus:ring-blue-500"
            }`}
            aria-describedby="category-save-description"
          >
            {category.id ? "Update Category" : "Save Category"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-white text-gray-700 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 focus:bg-gray-50 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <div id="category-save-description" className="sr-only">
            {category.id
              ? "Update the existing category with your changes"
              : "Create a new category with the provided information"}
          </div>
        </div>
      </form>
    </div>
  );
}

function ProductForm({
  product,
  onSave,
  onCancel,
}: {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(product);
  const [featuresText, setFeaturesText] = useState(
    product.features?.join("\n") || ""
  );
  const [idError, setIdError] = useState<string>("");

  // Validate ID format in real-time
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawId = e.target.value;
    const cleanId = validationUtils.cleanId(rawId);
    setFormData({ ...formData, id: cleanId });

    // Real-time validation
    if (cleanId && !validationUtils.isValidIdFormat(cleanId)) {
      setIdError(validationUtils.getIdFormatError("Product ID"));
    } else {
      setIdError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.description || idError)
      return;

    const updatedProduct = {
      ...formData,
      features: featuresText.split("\n").filter((f) => f.trim()),
    };

    onSave(updatedProduct);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center mr-3">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          {product.id ? "Edit Product" : "Add Product"}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label
            htmlFor="product-id"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Product ID{" "}
            <span className="text-gray-400">({formData.id.length}/50)</span>
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          </label>
          <input
            id="product-id"
            name="id"
            type="text"
            value={formData.id}
            onChange={handleIdChange}
            className={`block w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 placeholder-gray-400 text-gray-900 ${
              idError ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., simple-saver, cash_isa"
            maxLength={50}
            required
            aria-describedby="product-id-help product-id-error"
            aria-invalid={
              idError || (!formData.id && formData.id !== product.id)
                ? "true"
                : "false"
            }
          />
          {idError && (
            <p
              id="product-id-error"
              className="mt-1 text-xs text-red-500"
              role="alert"
            >
              {idError}
            </p>
          )}
          <p id="product-id-help" className="mt-1 text-xs text-gray-500">
            Unique identifier for this product (used in URLs and data storage)
          </p>
        </div>

        <div>
          <label
            htmlFor="product-name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Product Name{" "}
            <span className="text-gray-400">({formData.name.length}/100)</span>
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          </label>
          <input
            id="product-name"
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 placeholder-gray-400 text-gray-900"
            placeholder="e.g., Simple Saver, Cash ISA"
            maxLength={100}
            required
            aria-describedby="product-name-help"
            aria-invalid={!formData.name ? "true" : "false"}
          />
          <p id="product-name-help" className="mt-1 text-xs text-gray-500">
            Display name for this product as shown to users
          </p>
        </div>

        <div>
          <label
            htmlFor="product-description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description{" "}
            <span className="text-gray-400">
              ({formData.description.length}/1000)
            </span>
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          </label>
          <textarea
            id="product-description"
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 placeholder-gray-400 text-gray-900"
            placeholder="Describe this product and its benefits..."
            rows={3}
            maxLength={1000}
            required
            aria-describedby="product-description-help"
            aria-invalid={!formData.description ? "true" : "false"}
          />
          <p
            id="product-description-help"
            className="mt-1 text-xs text-gray-500"
          >
            Detailed description of this product and its benefits
          </p>
        </div>

        <div>
          <label
            htmlFor="product-image"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Image Path
          </label>
          <input
            id="product-image"
            name="image"
            type="text"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 placeholder-gray-400 text-gray-900"
            placeholder="/assets/product_name.svg"
            aria-describedby="product-image-help"
          />
          <p id="product-image-help" className="text-xs text-gray-500 mt-1">
            Path to the product icon/image (optional). Leave empty to use
            default icon.
          </p>
        </div>

        <div>
          <label
            htmlFor="product-features"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Features{" "}
            <span className="text-gray-400">({featuresText.length}/2000)</span>
          </label>
          <textarea
            id="product-features"
            name="features"
            value={featuresText}
            onChange={(e) => setFeaturesText(e.target.value)}
            className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 placeholder-gray-400 text-gray-900"
            rows={4}
            placeholder="Enter one feature per line:&#10;Instant access&#10;Competitive rates&#10;No minimum balance"
            maxLength={2000}
            aria-describedby="product-features-help"
          />
          <p id="product-features-help" className="text-xs text-gray-500 mt-1">
            Enter one feature per line. Features will be displayed as bullet
            points in the product details.
          </p>
        </div>

        <div
          className="flex space-x-3 pt-4"
          role="group"
          aria-label="Form actions"
        >
          <button
            type="submit"
            disabled={!!idError}
            className={`px-6 py-2 rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              idError
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700 focus:bg-green-700 focus:ring-green-500"
            }`}
            aria-describedby="product-save-description"
          >
            {product.id ? "Update Product" : "Save Product"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-white text-gray-700 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 focus:bg-gray-50 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <div id="product-save-description" className="sr-only">
            {product.id
              ? "Update the existing product with your changes"
              : "Create a new product with the provided information"}
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdminPage;
