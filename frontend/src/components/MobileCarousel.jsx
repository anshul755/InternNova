import React, { useState, useEffect, useRef } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

const slides = [
  {
    alt: "AI Welcome Dashboard",
    title: "Personalized Talent Dashboard",
    description: "Easily track application statuses, tailored resumes, and direct matching stats.",
    route: "internnova.com/dashboard"
  },
  {
    alt: "Compare resume with job",
    title: "ATS Resume Comparison",
    description: "Compare your resume against any job description to find missing key terms.",
    route: "internnova.com/jobs/software-engineer-intern"
  },
  {
    alt: "ATS Friendly Resume Creator",
    title: "Tailored Resume Generation",
    description: "Generate a targeted, ATS-friendly PDF copy aligned directly to the job post.",
    route: "internnova.com/profile"
  },
  {
    alt: "Real Profile Grounding",
    title: "Profile-Grounded AI Suggestions",
    description: "Optimize details while guaranteeing suggestions are built on your actual history.",
    route: "internnova.com/profile"
  }
];

const darkSrcs = ["/swap-card/D1.png", "/swap-card/D2.png", "/swap-card/D3.png", "/swap-card/D4.png"];
const lightSrcs = ["/swap-card/L1.png", "/swap-card/L2.png", "/swap-card/L3.png", "/swap-card/L4.png"];

const MobileCarousel = ({ isDark = false }) => {
  const images = slides.map((slide, i) => ({
    ...slide,
    src: isDark ? darkSrcs[i] : lightSrcs[i],
  }));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayTimer = useRef(null);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const resetTimer = () => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
    }
    autoPlayTimer.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4500);
  };

  useEffect(() => {
    if (!isHovered) {
      resetTimer();
    } else {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    }
    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [isHovered]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    resetTimer();
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
    resetTimer();
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const deltaX = touchStartX.current - touchEndX.current;
    if (deltaX > 50) {
      handleNext();
    } else if (deltaX < -50) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div 
      className="group relative flex flex-col items-center w-full px-1 py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium Browser Mockup Container */}
      <div className="w-full max-w-md mx-auto rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Browser Header Top Bar */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/20 dark:bg-slate-900/20 select-none">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400/80 dark:bg-red-500/60" />
            <div className="w-2 h-2 rounded-full bg-amber-400/80 dark:bg-amber-500/60" />
            <div className="w-2 h-2 rounded-full bg-emerald-400/80 dark:bg-emerald-500/60" />
          </div>
          <div className="flex-1 max-w-[65%] mx-auto h-5 rounded-md bg-slate-100/60 dark:bg-slate-800/60 flex items-center justify-center px-2 border border-slate-200/30 dark:border-slate-700/30 text-[8.5px] text-slate-500/80 dark:text-slate-400/80 font-mono tracking-wide">
            {images[activeIndex].route}
          </div>
          <div className="w-8" />
        </div>

        {/* Mockup Screen Viewport */}
        <div 
          className="relative overflow-hidden aspect-[16/10.5] bg-slate-950"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides Wrapper */}
          <div 
            className="flex transition-transform duration-500 ease-out h-full"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 relative">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover object-top select-none"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Navigation Controls (Simple overlays, touch friendly) */}
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-white/80 dark:bg-slate-900/85 text-slate-800 dark:text-white shadow-lg border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-sm opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Previous image"
          >
            <IoChevronBackOutline className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-white/80 dark:bg-slate-900/85 text-slate-800 dark:text-white shadow-lg border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-sm opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Next image"
          >
            <IoChevronForwardOutline className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Indicator Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveIndex(idx);
              resetTimer();
            }}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === activeIndex
                ? "w-5 bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-400"
                : "w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileCarousel;
