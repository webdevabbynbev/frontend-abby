"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { Pagination, Navigation, Autoplay } from "swiper/modules";

export function Carousel({ products, CardComponent, SlidesPerView }) {
  return (
    <>
      <Swiper
        modules={[Pagination, Navigation, Autoplay]}
        slidesPerView="auto"
        spaceBetween={30}
        // autoplay={{ delay: 4000 }}
        // loop={true}
        navigation={{
          clickable: true,
        }}
        slidesOffsetAfter={0}
        watchOverflow={true}
        // pagination={{
        //   clickable: true,
        // }}
        className="mySwiper"
      >
        {products.map((item, idx) => (
          <SwiperSlide key={idx} className="!w-[200px]">
            <CardComponent item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
