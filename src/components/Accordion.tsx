"use client";

import { useState } from "react";
import { Product } from "@/types/products";
import AccordionItem from "./AccordionItem";

interface AccordionProps {
  products: Product[];
}

const Accordion = ({ products }: AccordionProps) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (productId: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setOpenItems(new Set(products.map((p) => p.id)));
  };

  const collapseAll = () => {
    setOpenItems(new Set());
  };

  return (
    <div className="w-full">
      {/* Accordion Controls */}
      {/* @INFO: Totally unnecessary, but visually appealing */}
      <div
        className="flex justify-end mb-4 space-x-3"
        role="toolbar"
        aria-label="Accordion controls"
      >
        <button
          onClick={expandAll}
          className="inline-flex items-center justify-center p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200 cursor-pointer"
          aria-label="Expand all product details"
          title="Expand all products"
        >
          <span className="text-sm">⏬︎</span>
        </button>
        <button
          onClick={collapseAll}
          className="inline-flex items-center justify-center p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200 cursor-pointer"
          aria-label="Collapse all product details"
          title="Collapse all products"
        >
          <span className="text-sm rotate-180">⏬︎</span>
        </button>
      </div>

      {/* Accordion Items */}
      <div className="space-y-2" role="region" aria-label="Product details">
        {products.map((product) => (
          <AccordionItem
            key={product.id}
            product={product}
            isOpen={openItems.has(product.id)}
            onToggle={() => toggleItem(product.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Accordion;
