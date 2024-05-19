const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      xs: { min: "400px", max: "639px" },
      "xs-plus": { min: "400px" },
      ...defaultTheme.screens,
    },
    fontFamily: {
        sans: ["Poppins", ...defaultTheme.fontFamily.sans],
    },
    extend: {
      aspectRatio: {
        "4/3": "4 / 3",
        "17/22": "17 / 22",
      },
      colors: {
        primary: "#33658A",
        secondary: "#49C6E5",
        accent: "#00fdd2",
        neutral: "#1A1F16",
        dark: "#001011",
        lighter: "#f9f6e8",
        light: "#F8F4E3",
        light2: "#f5f0d9",
        light3: "#F3ECCF",
      },
    },
    plugins: [],
  },
};
