/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5b5df5",
        secondary: "#7b61ff",
      },
      boxShadow: {
        "card-lg": "0 10px 30px rgba(79,70,229,0.08)",
      }
    },
  },
  plugins: [],
};
