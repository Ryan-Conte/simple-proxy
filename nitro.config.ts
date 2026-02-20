export default defineNitroConfig({
  noPublicDir: true,
  srcDir: './src',
  preset: 'cloudflare',
  alias: {
    '@': './src',
  },
});
