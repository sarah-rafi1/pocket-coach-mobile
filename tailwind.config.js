/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",          // ← critical: scans all files in app/ and subfolders/groups
    "./components/**/*.{js,jsx,ts,tsx}",   // your components folder
    "./App.{js,jsx,ts,tsx}",               // optional: root App if needed
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};