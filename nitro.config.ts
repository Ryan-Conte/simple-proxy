import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { defineNitroConfig } from 'nitropack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineNitroConfig({
  noPublicDir: true,
  srcDir: './src',
  preset: 'cloudflare',
  alias: {
    '@': join(__dirname, 'src'),
  },
});
