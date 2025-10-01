"use client";
import { useState, useMemo } from "react";
import { formatToRupiah } from "@/utils";
import {
  FaPlusCircle,
  FaMinusCircle,
  FaChevronDown,
  FaStar,
} from "react-icons/fa";

import {
  Checkbox,
  Chip,
  label,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
  TxtField,
  Button,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from ".";


import {
  DataBrand,
  DataCleanser,
  DataMoisturizer,
  DataTreatment,
  DataBooster,
  DataSunCare,
  DataFace,
  DataEyebrow,
  DataLips,
  DataShampoo,
  DataHairStyling,
  DataHairTreatment,
  DataHairTools,
  DataMakeUpBrush,
  DataOrganizer,
  DataFacial,
  DataMakeupTools,
  DataMenicure,
  DataRating,
  DataBodyConcern,
  DataSkinConcern,
  DataHairConcern,
  BevPick,
} from "../data";

export function Filter({ showBrandFilter = true }) {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showTooltipMin, setShowTooltipMin] = useState(false);
  const [showTooltipMax, setShowTooltipMax] = useState(false);
  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();
  const [brandSearch, setBrandSearch] = useState();
  const [itemSearch, setItemSearch] = useState();

  const hasActiveFilter = selectedFilters.length > 0;

  // const combineData = useMemo(() => {
  //   return [
  //     ...FlashSaleProducts.map((item) => ({
  //       productBrand: brand,
  //       type: "flash",
  //     })),
  //     ...BevPick.map((item) => ({ ...item, type: "regular" })),
  //   ];
  // }, []);

  const filteredBrands = DataBrand.filter((brand) =>
    brand.brandname.toLowerCase().includes(brandSearch?.toLowerCase() || "")
  );

  const handleSelect = (group, itemId) => {
    const uniqueId = `${group}-${itemId}`;
    setSelectedFilters((prev) =>
      prev.includes(uniqueId)
        ? prev.filter((id) => id !== uniqueId)
        : [...prev, uniqueId]
    );
  };

  const handleChange = (e, type) => {
    const rawValue = e.target.value;
    const lastChar = e.nativeEvent.data;
    const onlyNumber = rawValue.replace(/\D/g, "");

    if (lastChar && /\D/.test(lastChar)) {
      if (type === "min") {
        setShowTooltipMin(true);
        setTimeout(() => setShowTooltipMin(false), 2000);
      } else {
        setShowTooltipMax(true);
        setTimeout(() => setShowTooltipMax(false), 2000);
      }
    }

    const numericValue = Number(onlyNumber);

    if (type === "min") {
      setMinPrice(numericValue ? numericValue.toString() : "");
    } else {
      setMaxPrice(numericValue ? numericValue.toString() : "");
    }
  };

  const handleReset = () => {
    setMinPrice();
    setMaxPrice();
    setSelectedFilters([]);
  };

  return (
    <div className="flex-row space-y-4 h-full max-w-[300px]">
      <div className="TitleCat-1 flex w-full space-x-4">
        <h3 className="font-medium text-base">Category </h3>{" "}
        <hr className="w-full border-t border-primary-700 my-4" />
      </div>
      <Accordion
        type="single"
        className="AccordionMakeup rounded-2xl w-full bg-white px-4 transition-all outline-1 outline-neutral-100"
        collapsible
      >
        <AccordionItem value="item-0">
          <AccordionTrigger className="flex justify-between items-center group">
            <span className="font-bold text-base">Makeup</span>
            <FaPlusCircle className="h-4 w-4 group-data-[state=open]:hidden text-primary-700" />
            <FaMinusCircle className="h-4 w-4 hidden group-data-[state=open]:block text-primary-700" />
          </AccordionTrigger>
          <AccordionContent>
            {/* accordion inside     */}

            <Accordion
              className="w-auto px-4 bg-neutral-50 transition-all justify-between rounded-[12px] space-y-4"
              collapsible
            >
              <AccordionItem value="item-1">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Face</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataFace.map((item) => {
                    const uniqueId = `face-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("face", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Eyebrow</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataEyebrow.map((item) => {
                    const uniqueId = `eyebrow-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("eyebrow", item.id)}
                        className={`w-full text-left px-2 py-2 space-x-2 rounded-md flex items- transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Lips</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataLips.map((item) => {
                    const uniqueId = `lips-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("lips", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* accordion inside     */}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion
        type="single"
        className="AccordionSkincare rounded-2xl max-w-[300px] w-full bg-white px-4 transition-all outline-1 outline-neutral-100"
        collapsible
      >
        <AccordionItem value="item-4">
          <AccordionTrigger className="flex justify-between items-center group">
            <span className="font-bold text-base">Skincare</span>
            <FaPlusCircle className="h-4 w-4 group-data-[state=open]:hidden text-primary-700" />
            <FaMinusCircle className="h-4 w-4 hidden group-data-[state=open]:block text-primary-700" />
          </AccordionTrigger>
          <AccordionContent>
            {/* accordion inside     */}

            <Accordion
              className="w-auto px-4 bg-neutral-50 transition-all justify-between rounded-[12px] space-y-4"
              collapsible
            >
              <AccordionItem value="item-5">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Cleanser</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataCleanser.map((item) => {
                    const uniqueId = `cleanser-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("cleanser", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Moisturizer</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataMoisturizer.map((item) => {
                    const uniqueId = `moisturizer-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("moisturizer", item.id)}
                        className={`w-full text-left flex items-center space-x-2 px-2 py-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Treatment</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataTreatment.map((item) => {
                    const uniqueId = `treatment-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("treatment", item.id)}
                        className={`w-full text-left flex items-center space-x-2 px-2 py-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Booster</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataBooster.map((item) => {
                    const uniqueId = `booster-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("booster", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Suncare</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataSunCare.map((item) => {
                    const uniqueId = `suncare-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("suncare", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* accordion inside     */}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion
        type="single"
        className="AccordionHairCare rounded-2xl max-w-[300px] w-full bg-white px-4 transition-all outline-1 outline-neutral-100"
        collapsible
      >
        <AccordionItem value="item-11">
          <AccordionTrigger className="flex justify-between items-center group">
            <span className="font-bold text-base">Haircare</span>
            <FaPlusCircle className="h-4 w-4 group-data-[state=open]:hidden text-primary-700" />
            <FaMinusCircle className="h-4 w-4 hidden group-data-[state=open]:block text-primary-700" />
          </AccordionTrigger>
          <AccordionContent>
            {/* accordion inside     */}

            <Accordion
              className="w-auto px-4 bg-neutral-50 transition-all justify-between rounded-[12px] space-y-4"
              collapsible
            >
              <AccordionItem value="item-12">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Shampoo</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataShampoo.map((item) => {
                    const uniqueId = `shampoo-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("shampoo", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-13">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Hair styling</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataHairStyling.map((item) => {
                    const uniqueId = `hairstyling-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("hairstyling", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-14">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Hair treatment</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataHairTreatment.map((item) => {
                    const uniqueId = `hairtreatment-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("hairtreatment", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-15">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Hair tools</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataHairTools.map((item) => {
                    const uniqueId = `hairtools-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("hairtools", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* accordion inside     */}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion
        type="single"
        className="AccordionBathAndBody rounded-2xl max-w-[300px] w-full bg-white px-4 transition-all outline-1 outline-neutral-100"
        collapsible
      >
        <AccordionItem value="item-16">
          <AccordionTrigger className="flex justify-between items-center group">
            <span className="font-bold text-base">Bath and body</span>
            <FaPlusCircle className="h-4 w-4 group-data-[state=open]:hidden text-primary-700" />
            <FaMinusCircle className="h-4 w-4 hidden group-data-[state=open]:block text-primary-700" />
          </AccordionTrigger>
          <AccordionContent>
            {/* accordion inside     */}

            <Accordion
              className="w-auto px-4 bg-neutral-50 transition-all justify-between rounded-[12px] space-y-4"
              collapsible
            >
              <AccordionItem value="item-17">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Makeup Brush</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataMakeUpBrush.map((item) => {
                    const uniqueId = `makeupbrush-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("makeupbrush", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-18">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>organizer</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataOrganizer.map((item) => {
                    const uniqueId = `organizer-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("organizer", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-19">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Menicure & Pedicure</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataMenicure.map((item) => {
                    const uniqueId = `menipedi-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("menipedi", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-20">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Facial</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataFacial.map((item) => {
                    const uniqueId = `facial-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("facial", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-21">
                <AccordionTrigger className="relative">
                  <div className="absolute -left-4 h-full w-[4px] bg-primary-700 mr-10"></div>
                  <span>Makeup Tools</span>
                  <FaChevronDown className="h-3 w-3 after:rotate-180 group-data-[state=open]:hidden text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent className="space-y-2 py-2">
                  {DataMakeupTools.map((item) => {
                    const uniqueId = `makeuptools-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);

                    return (
                      <div
                        key={uniqueId}
                        onClick={() => handleSelect("makeuptools", item.id)}
                        className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                          isActive
                            ? "bg-neutral-100 text-neutral-950"
                            : "hover:bg-neutral-100"
                        }`}
                      >
                        <Checkbox id="toggle" checked={isActive} />
                        <div>{item.category}</div>
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* accordion inside     */}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="TitleCat-2 flex w-full space-x-4 jus">
        <h3 className="w-[146px] font-medium text-base">Price range</h3>{" "}
        <hr className="w-full border-t border-primary-700 my-4" />
      </div>
      <div className="Price flex-row w-full space-y-2 items-center">
        <div className="textfieldmin w-full">
          <span className="text-xs">Minimum price</span>
          <TooltipProvider>
            <Tooltip open={showTooltipMin}>
              <TooltipTrigger asChild>
                <TxtField
                  value={formatToRupiah(minPrice)}
                  onChange={(e) => handleChange(e, "min")}
                  placeholder="Rp.0"
                  variant="outline"
                  size="sm"
                  className="w-full"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>You can only enter a number</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="textfieldmax space-y-1 w-full">
          <span className="text-xs">Maximum price</span>
          <TooltipProvider>
            <Tooltip open={showTooltipMax}>
              <TooltipTrigger asChild>
                <TxtField
                  value={formatToRupiah(maxPrice)}
                  onChange={(e) => handleChange(e, "max")}
                  placeholder="Rp.0"
                  variant="outline"
                  size="sm"
                  className="w-full"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>You can only enter a number</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="TitleCat-3 flex w-full space-x-4 jus">
        <h3 className="w-[146px] font-medium text-base">By concern</h3>
        <hr className="w-full border-t border-primary-700 my-4" />
      </div>
      <Accordion
        type="single"
        className="AccordionSkinConcern rounded-2xl w-full bg-white px-4 transition-all outline-1 outline-neutral-100"
        collapsible
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="flex justify-between items-center group">
            <span className="font-bold text-base">Skin concern </span>
            <FaPlusCircle className="h-4 w-4 group-data-[state=open]:hidden text-primary-700" />
            <FaMinusCircle className="h-4 w-4 hidden group-data-[state=open]:block text-primary-700" />
          </AccordionTrigger>

          <AccordionContent className="space-y-2 py-2">
            {DataSkinConcern.map((item) => {
              const uniqueId = `skinconcern-${item.id}`;
              const isActive = selectedFilters.includes(uniqueId);

              return (
                <div
                  key={uniqueId}
                  onClick={() => handleSelect("skinconcern", item.id)}
                  className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                    isActive
                      ? "bg-primary-700 text-white"
                      : "hover:bg-neutral-100"
                  }`}
                >
                  <Checkbox id="toggle" checked={isActive} />
                  <div>{item.skinconcern}</div>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="flex justify-between items-center group">
            <span className="font-bold text-base">Body concern </span>
            <FaPlusCircle className="h-4 w-4 group-data-[state=open]:hidden text-primary-700" />
            <FaMinusCircle className="h-4 w-4 hidden group-data-[state=open]:block text-primary-700" />
          </AccordionTrigger>

          <AccordionContent className="space-y-2 py-2">
            {DataBodyConcern.map((item) => {
              const uniqueId = `skinconcern-${item.id}`;
              const isActive = selectedFilters.includes(uniqueId);

              return (
                <div
                  key={uniqueId}
                  onClick={() => handleSelect("skinconcern", item.id)}
                  className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                    isActive
                      ? "bg-primary-700 text-white"
                      : "hover:bg-neutral-100"
                  }`}
                >
                  <Checkbox id="toggle" checked={isActive} />
                  <div>{item.bodyconcern}</div>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="flex justify-between items-center group">
            <span className="font-bold text-base">Hair concern </span>
            <FaPlusCircle className="h-4 w-4 group-data-[state=open]:hidden text-primary-700" />
            <FaMinusCircle className="h-4 w-4 hidden group-data-[state=open]:block text-primary-700" />
          </AccordionTrigger>

          <AccordionContent className="space-y-2 py-2">
            {DataHairConcern.map((item) => {
              const uniqueId = `skinconcern-${item.id}`;
              const isActive = selectedFilters.includes(uniqueId);

              return (
                <div
                  key={uniqueId}
                  onClick={() => handleSelect("skinconcern", item.id)}
                  className={`w-full text-left px-2 py-2 flex items-center space-x-2 rounded-md transition-all text-sm cursor-pointer ${
                    isActive
                      ? "bg-primary-700 text-white"
                      : "hover:bg-neutral-100"
                  }`}
                >
                  <Checkbox id="toggle" checked={isActive} />
                  <div>{item.hairconcern}</div>
                </div>
              );
            })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {showBrandFilter && (
        <>
          <div className="TitleCat-4 flex w-full space-x-4 justify-between">
            <h3 className="w-auto font-medium text-base">Brand</h3>
            <hr className="w-full border-t border-primary-700 my-4" />
          </div>
          <div className="w-full items-start space-y-4">
            <TxtField
              placeholder="Search brand here..."
              iconLeftName="MagnifyingGlass"
              variant="outline"
              size="md"
              className="w-full"
              value={brandSearch ?? ""}
              onChange={(e) => setBrandSearch(e.target.value)}
            />

            <div className="flex flex-wrap gap-4 w-full py-2 px-1 h-auto max-h-64 overflow-y-auto custom-scrollbar">
              {filteredBrands.length === 0 ? (
                <div>brand tidak ditemukan</div>
              ) : (
                filteredBrands.map((item) => {
                  const uniqueId = `brand-${item.id}`;
                  const isActive = selectedFilters.includes(uniqueId);

                  return (
                    <Chip
                      key={item.id}
                      label={item.brandname}
                      onClick={() => handleSelect("brand", item.id)}
                      isActive={isActive}
                    >
                      {item.brandname}
                    </Chip>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      <div className="TitleCat-5 flex w-full space-x-4 justify-between items-center">
        <div className="items-center flex space-x-2">
          <h3 className="w-auto font-medium text-base">Rating</h3>
          <FaStar className="text-warning-300 h-[20px] w-[20px]" />
        </div>
        <hr className="w-full border-t border-primary-700 my-4" />
      </div>
      <div className="flex flex-wrap gap-4 w-full py-2 px-1">
        {DataRating.map((item) => {
          const uniqueId = `rating-${item.id}`;
          const isActive = selectedFilters.includes(uniqueId);

          return (
            <Chip
              key={item.id}
              label={item.star}
              onClick={() => handleSelect("rating", item.id)}
              isActive={isActive}
            >
              {item.star}
            </Chip>
          );
        })}
      </div>

      <div className="w-auto flex justify-between space-x-4">
        <Button
          onClick={handleReset}
          variant="primary"
          size="sm"
          disabled={selectedFilters.length === 0}
        >
          Reset filter
        </Button>
      </div>
    </div>
  );
}
