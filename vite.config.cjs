const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      fileName: (format) => `virtualizer.${format}.js`,
      name: "Virtualizer",
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["normalize-wheel", "@nabilk/bigbro"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          nw: "normalize-wheel",
          bigbro: "Bigbro",
        },
      },
    },
  },
});
