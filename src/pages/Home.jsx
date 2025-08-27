import { AbbySection, BathBody, LogoAB, Product1, BeautyMerdeka, BeautyKit, BevSection, Brand, HairCare, LogoAbText, LogoAb, Makeup, Menscare, Perfume, SkinCare } from "@/assets"
import { HeroSlider,CatCard, BrandList, Button, BtnIconToggle, Carousel, BrandCard, FlashSaleCard, RegularCard  } from "@/components"
import { FlashSaleProducts, BevPick} from '../data/Products';
import { DataBrand } from "../data/Brand";
import { FaUser, FaCog, FaTimes } from 'react-icons/fa';

export default function Home () {
  return (
    <div className="Container flex-row">
      <div className="Hero-wrapper w-full flex justify-between">
        <HeroSlider/>
      
        <div className="w-full flex-row h-screen">
          <div className="relative max-h-[50vh]">
            <img src={AbbySection} alt="Abby" className="h-[50vh] w-auto object-cover"/>

               <div className="Card absolute inset-0 left-2 flex items-center justify-end mr-4 text-primary100">
                  <div className="bg-[#a3a3a3]/50 backdrop-blur-sm shadow-lg rounded-[12px] p-4 max-w-[357px] text-left space-y-4">
                    <h3 className="text-[28px] font-normal font-damion">Abby</h3>
                    <p className="mt-2">Meet Abby – Your Makeup Matchmaker</p>
                    <p className="mt-2">From everyday essentials to bold glam, Abby helps you find the best makeup that suits your style.</p>
                    <Button variant="secondary" size="md">Explore with abby</Button>
                 </div>
               </div>
           </div>

          <div className="relative max-h-[50vh]">
            <img src={BevSection} alt="Bev" className="h-[50vh] w-auto object-cover"/>

               <div className="Card absolute inset-0 left-2 flex items-center justify-start ml-4 text-primary700">
                  <div className="bg-[#ffffff]/50 backdrop-blur-sm shadow-lg rounded-[12px] p-4 max-w-[357px] text-left space-y-4">
                    <h3 className="text-[28px] font-normal font-damion">Bev</h3>
                    <p className="mt-2">Say Hi to Bev – Your Skincare Bestie</p>
                    <p className="mt-2">Bev curates skincare that works for your skin type, concerns, and routine — no guesswork needed.</p>
                    <Button variant="primary" size="md">Explore with bev</Button>
                 </div>
               </div>
           </div>
        </div>
      </div>


    <div className="ContainerCategory max-w-[1536px] mx-auto text-[20px] w-full text-primary700 p-16 space-y-4">
     <div className="Title font-medium">Category</div>
      <div className="items-center justify-between flex flex-wrap gap-6 w-full">          
          <CatCard image={Makeup} title="MAKEUP"/>
          <CatCard image={SkinCare} title="SKINCARE" />
          <CatCard image={HairCare} title="HAIRCARE" />
          <CatCard image={BeautyKit} title="BEAUTY KIT"/>
          <CatCard image={BathBody} title="BATH & BODY"/>
          <CatCard image={Menscare} title="MEN'S CARE"/>
          <CatCard image={Perfume} title="PERFUME"/>
          <CatCard image={Brand} title="HIGHEND BRAND"/>
      </div>
    </div>
  
    <div className="ContainerFlashSale w-full flex p-16 bg-primary100 items-center justify-center space-x-6 bg-[url('/src/assets/Logo_SVG_AB.svg')] bg-no-repeat bg-center">
      <div className="Wrapper items-center w-full max-w-[1536px] mx-auto flex space-x-20">
      <div className="leftWrapper flex-row w-full space-y-6">
        <p className="font-damion text-4xl text-primary700">Flash Sale Up to 50% OFF! </p>
        <p>Your Favorite Beauty Essentials, Now at Irresistible Prices Limited Time Only — While Stock Lasts!</p>
        <Button variant="primary" size="md">See more flash sale product</Button>
      </div>
      <Carousel className="max-w-[50%]" products={FlashSaleProducts} CardComponent={FlashSaleCard}/>
      </div>  
      
    </div>
    
    <div className="ContainerAbbyBev p-16 space-y-16 w-full">
      <div className="max-w-[1536px] mx-auto rounded-[40px] bg-primary50 wrapper flex-row space-y-6 p-6 outline outline-1 outline-primary300">
      <div className="flex items-start justify-between">
        <div className="flex-row space-y-1">
        <h3 className="font-damion font-normal text-4xl text-primary700">Abby's Pick</h3>
        <p>Your Makeup Matchmaker</p>
        </div>
        <Button variant="secondary" size="md">See all</Button>
      </div>
      <Carousel products={BevPick} CardComponent={RegularCard}/>
      </div>

      <div className="max-w-[1536px] mx-auto rounded-[40px] bg-primary50 wrapper flex-row space-y-6 p-6 outline outline-1 outline-primary300">
      <div className="flex items-start justify-between">
        <div className="flex-row space-y-1  items-center justify-center">
        <h3 className="font-damion font-normal text-4xl text-primary700">Bev's Pick</h3>
        <p>Your skinCare Bestie</p>
        </div>
        <Button variant="secondary" size="md">See all</Button>
      </div>
      <Carousel products={BevPick} CardComponent={RegularCard}/>
      </div>
      
    </div>

    <div className="Container flex p-16 bg-primary100 items-center justify-center space-x-6 bg-[url('/src/assets/Logo_SVG_AB.svg')] bg-no-repeat bg-center">
      <div className="flex max-w-[1536px] mx-auto space-x-10">
      <div className="Wrapper flex-row w-full space-y-6">
        <h3 className="font-damion text-4xl text-primary700">Shop by brands </h3>
          <div className="flex-row text-lg font-medium space-y-6"> <p>From best-sellers to hidden gems — explore top beauty brands, handpicked by Abby n Bev.</p>
             <Button variant="primary" size="md">Discover more </Button>
           </div>
      </div>
      <div className="min-w-[50%] max-w-[1536px] mx-auto"><BrandList className="space-x-10 space-y-10" data={DataBrand}/></div>
    </div>
    </div>
    </div>

  )
}


console.log("Home render OK")