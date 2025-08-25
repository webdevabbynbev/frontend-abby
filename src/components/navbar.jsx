import Logo from "@/assets/Logoabby-text.svg"
import Button from "@/components/button"

export default function Navbar () {
  return (
    <nav className="Navbar h-[20vh] sticky top-0 w-full transition-all items-center z-50">
        <div className="Container px-[64px] py-[24px] bg-white border-b-[1px] border-primary700">
            <div className="navbar-box flex-row items-center space-y-4">
                <div className="content-navbar flex items-center justify-between">
                    <div></div>
                    <img src={Logo} alt="Logo" className="w-[200px] h-auto"></img>
                    <ul className="flex justify-center space-x-[16px]">
                            <i className="fa-regular fa-cart-shopping text-primary700"></i>
                            <i className="fa-regular fa-user text-primary700"></i>
                    </ul>
                </div>
                <ul className="flex justify-center space-x-[24px]">
                            <li><a href="#">Home</a></li>
                            <li><a href="#">Shop</a></li>
                            <li><a href="#">Best seller</a></li>
                            <li><a href="#">Sale</a></li>
                            <li><a href="#">New arrivals</a></li>
                            <li><a href="#">Beauty and tips</a></li>
                </ul>
            </div>
        </div>
    </nav>
  )
}
