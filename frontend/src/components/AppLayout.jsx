import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { FullPageLoader } from "./Skeleton.jsx";

/**
 * AppLayout — persistent shell wrapping all routes.
 * Renders the unified Navbar, a page content area with top-padding
 * for the fixed navbar, and the Footer.
 *
 * Landing page keeps its own blue gradient background.
 * All other pages use the light slate-50 background.
 */
export default function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === "/" || location.pathname === "";
  const showShellChrome = !isLanding;

  return (
    <div className="saas-shell flex flex-col">
      <div className="saas-backdrop" aria-hidden="true" />
      {showShellChrome && <Navbar />}

      {/* pt-16 offsets the fixed navbar height (h-16 = 4rem) */}
      <main className={`flex-1 ${showShellChrome ? "pt-16" : ""} saas-section`}>
        <div key={location.pathname} className={isLanding ? "" : "page-enter"}>
          <Suspense fallback={<FullPageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      {showShellChrome && <Footer />}
    </div>
  );
}
