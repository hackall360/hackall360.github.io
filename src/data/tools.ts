import type { IconName } from '~/utils/iconPaths';

export interface Tool {
  name: string;
  description: string;
  href: string;
  icon: IconName;
  ctaLabel?: string;
}

export const tools: Tool[] = [
  {
    name: 'NeoGradleTemplate',
    description: 'Production-ready Gradle service skeleton with CI, observability, and hardening baked in.',
    href: 'https://github.com/hackall360/NeoGradleTemplate',
    icon: 'gitPullRequest',
    ctaLabel: 'View template'
  },
  {
    name: 'Dotfiles',
    description: 'Opinionated development environment bootstrap with linting, Git hooks, and secrets hygiene.',
    href: 'https://github.com/hackall360/dotfiles',
    icon: 'github',
    ctaLabel: 'Explore dotfiles'
  },
  {
    name: 'Incident CLI',
    description: 'Terminal toolkit for opening incidents, syncing timelines, and paging crews with a single command.',
    href: 'https://github.com/hackall360/incident-cli',
    icon: 'terminal',
    ctaLabel: 'Open the CLI'
  }
];

export default tools;
