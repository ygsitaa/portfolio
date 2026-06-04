import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  modules: ['@tresjs/nuxt'],
  app: {
    baseURL: '/portfolio/',
    head: {
      title: 'Portfolio - Daniel Hodiamont',
      script: [
        {
          innerHTML: 'document.documentElement.classList.add("app-loading")',
          tagPosition: 'head',
        },
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css',
          crossorigin: 'anonymous'
        },
        {
          rel: 'icon',
          type: "image/x-icon",
          href: '/favicon-v2.ico'
        },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
          type: 'image/png'
        },
        {
          rel: 'manifest',
          href: '/site.webmanifest'
        },
      ]
    }
  }
});
