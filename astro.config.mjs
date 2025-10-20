import { defineConfig } from 'astro/config';
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

export default defineConfig({
  site: 'https://hackall360.github.io',
  outDir: './docs',
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false
      }
    }),
    projectsAutoSync()
  ]
});
