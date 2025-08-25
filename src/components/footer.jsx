import Logo from "@/assets/Logoabby-text.svg"
import Button from "@/components/button"

export default function Footer () {
  return (
    <div className="Footer flex-row px-20 py-6 w-full space-y-12 bg-white">
      <div className="Container flex w-full h-full space-x-20"> 
          <div className="h-full"><img src={Logo} alt="Logo" className="w-[200px] h-auto"></img></div>
        <div className="Content-wrapper w-full items-start flex justify-between">  
        <div className="Container1 space-y-3">
           <h3 className="Title font-semibold text-[20px] text-neutral-950 w-full">About us</h3>
             <ul className="space-y-1">
                <li> About abby n bev</li>
                <li> Terms and condition</li>
                <li> Privacy policy</li>
                <li> Contact us</li>
            </ul>
        </div>

         <div className="Container2 space-y-3">
           <h3 className=" Title font-semibold text-[20px] text-neutral-950 w-full">Services</h3>
             <ul className="space-y-1">
                <li> Delivery</li>
                <li> Our store</li>
                <li> FaQ</li>
                <li> Customer service</li>
            </ul>
          </div>

            <div className="Container3 space-y-3 max-w-[245px]">
            <h3 className=" Title font-semibold text-[20px] text-neutral-950">Join Abeauty squad</h3>
            <p>Connect with fellow beauty lovers, share tips, stay on trend, 
             and grow together in a supportive community.</p>
             <div>
             <Button variant="secondary" size="md">Join ABeauties</Button>
             </div>
             </div>

              <div className="Container4 space-y-3">
           <h3 className=" Title font-semibold text-[20px] text-neutral-950 w-full">Our social media</h3>
             <ul className="">
                <li><i className="fa-brands fa-tiktok"></i>Tiktok</li>
                <li><i className="fa-brands fa-instagram"></i>Instagram</li>
            </ul>
        </div>

              
           </div>
        </div>
        <div className="w-full h-full text-center text-neutral-400">© 2025 CV. Gaya Beauty Utama, All Rights Reserved.</div>
      </div>
  )
}


