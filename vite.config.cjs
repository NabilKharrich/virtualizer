const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "virtualizer",
      fileName: (format) => `virtualizer.${format}.js`,
    },
    rollupOptions: {},
  },
});
