// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  plugins: ["~/plugins/socket.io.ts"],
  css: ["~/assets/css/global.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: [
    "@pinia/nuxt",
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          Montserrat: [400, 500, 600, 700, 800, 900],
        },
      },
    ],
  ],
  pinia: {
    autoImports: ["defineStore"],
  },
  runtimeConfig: {
    public: {
      NUXT_API: process.env.NUXT_API,
    },
  },
});
