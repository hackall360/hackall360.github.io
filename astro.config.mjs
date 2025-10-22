import { defineConfig } from 'astro/config';
import { build as esbuildBuild } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import tailwind from '@astrojs/tailwind';
import { syncProjects } from './scripts/github-projects.mjs';

function wrapLogger(logger) {
  return {
    info: (message, ...rest) => logger.info(message, ...rest),
    warn: (message, ...rest) => logger.warn(message, ...rest),
    error: (message, ...rest) => logger.error(message, ...rest)
  };
}

function projectsAutoSync() {
  let syncPromise = null;

  return {
    name: 'github-projects-auto-sync',
    hooks: {
      'astro:config:setup': ({ command, logger }) => {
        if (syncPromise || (command !== 'dev' && command !== 'build')) {
          return;
        }

        const wrappedLogger = wrapLogger(logger);

        const triggerSync = async () => {
          try {
            const result = await syncProjects({ env: process.env, logger: wrappedLogger });

            if (result.skipped) {
              if (result.reason === 'cache' && result.path) {
                logger.info(`GitHub projects cache reused from ${result.path}`);
              } else if (result.reason === 'auto-disabled') {
                logger.info('GitHub project auto-sync disabled (GITHUB_PROJECTS_AUTO_SYNC=false).');
              } else if (result.reason === 'disabled') {
                logger.info('GitHub project sync skipped by GITHUB_PROJECTS_SKIP_AUTO_SYNC.');
              } else {
                logger.info('GitHub project sync skipped.');
              }
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            logger.warn(`GitHub project sync failed: ${message}`);
            if (error instanceof Error && error.stack) {
              logger.debug?.(error.stack);
            }
          }
        };

        syncPromise = triggerSync();

        if (command === 'dev') {
          syncPromise.catch(() => {});
        }
      },
      'astro:server:start': async () => {
        if (syncPromise) {
          await syncPromise.catch(() => {});
        }
      },
      'astro:build:start': async () => {
        if (syncPromise) {
          await syncPromise;
        }
      }
    }
  };
}

function clientScriptPlugin() {
  let command = 'build';
  let bundledPath = null;

  const virtualModuleId = 'virtual:client-script-url';

  return {
    name: 'client-script-url-resolver',
    configResolved(resolvedConfig) {
      command = resolvedConfig.command;
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return id;
      }
      return null;
    },
    async load(id) {
      if (id === virtualModuleId) {
        if (command === 'serve') {
          return "export default '/src/scripts/client.ts';";
        }

        if (!bundledPath) {
          const entryPath = fileURLToPath(new URL('./src/scripts/client.ts', import.meta.url));
          const buildResult = await esbuildBuild({
            entryPoints: [entryPath],
            bundle: true,
            format: 'esm',
            platform: 'browser',
            write: false,
            sourcemap: false
          });

          const code = buildResult.outputFiles[0]?.text ?? '';
          const hash = createHash('sha256').update(code).digest('hex').slice(0, 8);
          const fileName = `_astro/client.${hash}.js`;

          this.emitFile({
            type: 'asset',
            fileName,
            source: code
          });

          bundledPath = `/${fileName}`;
        }

        return `export default ${JSON.stringify(bundledPath)};`;
      }
      return null;
    }
  };
}

function abstractImageStaticAssetPlugin() {
  const servedPath = '/AbstractImage.png';
  const imageUrl = new URL('./docs/AbstractImage.png', import.meta.url);
  const imagePath = fileURLToPath(imageUrl);

  let imageBuffer = null;
  let command = 'build';

  const loadImage = () => {
    try {
      imageBuffer = readFileSync(imagePath);
    } catch (error) {
      imageBuffer = null;
    }
  };

  loadImage();

  return {
    name: 'abstract-image-static-asset',
    configResolved(resolvedConfig) {
      command = resolvedConfig.command;
    },
    configureServer(server) {
      server.watcher.add(imagePath);
      server.middlewares.use((req, res, next) => {
        const requestPath = req.url?.split('?')[0] ?? '';

        if (requestPath !== servedPath) {
          next();
          return;
        }

        if (!imageBuffer) {
          loadImage();
        }

        if (!imageBuffer) {
          next();
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        res.end(imageBuffer);
      });

      server.watcher.on('change', (changedPath) => {
        if (changedPath === imagePath) {
          loadImage();
        }
      });
    },
    buildStart() {
      if (command !== 'build') {
        return;
      }

      if (!imageBuffer) {
        loadImage();
      }

      if (!imageBuffer) {
        this.error(
          new Error(
            `Abstract image not found at ${imagePath}. Ensure docs/AbstractImage.png is committed before building.`,
          ),
        );
        return;
      }

      this.addWatchFile(imagePath);
      this.emitFile({
        type: 'asset',
        fileName: 'AbstractImage.png',
        source: imageBuffer
      });
    }
  };
}

export default defineConfig({
  site: 'https://hackall360.github.io',
  outDir: './docs',
  vite: {
    build: {
      assetsInlineLimit: 0
    },
    plugins: [clientScriptPlugin(), abstractImageStaticAssetPlugin()]
  },
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false
      }
    }),
    projectsAutoSync()
  ]
});
