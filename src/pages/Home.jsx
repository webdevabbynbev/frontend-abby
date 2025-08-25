import { AbbySection, BathBody, LogoAB, Product1, BeautyMerdeka, BeautyKit, BevSection, Brand, HairCare, LogoAbText, LogoAb, Makeup, Menscare, Perfume, SkinCare } from "@/assets"
import { HeroSlider,CatCard,Button, ItemCard, Carousel } from "@/components"

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


    <div className="Container text-[20px] w-full text-primary700 p-20 space-y-4">
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
  
    <div className="flex p-20 bg-primary100 items-start justify-between space-x-6 bg-[url('/src/assets/Logo_SVG_AB.svg')] bg-no-repeat">
      <div className="w-auto space-y-6">
        <div className="font-damion text-4xl text-primary700">Flash Sale Up to 50% OFF! </div>
          <div className="text-lg font-medium"> Your Favorite Beauty Essentials, Now at Irresistible Prices 
              Limited Time Only — While Stock Lasts!
        </div>
        <Button variant="primary" size="md">See more flash sale product</Button>
      </div>
        <Carousel/>
    </div>

    </div>

  )
}


console.log("Home render OK")