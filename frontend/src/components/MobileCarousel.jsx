import React, { useState, useEffect, useRef } from "react";

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
      {/* Premium Mockup Container */}
      <div className="w-full max-w-md mx-auto rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Mockup Screen Viewport */}
        <div 
          className="relative overflow-hidden aspect-[16/10.5] bg-slate-950"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slides Wrapper */}
          <div 
            className="flex h-full"
            style={{ 
              transform: `translateX(-${activeIndex * 100}%)`,
              transition: 'transform 650ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
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
