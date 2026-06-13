import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

export default function CardSwap({ children, interval = 3500 }) {
  const containerRef = useRef(null);
  const childrenArray = React.Children.toArray(children);
  const [cards, setCards] = useState(() => childrenArray.map((_, i) => i));
  const isHovered = useRef(false);
  const isAnimating = useRef(false);

  // Initialize positions on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.children;
    cards.forEach((originalIndex, currentIndex) => {
      const el = elements[originalIndex];
      const xOffset = currentIndex * 30;
      const yOffset = currentIndex * -30;
      const scale = 1 - currentIndex * 0.05;
      const zIndex = cards.length - currentIndex;
      const opacity = currentIndex < 3 ? 1 - currentIndex * 0.15 : 0;
      gsap.set(el, { x: xOffset, y: yOffset, scale, zIndex, opacity });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const swapCards = useCallback(() => {
    if (!containerRef.current || isAnimating.current || cards.length <= 1)
      return;
    isAnimating.current = true;

    const elements = containerRef.current.children;
    const topCardEl = elements[cards[0]];

    // Animate top card left and fade out
    gsap.to(topCardEl, {
      x: -100,
      y: 20,
      scale: 0.95,
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: () => {
        // After leaving, move it to the back in state
        setCards((prev) => {
          const next = [...prev];
          const first = next.shift();
          next.push(first);
          return next;
        });
      },
    });
  }, [cards]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isHovered.current && document.visibilityState === "visible") {
        swapCards();
      }
    }, interval);
    return () => clearInterval(timer);
  }, [swapCards, interval]);

  useEffect(() => {
    if (!containerRef.current || !isAnimating.current) return;
    const elements = containerRef.current.children;

    cards.forEach((originalIndex, currentIndex) => {
      const el = elements[originalIndex];

      const xOffset = currentIndex * 30;
      const yOffset = currentIndex * -30;
      const scale = 1 - currentIndex * 0.05;
      const zIndex = cards.length - currentIndex;
      const opacity = currentIndex < 3 ? 1 - currentIndex * 0.15 : 0;

      // If this is the card that just went to the back
      if (currentIndex === cards.length - 1) {
        gsap.set(el, { x: xOffset + 40, y: yOffset - 40, scale, opacity: 0, zIndex });
        gsap.to(el, {
          x: xOffset,
          y: yOffset,
          opacity,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            isAnimating.current = false;
          },
        });
      } else {
        // Cards moving forward
        gsap.to(el, {
          x: xOffset,
          y: yOffset,
          scale,
          zIndex,
          opacity,
          duration: 0.5,
          ease: "power3.out",
        });
      }
    });

    const timeout = setTimeout(() => {
      isAnimating.current = false;
    }, 600);
    return () => clearTimeout(timeout);
  }, [cards]);

  return (
    <div
      className="relative w-full max-w-[650px] mx-auto aspect-[4/3] perspective-[1000px] mt-12 pr-12"
      onMouseEnter={() => (isHovered.current = true)}
      onMouseLeave={() => (isHovered.current = false)}
      ref={containerRef}
    >
      {childrenArray.map((child, i) => (
        <div
          key={i}
          className="absolute top-0 left-0 w-full transform-gpu cursor-pointer"
          onClick={() => {
            if (cards[0] === i) {
              // Optionally trigger swap when clicking the top card manually
              swapCards();
            }
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
