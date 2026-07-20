import assert from 'node:assert/strict';

import { buildCatalog } from './sync-kinescope.mjs';

const config = {
  projectId: 'project-1',
  defaultAspectRatio: 16 / 9,
  courses: [
    {
      folder: 'Лекторий 3.0',
      id: 'lectorium-3',
      title: 'Лекторий 3.0',
      description: 'Описание',
      sections: [{ folder: 'Июль', id: 'july', title: 'Июль' }],
    },
  ],
};
const folders = [
  { id: 'course-folder', name: 'Лекторий 3.0', parent_id: 'project-1' },
  { id: 'section-folder', name: 'Июль', parent_id: 'course-folder' },
];
const videos = [
  {
    id: 'video-1',
    folder_id: 'section-folder',
    status: 'done',
    title: 'Новая лекция',
    embed_link: 'https://kinescope.io/embed/video-1',
    created_at: '2026-07-20T10:00:00.000Z',
    assets: [{ width: 1920, height: 1080 }],
  },
  {
    id: 'video-uploading',
    folder_id: 'section-folder',
    status: 'uploading',
    title: 'Ещё загружается',
    created_at: '2026-07-20T11:00:00.000Z',
  },
];

const catalog = buildCatalog({ config, folders, videos });
assert.equal(catalog.courses.length, 1);
assert.equal(catalog.courses[0].sections[0].id, 'july');
assert.equal(catalog.courses[0].sections[0].entries.length, 1);
assert.equal(catalog.courses[0].sections[0].entries[0].title, 'Новая лекция');
assert.equal(catalog.courses[0].sections[0].entries[0].aspectRatio, 16 / 9);
console.log('Kinescope catalog sync test passed');
