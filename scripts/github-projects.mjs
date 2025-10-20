import { mkdir, stat, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import process from 'node:process';
import { fetch, ProxyAgent, setGlobalDispatcher } from 'undici';

const defaultLogger = {
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args)
};

function toBoolean(value) {
  if (typeof value !== 'string') {
    return Boolean(value);
  }

  return /^(1|true|yes|on)$/i.test(value.trim());
}

function toList(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function toListPreserveCase(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNumber(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveConfig(env = process.env) {
  const proxyUrl =
    env.GITHUB_PROXY ??
    env.HTTPS_PROXY ??
    env.https_proxy ??
    env.HTTP_PROXY ??
    env.http_proxy ??
    null;

  const allowedRepos = toListPreserveCase(env.GITHUB_PROJECTS_INCLUDE_REPOS);
  const allowedReposNormalized = new Set(allowedRepos.map((name) => name.toLowerCase()));

  return {
    proxyUrl,
    owner: env.GITHUB_OWNER ?? 'hackall360',
    perPage: parseNumber(env.GITHUB_PER_PAGE, 100),
    minStars: parseNumber(env.GITHUB_MIN_STARS, 0),
    includeTopics: toList(env.GITHUB_INCLUDE_TOPICS),
    featureTopic: (env.GITHUB_FEATURE_TOPIC ?? 'featured').toLowerCase(),
    caseStudyTopic: (env.GITHUB_CASE_STUDY_TOPIC ?? 'case-study').toLowerCase(),
    caseStudyPrefix: (env.GITHUB_CASE_STUDY_PREFIX ?? 'case-study:').toLowerCase(),
    outputPath: resolve(process.cwd(), env.GITHUB_PROJECTS_OUTPUT ?? 'src/data/projects.json'),
    cacheMaxAgeHours: parseNumber(env.GITHUB_PROJECTS_CACHE_MAX_AGE_HOURS, 24),
    forceRefresh: toBoolean(env.GITHUB_PROJECTS_FORCE_REFRESH),
    token: env.GITHUB_TOKEN,
    skip: toBoolean(env.GITHUB_PROJECTS_SKIP_AUTO_SYNC),
    autoSyncDisabled: env.GITHUB_PROJECTS_AUTO_SYNC?.toLowerCase() === 'false',
    allowedRepos,
    allowedReposNormalized
  };
}

function summarizeLanguages(languageMap, maxLanguages = 5) {
  const entries = Object.entries(languageMap ?? {}).filter(([, bytes]) =>
    Number.isFinite(bytes) && Number(bytes) > 0
  );

  if (entries.length === 0) {
    return { totalBytes: 0, languages: [] };
  }

  const sorted = entries
    .map(([name, value]) => ({ name, bytes: Number(value) }))
    .sort((a, b) => b.bytes - a.bytes);

  const totalBytes = sorted.reduce((total, entry) => total + entry.bytes, 0);
  const limit = Math.min(maxLanguages, sorted.length);
  const limited = sorted.slice(0, limit);

  return {
    totalBytes,
    languages: limited.map((entry) => ({
      name: entry.name,
      bytes: entry.bytes,
      percentage:
        totalBytes > 0
          ? Number(((entry.bytes / totalBytes) * 100).toFixed(1))
          : 0
    }))
  };
}

function applyProxy(proxyUrl) {
  if (!proxyUrl) {
    return;
  }

  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}

function createHeaders(token) {
  const headers = {
    'User-Agent': 'hackall360-project-fetcher',
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function githubRequest(endpoint, params, headers) {
  const url = new URL(endpoint, 'https://api.github.com');
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`GitHub request failed (${response.status} ${response.statusText}): ${message}`);
  }

  return response.json();
}

async function fetchAllRepos(config, headers, logger) {
  if (config.allowedRepos.length > 0) {
    const repos = [];

    const uniqueRepoNames = [...new Set(config.allowedRepos)];

    for (const repoName of uniqueRepoNames) {
      const repo = await githubRequest(`/repos/${config.owner}/${repoName}`, {}, headers);
      repos.push(repo);
    }

    logger?.info?.(
      `Fetched ${repos.length} explicitly selected repositories for ${config.owner}`
    );

    return repos;
  }

  let page = 1;
  const repos = [];

  while (true) {
    const pageData = await githubRequest(`/users/${config.owner}/repos`, {
      per_page: config.perPage,
      page,
      sort: 'updated',
      type: 'public'
    }, headers);

    if (!Array.isArray(pageData) || pageData.length === 0) {
      break;
    }

    repos.push(...pageData);

    if (pageData.length < config.perPage) {
      break;
    }

    page += 1;
  }

  logger?.info?.(`Fetched ${repos.length} repositories for ${config.owner}`);
  return repos;
}

async function fetchTopics(config, headers, repoName) {
  const data = await githubRequest(`/repos/${config.owner}/${repoName}/topics`, {}, headers);
  return Array.isArray(data.names) ? data.names : [];
}

async function fetchRepoLanguages(config, headers, repoName, logger) {
  try {
    const data = await githubRequest(`/repos/${config.owner}/${repoName}/languages`, {}, headers);
    return summarizeLanguages(data);
  } catch (error) {
    logger?.warn?.(`Failed to fetch languages for ${repoName}`, error);
    return { totalBytes: 0, languages: [] };
  }
}

async function fetchContributionCount(config, headers, repoName, logger) {
  let page = 1;
  let total = 0;

  while (true) {
    const endpoint = new URL(
      `/repos/${config.owner}/${repoName}/contributors`,
      'https://api.github.com'
    );
    endpoint.searchParams.set('per_page', '100');
    endpoint.searchParams.set('anon', 'true');
    endpoint.searchParams.set('page', String(page));

    const response = await fetch(endpoint, { headers });

    if (response.status === 204) {
      break;
    }

    if (!response.ok) {
      const message = await response.text();
      logger?.warn?.(
        `Unable to retrieve contributor stats for ${repoName} (${response.status} ${response.statusText}): ${message}`
      );
      return total;
    }

    const contributors = await response.json();
    if (!Array.isArray(contributors) || contributors.length === 0) {
      break;
    }

    total += contributors.reduce((sum, contributor) => {
      if (!contributor) {
        return sum;
      }

      const value = Number(contributor.contributions ?? contributor.total ?? 0);
      return Number.isFinite(value) ? sum + value : sum;
    }, 0);

    if (contributors.length < 100) {
      break;
    }

    page += 1;
  }

  return total;
}

function shouldIncludeRepo(config, repo, topics) {
  if (repo.archived || repo.disabled || repo.fork || repo.private) {
    return false;
  }

  if (
    config.allowedReposNormalized?.size > 0 &&
    !config.allowedReposNormalized.has(repo.name?.toLowerCase())
  ) {
    return false;
  }

  const starQualified = (repo.stargazers_count ?? 0) >= config.minStars;
  const normalizedTopics = topics.map((topic) => topic.toLowerCase());
  const topicQualified =
    config.includeTopics.length === 0 ||
    config.includeTopics.some((topic) => normalizedTopics.includes(topic));

  return starQualified && topicQualified;
}

function buildCaseStudyPath(config, topics, slug) {
  const normalizedTopics = topics.map((topic) => topic.toLowerCase());
  const prefixed = normalizedTopics.find((topic) => topic.startsWith(config.caseStudyPrefix));

  if (prefixed) {
    const suffix = prefixed.slice(config.caseStudyPrefix.length);
    return suffix ? `/projects/${suffix}` : `/projects/${slug}`;
  }

  if (normalizedTopics.includes(config.caseStudyTopic)) {
    return `/projects/${slug}`;
  }

  return null;
}

function toProject(config, repo, topics, languageSummary, contributionCount) {
  const normalizedTopics = topics.map((topic) => topic.toLowerCase());
  const filteredTags = topics.filter((topic) => {
    const lower = topic.toLowerCase();
    return (
      lower !== config.featureTopic &&
      lower !== config.caseStudyTopic &&
      !lower.startsWith(config.caseStudyPrefix)
    );
  });

  const languages = languageSummary?.languages ?? [];

  return {
    slug: repo.name,
    name: repo.name,
    description: repo.description ?? '',
    tags: filteredTags,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language,
    languages,
    totalLanguageBytes: languageSummary?.totalBytes ?? 0,
    contributions: Number.isFinite(contributionCount) ? contributionCount : 0,
    url: repo.html_url,
    caseStudy: buildCaseStudyPath(config, topics, repo.name),
    featured: normalizedTopics.includes(config.featureTopic)
  };
}

function sortProjects(projects) {
  return [...projects].sort((a, b) => {
    if ((b.contributions ?? 0) !== (a.contributions ?? 0)) {
      return (b.contributions ?? 0) - (a.contributions ?? 0);
    }

    if ((b.stars ?? 0) !== (a.stars ?? 0)) {
      return (b.stars ?? 0) - (a.stars ?? 0);
    }

    if ((b.forks ?? 0) !== (a.forks ?? 0)) {
      return (b.forks ?? 0) - (a.forks ?? 0);
    }

    return a.slug.localeCompare(b.slug);
  });
}

async function isCacheFresh(config, logger) {
  if (config.forceRefresh) {
    logger?.info?.('Cache refresh forced via GITHUB_PROJECTS_FORCE_REFRESH');
    return false;
  }

  if (!Number.isFinite(config.cacheMaxAgeHours) || config.cacheMaxAgeHours <= 0) {
    return false;
  }

  try {
    const stats = await stat(config.outputPath);
    const ageMs = Date.now() - stats.mtimeMs;
    const maxAgeMs = config.cacheMaxAgeHours * 60 * 60 * 1000;

    if (ageMs <= maxAgeMs) {
      const ageHours = ageMs / (60 * 60 * 1000);
      logger?.info?.(
        `Using cached projects data from ${stats.mtime.toISOString()} (age ${ageHours.toFixed(2)} hours; max ${config.cacheMaxAgeHours} hours).`
      );
      return true;
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      logger?.warn?.('Unable to read cached projects data.', error);
    }
  }

  return false;
}

export async function syncProjects(options = {}) {
  const {
    env = process.env,
    logger = defaultLogger,
    respectAutoSyncSetting = true
  } = options;

  const config = resolveConfig(env);

  if (config.skip) {
    logger?.info?.('Skipping GitHub project sync.');
    return { skipped: true, reason: 'disabled' };
  }

  if (respectAutoSyncSetting && config.autoSyncDisabled) {
    logger?.info?.('GitHub project auto-sync disabled via GITHUB_PROJECTS_AUTO_SYNC.');
    return { skipped: true, reason: 'auto-disabled' };
  }

  applyProxy(config.proxyUrl);
  const headers = createHeaders(config.token);

  if (await isCacheFresh(config, logger)) {
    return {
      skipped: true,
      reason: 'cache',
      path: config.outputPath
    };
  }

  const repos = await fetchAllRepos(config, headers, logger);
  const projects = [];

  for (const repo of repos) {
    const topics = await fetchTopics(config, headers, repo.name);
    if (!shouldIncludeRepo(config, repo, topics)) {
      continue;
    }
    const [languageSummary, contributionCount] = await Promise.all([
      fetchRepoLanguages(config, headers, repo.name, logger),
      fetchContributionCount(config, headers, repo.name, logger)
    ]);

    projects.push(
      toProject(config, repo, topics, languageSummary, contributionCount)
    );
  }

  const sorted = sortProjects(projects);
  await mkdir(dirname(config.outputPath), { recursive: true });
  await writeFile(config.outputPath, `${JSON.stringify(sorted, null, 2)}\n`);

  logger?.info?.(`Wrote ${sorted.length} projects to ${config.outputPath}`);
  return {
    skipped: false,
    projects: sorted,
    path: config.outputPath
  };
}

export function getProjectsConfig(env = process.env) {
  return resolveConfig(env);
}
