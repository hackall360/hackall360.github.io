import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://hackall360.github.io',
  integrations: [tailwind({
    config: {
      applyBaseStyles: false
    }
  })]
});
