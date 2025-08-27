import "@/assets/fontawesome/css/all.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/home"
import Shop from "@/pages/Shop"
import Layout from "@/Layout/Layout";


export default function App() {
  return (
    <div className="min-h-screen bg-bgmaincolor">
      <Router>
         <Layout>
              <Routes>
                 <Route path="/" element={<Home />} />
                 <Route path="/Shop" element={<Shop />} />
              </Routes>
          </Layout>   
              
      </Router>
    </div>
    
  )
  
}