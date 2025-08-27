import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import '@/style/carousel.css';

import { Pagination, Navigation, Autoplay } from 'swiper/modules';

export default function Carousel( {products, CardComponent} ) {
  
  return (
    <>
      <Swiper
        modules={[Pagination, Navigation, Autoplay]}
        slidesPerView="auto"
        spaceBetween={30}
        // autoplay={{ delay: 4000 }}
        // loop={true}
        navigation={{
            clickable:true
        }}
        slidesOffsetAfter={0}
        watchOverflow={true}
        // pagination={{
        //   clickable: true,
        // }}
        className="mySwiper"
      >         
        {products.map((item, idx) =>  (
        <SwiperSlide key={idx}>
          <CardComponent {...item} />
        </SwiperSlide>
      ))}
      
      </Swiper>
    </>
  );
}
