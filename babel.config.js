module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Add this last if you're using react-native-reanimated@4.x (which you are: 4.1.6)
    plugins: ["react-native-worklets/plugin"],
  };
};