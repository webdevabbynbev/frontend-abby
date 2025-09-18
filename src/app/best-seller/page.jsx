"use client";

import { useState, useEffect, useMemo } from "react";
import { BevPick } from "@/data";
import { RegularCard, Button, TxtField, Filter } from "@/components";

function shuffledArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const BestSeller = () => {
  const combineData = useMemo(() => {
    return [...BevPick.map((item) => ({ ...item, type: "regular" }))];
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [mixedData, setMixedData] = useState([]);

  useEffect(() => {
    setMixedData(shuffledArray(combineData));
  }, [combineData]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = mixedData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(mixedData.length / itemsPerPage);

  return (
    <div className="flex w-full justify-between">
      <div className="w-[400px] pl-10 pr-5 py-6">
        <Filter showBrandFilter={true} className="w-full py-24" />
      </div>

      <div className="wrapper flex-row w-full pr-10 pl-5 py-6 space-y-6">
        <div className="w-full">
          <TxtField
            placeholder="Search your beauty needs here . . ."
            iconLeftName="MagnifyingGlass"
            variant="outline"
            size="md"
            className="w-full min-w-[280px]"
          />
        </div>

        <div className="w-full h-auto grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-6 items-start justify-between">
          {currentItems.map((item) => (
            <RegularCard key={item.id} item={item} />
          ))}
          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-2 col-span-full">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-full ${
                  currentPage === i + 1
                    ? "bg-primary-700 text-white"
                    : "bg-secondary-50 text-primary-700 hover:outline-1 outline-primary-700 hover:text-primary-700 transition-all"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestSeller;
