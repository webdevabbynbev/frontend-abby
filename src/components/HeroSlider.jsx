"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export function HeroSlider() {
  return (
    <div className="w-full h-full">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
        className="w-full h-full"
        direction="horizontal"
      >
        <SwiperSlide>
          <div className="w-full h-screen items-center justify-center object-contain">
            <img
              src="Beauty-merdeka.png"
              alt="Beauty merdeka"
              className="h-full w-full object-contain"
            ></img>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="h-screen bg-green-500 flex items-center justify-center text-white text-4xl font-bold">
            Slide 2
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="h-screen bg-red-500 flex items-center justify-center text-white text-4xl font-bold">
            Slide 3
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
