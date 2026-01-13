import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import CompanyRegister from "./pages/CompanyRegister.jsx";
import TalentRegister from "./pages/TalentRegister.jsx";

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        {/* Point user registration to the Talent multi-step flow */}
        <Route path="/register/user" element={<TalentRegister />} />
        <Route path="/register/talent" element={<TalentRegister />} />
        <Route path="/register/company" element={<CompanyRegister />} />
      </Routes>
    </div>
  );
}

export default App;
