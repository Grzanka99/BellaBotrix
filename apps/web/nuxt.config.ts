// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    auth: {
      name: "nuxt-session",
      password: "verysupersecretverysupersecretverysupersecret",
    },
  },
  ssr: false,
});
