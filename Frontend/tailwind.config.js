// tailwind.config.js
module.exports = {
    theme: {
        extend: {
            animation: {
                'badge-scroll': 'badge-scroll 28s linear infinite',
            },
            keyframes: {
                'badge-scroll': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            }
        },
    },
}