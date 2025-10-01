"use client";

import Image from "next/image";
import { Product } from "@/types/products";

interface AccordionItemProps {
  product: Product;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem = ({ product, isOpen, onToggle }: AccordionItemProps) => {
  const buttonId = `accordion-button-${product.id}`;
  const contentId = `accordion-content-${product.id}`;

  return (
    <div className="rounded-lg overflow-hidden mb-3" data-testid="product-card">
      <button
        id={buttonId}
        onClick={onToggle}
        className={`w-full px-4 text-left bg-gray-50 hover:bg-gray-100 focus:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg cursor-pointer ${
          isOpen ? "py-3 rounded-b-none" : "py-3"
        }`}
        aria-expanded={isOpen}
        aria-controls={contentId}
        aria-label={`${product.name} - Click to ${
          isOpen ? "collapse" : "expand"
        } details`}
        data-testid="category-button"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={20}
                  height={20}
                  className="w-5 h-5"
                  onError={(e) => {
                    // Replace with fallback icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    const container = target.parentElement;
                    if (container) {
                      container.innerHTML = `
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      `;
                    }
                  }}
                />
              ) : (
                <svg
                  className="w-5 h-5 text-gray-400"
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
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className="text-base font-semibold text-gray-900 overflow-hidden text-ellipsis whitespace-nowrap"
                data-testid="product-name"
                title={product.name}
              >
                {product.name}
              </h3>
            </div>
          </div>
          <div className="flex items-center ml-4">
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </button>

      <div
        id={contentId}
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden rounded-b-lg`}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!isOpen}
      >
        <div className="px-4 pb-4 bg-white border-t border-gray-100">
          <div className="pt-4">
            {/* Product Description */}
            <p
              className="text-gray-700 mb-4 leading-relaxed text-sm"
              data-testid="product-description"
            >
              {product.description}
            </p>

            {/* Key Features */}
            {/* @INFO: Totally unnecessary, but visually appealing */}
            {product.features && product.features?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Key Features
                </h4>
                <ul className="space-y-2" role="list">
                  {product.features?.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start text-sm text-gray-600"
                      role="listitem"
                    >
                      <span
                        className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-1.5 flex-shrink-0"
                        aria-hidden="true"
                      ></span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
