// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ["@vueuse/nuxt", "@pinia/nuxt", "nuxt-icon"],
  runtimeConfig: {
    auth: {
      name: "nuxt-session",
      password: "verysupersecretverysupersecretverysupersecret",
    },
  },
  ssr: false,
  components: {
    dirs: [],
  },
  experimental: {
    componentIslands: true,
  },
});
