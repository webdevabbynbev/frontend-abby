import {Navbar, Footer} from "@/Components"

export default function Layout ({children}) {
  return (
    <div>
        <Navbar/>

         {children}

        <Footer/>    
    </div>

  )
}
