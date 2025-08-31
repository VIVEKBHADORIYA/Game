/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 20px rgba(56, 189, 248, 0.5)",
      }
    },
  },
  plugins: [],
};
