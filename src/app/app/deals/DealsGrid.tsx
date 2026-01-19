"use client";

import { useFilterIsOpen } from "./FilterContainer";
import { motion, AnimatePresence } from "framer-motion";

type DealsGridProps = {
  children: React.ReactNode;
  key?: string;
};

export default function DealsGrid({ children, key }: DealsGridProps) {
  const isFilterOpen = useFilterIsOpen();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  // Adjust grid columns based on filter sidebar state
  // When sidebar is open, use fewer columns to maintain image aspect ratio
  const gridClasses = isFilterOpen
    ? "grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
    : "grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        variants={container}
        initial="hidden"
        animate="show"
        exit="hidden"
        className={gridClasses}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

