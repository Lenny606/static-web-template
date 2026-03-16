/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./pages/**/*.{html,js}",
        "./en/**/*.{html,js}",
        "./assets/js/**/*.js",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1a1a1a',
                'background-light': '#ffffff',
                'background-dark': '#1a1a1a',
                'text-light': '#1a1a1a',
                'text-dark': '#ffffff',
            }
        },
    },
    plugins: [],
}
