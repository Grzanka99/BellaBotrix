// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@vueuse/nuxt", "@pinia/nuxt"],
  runtimeConfig: {
    auth: {
      name: "nuxt-session",
      password: "verysupersecretverysupersecretverysupersecret",
    },
  },
  ssr: false,
  components: {
    dirs: []
  }
});
