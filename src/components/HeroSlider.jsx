import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { BeautyMerdeka } from "@/assets"

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function HeroSlider() {
  return (
    <div className="w-full h-[100vh]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
        className="w-full h-full"
        direction="vertical"
      >
        <SwiperSlide>
          <div className="h-screen items-center justify-center">
            <img src={BeautyMerdeka} alt="Beauty merdeka" className="h-full w-full object-cover"></img>
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