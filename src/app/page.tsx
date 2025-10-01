"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Carousel from "@/components/Carousel";
import { useCategories } from "@/hooks/useCategories";
import { motion } from "framer-motion";

const Home = () => {
  const { data: categories = [], isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main
          id="main-content"
          className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full"
        >
          <div className="flex items-center justify-center min-h-64">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">
              Loading financial products...
            </span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main
          id="main-content"
          className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full"
        >
          <div className="text-center py-16">
            <div className="text-red-600 text-lg font-medium mb-2">
              Unable to load financial products
            </div>
            <p className="text-gray-600">
              Please try refreshing the page or contact support if the problem
              persists.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // No categories available state
  if (!isLoading && !error && categories?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main
          id="main-content"
          className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full"
        >
          <div className="text-center py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-md mx-auto"
            >
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No Financial Products Available
              </h2>

              {/* Description */}
              <p className="text-gray-600 mb-8 leading-relaxed">
                We&apos;re working hard to bring you the best financial
                products. Our product catalog will be available soon.
              </p>

              {/* Action Button */}
              <button
                onClick={() => window.location.reload()}
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh Page
              </button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main
        id="main-content"
        className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full"
      >
        <h1 className="sr-only">Moneybox Financial Products</h1>
        <Carousel categories={categories} />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
