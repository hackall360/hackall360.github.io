#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import process from 'node:process';
import { fetch, ProxyAgent, setGlobalDispatcher } from 'undici';

const proxyUrl =
  process.env.GITHUB_PROXY ??
  process.env.HTTPS_PROXY ??
  process.env.https_proxy ??
  process.env.HTTP_PROXY ??
  process.env.http_proxy ??
  null;

if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}

const OWNER = process.env.GITHUB_OWNER ?? 'hackall360';
const PER_PAGE = Number.parseInt(process.env.GITHUB_PER_PAGE ?? '100', 10);
const MIN_STARS = Number.parseInt(process.env.GITHUB_MIN_STARS ?? '0', 10);
const INCLUDE_TOPICS = (process.env.GITHUB_INCLUDE_TOPICS ?? '')
  .split(',')
  .map((topic) => topic.trim().toLowerCase())
  .filter(Boolean);
const FEATURE_TOPIC = (process.env.GITHUB_FEATURE_TOPIC ?? 'featured').toLowerCase();
const CASE_STUDY_TOPIC = (process.env.GITHUB_CASE_STUDY_TOPIC ?? 'case-study').toLowerCase();
const CASE_STUDY_PREFIX = (process.env.GITHUB_CASE_STUDY_PREFIX ?? 'case-study:').toLowerCase();
const OUTPUT_PATH = resolve(process.cwd(), process.env.GITHUB_PROJECTS_OUTPUT ?? 'src/data/projects.json');
const API_BASE = 'https://api.github.com';
const token = process.env.GITHUB_TOKEN;

const headers = {
  'User-Agent': 'hackall360-project-fetcher',
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

if (token) {
  headers.Authorization = `Bearer ${token}`;
}

async function githubRequest(endpoint, params = {}) {
  const url = new URL(endpoint, API_BASE);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`GitHub request failed (${response.status} ${response.statusText}): ${message}`);
  }

  return response.json();
}

async function fetchAllRepos() {
  let page = 1;
  const repos = [];

  while (true) {
    const pageData = await githubRequest(`/users/${OWNER}/repos`, {
      per_page: PER_PAGE,
      page,
      sort: 'updated',
    });

    if (!Array.isArray(pageData) || pageData.length === 0) {
      break;
    }

    repos.push(...pageData);

    if (pageData.length < PER_PAGE) {
      break;
    }

    page += 1;
  }

  return repos;
}

async function fetchTopics(repoName) {
  const data = await githubRequest(`/repos/${OWNER}/${repoName}/topics`);
  return Array.isArray(data.names) ? data.names : [];
}

function shouldIncludeRepo(repo, topics) {
  if (repo.archived || repo.disabled || repo.fork) {
    return false;
  }

  const starQualified = repo.stargazers_count >= MIN_STARS;
  const normalizedTopics = topics.map((topic) => topic.toLowerCase());
  const topicQualified =
    INCLUDE_TOPICS.length === 0 || INCLUDE_TOPICS.some((topic) => normalizedTopics.includes(topic));

  return starQualified && topicQualified;
}

function buildCaseStudyPath(topics, slug) {
  const normalizedTopics = topics.map((topic) => topic.toLowerCase());
  const prefixed = normalizedTopics.find((topic) => topic.startsWith(CASE_STUDY_PREFIX));

  if (prefixed) {
    const suffix = prefixed.slice(CASE_STUDY_PREFIX.length);
    return suffix ? `/projects/${suffix}` : `/projects/${slug}`;
  }

  if (normalizedTopics.includes(CASE_STUDY_TOPIC)) {
    return `/projects/${slug}`;
  }

  return null;
}

function toProject(repo, topics) {
  const normalizedTopics = topics.map((topic) => topic.toLowerCase());
  const filteredTags = topics.filter((topic) => {
    const lower = topic.toLowerCase();
    return lower !== FEATURE_TOPIC && lower !== CASE_STUDY_TOPIC && !lower.startsWith(CASE_STUDY_PREFIX);
  });

  return {
    slug: repo.name,
    name: repo.name,
    description: repo.description ?? '',
    tags: filteredTags,
    stars: repo.stargazers_count,
    language: repo.language,
    url: repo.html_url,
    caseStudy: buildCaseStudyPath(topics, repo.name),
    featured: normalizedTopics.includes(FEATURE_TOPIC),
  };
}

function sortProjects(projects) {
  return [...projects].sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }

    if (b.stars !== a.stars) {
      return b.stars - a.stars;
    }

    return a.slug.localeCompare(b.slug);
  });
}

async function main() {
  try {
    const repos = await fetchAllRepos();
    const projects = [];

    for (const repo of repos) {
      const topics = await fetchTopics(repo.name);
      if (!shouldIncludeRepo(repo, topics)) {
        continue;
      }
      projects.push(toProject(repo, topics));
    }

    const sorted = sortProjects(projects);
    await mkdir(dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, `${JSON.stringify(sorted, null, 2)}\n`);

    console.log(`Wrote ${sorted.length} projects to ${OUTPUT_PATH}`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}

main();
