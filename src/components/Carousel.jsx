import { Swiper, SwiperSlide } from 'swiper/react';
import ItemCard from './ItemCard';
import { Product1 } from '../assets';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import '@/style/carousel.css';

import { Pagination, Navigation, Autoplay } from 'swiper/modules';

export default function Carousel() {
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
        // pagination={{
        //   clickable: true,
        // }}
        className="mySwiper"
      >
        <SwiperSlide>          
            <ItemCard Image={Product1} 
                            Category="Lip liner" 
                            ProductName="Milky wayMilky way powder mask 20gr"
                            Price="Rp.20.000"
                            RealPrice="10.000"
                            />
        </SwiperSlide>
        <SwiperSlide>
            <ItemCard Image={Product1} 
                            Category="Lip liner" 
                            ProductName="Milky wayMilky way powder mask 20gr"
                            Price="Rp.20.000"
                            RealPrice="10.000"
                            />
        </SwiperSlide>
        <SwiperSlide>
            <ItemCard Image={Product1} 
                            Category="Lip liner" 
                            ProductName="Milky wayMilky way powder mask 20gr"
                            Price="Rp.20.000"
                            RealPrice="10.000"
                            />
        </SwiperSlide>
        <SwiperSlide>
            <ItemCard Image={Product1} 
                            Category="Lip liner" 
                            ProductName="Milky wayMilky way powder mask 20gr"
                            Price="Rp.20.000"
                            RealPrice="10.000"
                            />
        </SwiperSlide>
        <SwiperSlide>
            <ItemCard Image={Product1} 
                            Category="Lip liner" 
                            ProductName="Milky wayMilky way powder mask 20gr"
                            Price="Rp.20.000"
                            RealPrice="10.000"
                            />
        </SwiperSlide>
        <SwiperSlide>
            <ItemCard Image={Product1} 
                            Category="Lip liner" 
                            ProductName="Milky wayMilky way powder mask 20gr"
                            Price="Rp.20.000"
                            RealPrice="10.000"
                            />
        </SwiperSlide>
        <SwiperSlide>
            <ItemCard Image={Product1} 
                            Category="Lip liner" 
                            ProductName="Milky wayMilky way powder mask 20gr"
                            Price="Rp.20.000"
                            RealPrice="10.000"
                            />
        </SwiperSlide>
        <SwiperSlide>
            <ItemCard Image={Product1} 
                            Category="Lip liner" 
                            ProductName="Milky wayMilky way powder mask 20gr"
                            Price="Rp.20.000"
                            RealPrice="10.000"
                            />
        </SwiperSlide>
        <SwiperSlide>
            <ItemCard Image={Product1} 
                            Category="Lip liner" 
                            ProductName="Milky wayMilky way powder mask 20gr"
                            Price="Rp.20.000"
                            RealPrice="10.000"
                            />
        </SwiperSlide>
      </Swiper>
    </>
  );
}
