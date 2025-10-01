"use client";

import { useState } from "react";
import { Category } from "@/types/products";
import Accordion from "./Accordion";

interface CarouselProps {
  categories: Category[];
}

const Carousel = ({ categories }: CarouselProps) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Calculate how many categories to show per page based on screen size
  const CATEGORIES_PER_PAGE = 3;
  const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);

  const goToPrevious = () => {
    setCurrentPageIndex((prevIndex) =>
      prevIndex === 0 ? totalPages - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentPageIndex((prevIndex) =>
      prevIndex === totalPages - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPageIndex(pageIndex);
  };

  // Get categories for current page
  const getCurrentPageCategories = () => {
    const startIndex = currentPageIndex * CATEGORIES_PER_PAGE;
    const endIndex = startIndex + CATEGORIES_PER_PAGE;
    return categories.slice(startIndex, endIndex);
  };

  return (
    <div className="relative w-full">
      {/* Carousel Header with Navigation */}
      <div className="flex items-center justify-between mb-8">
        {/* Left Navigation Button */}
        <div className="flex-1 flex justify-start">
          {totalPages > 1 && (
            <button
              onClick={goToPrevious}
              className="group p-2 rounded-full bg-white shadow-md hover:shadow-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Previous page"
            >
              <svg
                className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Centered Title */}
        <div className="flex-1 flex justify-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-gray-900 text-center"
            id="products-heading"
          >
            Our Products
          </h2>
        </div>

        {/* Right Navigation Button */}
        <div className="flex-1 flex justify-end">
          {totalPages > 1 && (
            <button
              onClick={goToNext}
              className="group p-2 rounded-full bg-white shadow-md hover:shadow-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
              aria-label="Next page"
            >
              <svg
                className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Carousel Content */}
      <div
        className="w-full"
        role="region"
        aria-labelledby="products-heading"
        aria-live="polite"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {getCurrentPageCategories().map((category) => (
            <article
              key={category.id}
              className="rounded-lg shadow-sm border border-gray-200 p-6"
              aria-labelledby={`category-${category.id}-title`}
              data-testid="category-section"
            >
              <div className="mb-6">
                <h3
                  id={`category-${category.id}-title`}
                  className="text-xl font-bold text-gray-900 mb-2"
                >
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
              <Accordion products={category.products} />
            </article>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      {totalPages > 1 && (
        <nav
          className="flex justify-center mt-8"
          aria-label="Product categories pagination"
        >
          <div className="flex space-x-3" role="tablist">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
                  index === currentPageIndex
                    ? "bg-blue-600"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to page ${index + 1} of ${totalPages}`}
                aria-current={index === currentPageIndex ? "page" : undefined}
                role="tab"
                aria-selected={index === currentPageIndex}
              />
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Carousel;
