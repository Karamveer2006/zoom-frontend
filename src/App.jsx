import { BrowserRouter, Route, Routes } from "react-router-dom"
import Landing from "./pages/Landing"
import Authentication from "./pages/Authentication"
import  {AuthProvider}  from "./contexts/AuthContext.jsx"
import VideoComponent from "./pages/VideoComponent.jsx"
import Home from './pages/Home.jsx'
import History from "./pages/History.jsx"




function App() {
  

  return (  
    <div className="App">
    <BrowserRouter>
    <AuthProvider>
  
    <Routes>

      
    <Route path="/" element={<Landing />} />
    <Route path="/auth" element={<Authentication />} />
    <Route path="/:url" element={<VideoComponent/>} />
    <Route path ="/history" element={<History/>} />
    <Route path="/home" element={<Home/>}/>
      
    </Routes>
    </AuthProvider>
    </BrowserRouter>
    </div>
  )
}

export default App
