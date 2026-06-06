// tailwind.config.js
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#c7f284",
          hover: "#b5e36f",
        },
        mint: {
          100: "#e6f7ef",
          300: "#bfead5",
          500: "#8fd9b6",
          700: "#5fb88f",
        },
        sage: {
          50: "#eef3ef",
          200: "#d7e2dc",
          400: "#9db3a8",
          700: "#3f4c47",
        },
        brand: {
          50: "#eef7e8",
          100: "#e1f2d2",
          200: "#cbe9a8",
          300: "#b4df82",
          400: "#a0d469",
          500: "#8bcf7a",
          600: "#6fb861",
          700: "#559a4b",
          800: "#417a3b",
          900: "#315c2f",
          950: "#1b3a1c",
        },
        surface: {
          50: "#f8f9fc",
          100: "#f0f1f5",
          200: "#e2e4eb",
          700: "#1e2235",
          800: "#151829",
          900: "#0e1020",
          950: "#080a14",
        },
      },
      fontFamily: {
        sans: [
          "Manrope",
          "Sora",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "mesh-green":
          "radial-gradient(60% 80% at 10% 10%, rgba(157, 179, 168, 0.5) 0%, rgba(157, 179, 168, 0) 60%), radial-gradient(80% 60% at 90% 10%, rgba(120, 132, 148, 0.4) 0%, rgba(120, 132, 148, 0) 55%), radial-gradient(70% 70% at 50% 90%, rgba(184, 200, 190, 0.45) 0%, rgba(184, 200, 190, 0) 60%), linear-gradient(180deg, #edf2ef 0%, #dfe6e2 100%)",
        "saas-mesh":
          "radial-gradient(60% 70% at 12% 10%, rgba(199, 242, 132, 0.28) 0%, rgba(199, 242, 132, 0) 65%), radial-gradient(70% 60% at 85% 15%, rgba(157, 179, 168, 0.28) 0%, rgba(157, 179, 168, 0) 65%), radial-gradient(80% 80% at 50% 90%, rgba(143, 217, 182, 0.25) 0%, rgba(143, 217, 182, 0) 70%), linear-gradient(180deg, #eef3ef 0%, #e2ebe6 100%)",
      },
      boxShadow: {
        glass:
          "0 1px 1px rgba(255, 255, 255, 0.35) inset, 0 12px 30px rgba(15, 23, 42, 0.18), 0 2px 8px rgba(15, 23, 42, 0.12)",
      },
      animation: {
        "badge-scroll": "badge-scroll 28s linear infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "fade-in": "fade-in 0.35s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
      },
      keyframes: {
        "badge-scroll": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
};
