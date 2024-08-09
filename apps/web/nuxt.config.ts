// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  nitro: {
    preset: "vercel",
  },
  modules: ["@vueuse/nuxt", "@pinia/nuxt", "nuxt-icon"],
  plugins: [{ src: "./plugins/apexcharts.client.ts", mode: "client" }],
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
