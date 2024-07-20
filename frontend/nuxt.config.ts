// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  app: {
    head: {
      title: "Meow Game - Play Card Games Online",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { hid: "description", name: "description", content: "Play the classic card games like Thirteen with our custom Meow card deck. Enjoy a fun and engaging online card gaming experience!" },
        { hid: "keywords", name: "keywords", content: "Meow Game, Thirteen Game, online card games, card games, Meow card" },
        { name: "author", content: "Nguyen Vinh Tieng" },
        { name: "robots", content: "index, follow" },
        { name: "googlebot", content: "index, follow" },
        // Open Graph / Facebook
        { property: "og:title", content: "Meow Game - Play Card Games Online" },
        { property: "og:description", content: "Play the classic card games like Thirteen with our custom Meow card deck. Enjoy a fun and engaging online card gaming experience!" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://game.nguyenvinhtieng.tech" },
        { property: "og:image", content: "https://game.nguyenvinhtieng.tech/images/ogp.jpg" },
        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Meow Game - Play Card Games Online" },
        { name: "twitter:description", content: "Play the classic card games like Thirteen with our custom Meow card deck. Enjoy a fun and engaging online card gaming experience!" },
        { name: "twitter:image", content: "https://game.nguyenvinhtieng.tech/images/ogp.jpg" },
        // Additional meta tags
        { name: "theme-color", content: "#ffffff" },
        { name: "application-name", content: "Meow Game" },
        { name: "msapplication-TileColor", content: "#ffffff" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/images/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/images/favicon.ico" },
      ],
    },
  },
  // Tailwind configuration
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
    '@nuxtjs/device',
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          Montserrat: [400, 500, 600, 700, 800, 900],
        },
      },
    ],
  ],
  device: {
    refreshOnResize: true,
  },
  pinia: {
    autoImports: ["defineStore"],
  },
  runtimeConfig: {
    public: {
      NUXT_API: process.env.NUXT_API,
    },
  },
});
