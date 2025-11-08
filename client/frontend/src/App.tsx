import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { Home } from "./components/Home";
import { Button } from "@/components/ui/button"; // For placeholder pages (if you use shadcn)
import Signup from "./components/Signup";
import LoginPage from "./components/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page at root */}
        <Route path="/" element={<LandingPage />} />

        {/* Main app */}
        <Route path="/home" element={<Home />} />

        {/* Placeholder routes (optional, replace later) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
       </Routes>
    </BrowserRouter>
  );
}

export default App;
