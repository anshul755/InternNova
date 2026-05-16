import React from "react";

const GlassCard = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white/45 backdrop-blur-lg border border-white/50 shadow-glass rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
