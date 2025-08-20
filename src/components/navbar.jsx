import Logo from "@/assets/Logoabby-text.svg"
const Navbar = () => {
  return (
    <div className="Navbar fixed w-full transition-all items-center">
        <div className="Container px-[64px] py-[24px] bg-white border-b-[2px] border-primary700">
            <div className="navbar-box flex-row items-center">
                <div className="content-navbar flex items-center justify-between">
                    <img src={Logo} alt="Logo" className="w-[200px] h-auto"></img>
                    <ul className="flex justify-center space-x-[24px]">
                            <i className="fas fa-home text-blue-600 text-xl"></i>
                            <li><a href="#">Home</a></li>
                            <li><a href="#">beranda</a></li>
                            <li><a href="#">Home</a></li>
                    </ul>
                </div>
                <ul className="flex justify-center space-x-[24px]">
                            <li><a href="#">Home</a></li>
                            <li><a href="#">beranda</a></li>
                            <li><a href="#">Home</a></li>
                </ul>
            </div>
        </div>
    </div>
  )
}

export default Navbar
