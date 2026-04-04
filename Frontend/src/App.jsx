import { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import CompanyRegister from "./pages/CompanyRegister.jsx";
import TalentRegister from "./pages/TalentRegister.jsx";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;

  let modalType = null;
  if (path === "/login") {
    modalType = "login";
  } else if (path === "/register/user" || path === "/register/talent") {
    modalType = "talent";
  } else if (path === "/register/company") {
    modalType = "company";
  }

  useEffect(() => {
    if (modalType) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [modalType]);

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen relative">
      <Landing />

      {modalType && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 backdrop-blur-2xl">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto no-scrollbar px-4 py-4">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-6 top-6 z-50 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 border border-slate-600 text-slate-200 text-base shadow-sm backdrop-blur-md hover:bg-slate-800 hover:text-white hover:border-slate-400 transition-colors"
              aria-label="Close"
            >
              <IoClose className="h-5 w-5" />
            </button>

            {modalType === "login" && <Login modal />}
            {modalType === "talent" && <TalentRegister modal />}
            {modalType === "company" && <CompanyRegister modal />}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
