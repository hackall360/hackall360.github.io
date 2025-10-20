#!/usr/bin/env node
import process from 'node:process';
import { syncProjects } from './github-projects.mjs';

async function main() {
  try {
    const result = await syncProjects({ env: process.env, respectAutoSyncSetting: false });

    if (result.skipped && result.reason === 'cache') {
      console.log(`Using cached project data at ${result.path}`);
    }
  } catch (error) {
    console.error('Failed to fetch GitHub projects.', error);
    process.exitCode = 1;
  }
}

main();
