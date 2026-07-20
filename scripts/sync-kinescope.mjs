import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mapPath = path.join(rootDir, 'lectures', 'kinescope-map.json');
const catalogPath = path.join(rootDir, 'lectures', 'catalog.json');

function normalized(value) {
  return value.trim().toLocaleLowerCase('ru-RU').replaceAll('ё', 'е');
}

function stableId(prefix, value) {
  return `${prefix}-${value}`;
}

function findByName(items, name) {
  const target = normalized(name);
  return items.find((item) => normalized(item.name) === target);
}

function findAspectRatio(video, fallback) {
  const source = Array.isArray(video.assets)
    ? video.assets.find((asset) => Number(asset?.width) > 0 && Number(asset?.height) > 0)
    : undefined;
  return source ? Number(source.width) / Number(source.height) : fallback;
}

function entryFromVideo(video, defaultAspectRatio) {
  return {
    id: stableId('ks', video.id),
    kind: 'video',
    title: video.title,
    embedUrl: video.embed_link || `https://kinescope.io/embed/${video.id}`,
    aspectRatio: findAspectRatio(video, defaultAspectRatio),
  };
}

export function buildCatalog({ config, folders, videos }) {
  const rootFolders = folders.filter(
    (folder) => folder.parent_id === null || folder.parent_id === undefined || folder.parent_id === config.projectId,
  );
  const readyVideos = videos.filter((video) => video.status === 'done' && video.folder_id);
  const courses = [];

  for (const configuredCourse of config.courses) {
    const courseFolder = findByName(rootFolders, configuredCourse.folder);
    if (!courseFolder) continue;

    const configuredSections = configuredCourse.sections ?? [];
    const sectionFolders = folders.filter((folder) => folder.parent_id === courseFolder.id);
    const sections = [];

    for (const sectionFolder of sectionFolders) {
      const sectionConfig = configuredSections.find(
        (candidate) => normalized(candidate.folder) === normalized(sectionFolder.name),
      );
      const sectionVideos = readyVideos
        .filter((video) => video.folder_id === sectionFolder.id)
        .sort((left, right) => left.created_at.localeCompare(right.created_at));

      if (sectionVideos.length === 0) continue;
      sections.push({
        id: sectionConfig?.id ?? stableId('ks-section', sectionFolder.id),
        title: sectionConfig?.title ?? sectionFolder.name,
        entries: sectionVideos.map((video) => entryFromVideo(video, config.defaultAspectRatio)),
      });
    }

    const rootVideos = readyVideos
      .filter((video) => video.folder_id === courseFolder.id)
      .sort((left, right) => left.created_at.localeCompare(right.created_at));
    if (rootVideos.length > 0) {
      sections.unshift({
        id: stableId('ks-section', courseFolder.id),
        title: 'Записи',
        entries: rootVideos.map((video) => entryFromVideo(video, config.defaultAspectRatio)),
      });
    }

    if (sections.length === 0) continue;
    courses.push({
      id: configuredCourse.id,
      title: configuredCourse.title,
      description: configuredCourse.description ?? '',
      sections,
    });
  }

  return { version: 1, courses };
}

async function fetchAll(endpoint, token) {
  const result = [];
  let page = 1;

  while (true) {
    const url = new URL(endpoint);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', '100');
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Kinescope API returned ${response.status} for ${url.pathname}`);
    }

    const payload = await response.json();
    if (!Array.isArray(payload.data)) throw new Error(`Unexpected Kinescope response for ${url.pathname}`);
    result.push(...payload.data);

    const total = Number(payload.meta?.pagination?.total ?? result.length);
    if (result.length >= total || payload.data.length === 0) return result;
    page += 1;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function main() {
  const token = process.env.KINESCOPE_API_TOKEN;
  const projectId = process.env.KINESCOPE_PROJECT_ID;
  if (!token || !projectId) {
    throw new Error('KINESCOPE_API_TOKEN and KINESCOPE_PROJECT_ID are required');
  }

  const config = { ...(await readJson(mapPath)), projectId };
  const [folders, videos] = await Promise.all([
    fetchAll(`https://api.kinescope.io/v1/projects/${projectId}/folders`, token),
    fetchAll(`https://api.kinescope.io/v1/videos?project_id=${encodeURIComponent(projectId)}`, token),
  ]);
  const nextCatalog = buildCatalog({ config, folders, videos });

  let currentCatalog = null;
  try {
    currentCatalog = await readJson(catalogPath);
  } catch {
    // The first synchronization creates the catalog.
  }

  if (JSON.stringify(currentCatalog?.courses) === JSON.stringify(nextCatalog.courses)) {
    console.log(`Catalog is already current: ${nextCatalog.courses.length} courses`);
    return;
  }

  nextCatalog.updatedAt = new Date().toISOString();
  await writeFile(catalogPath, `${JSON.stringify(nextCatalog, null, 2)}\n`, 'utf8');
  console.log(`Catalog updated: ${nextCatalog.courses.length} courses`);
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
  await main();
}
