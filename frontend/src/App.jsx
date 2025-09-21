import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Login from './pages/Login'
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import Owner from "./pages/Owner";
import User from "./pages/User";
function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/admin/dashboard' element={<Admin/>}/>
        <Route path='/owner/dashboard' element={<Owner/>}/>
        <Route path='/user/dashboard' element={<User/>}/>
      </Routes>
    </Router>
    </>
      
  )
}

export default App
