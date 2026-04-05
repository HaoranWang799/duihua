import type { StoryArchiveSnapshot } from '../types/story';

const ARCHIVE_API_URL = '/api/archive';

type ArchiveResponse = {
  durable?: boolean;
  snapshot?: StoryArchiveSnapshot | null;
};

export const fetchArchiveSnapshot = async () => {
  const response = await fetch(ARCHIVE_API_URL, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`读取远端档案失败（${response.status}）`);
  }

  return (await response.json()) as ArchiveResponse;
};

export const persistArchiveSnapshot = async (snapshot: StoryArchiveSnapshot) => {
  const response = await fetch(ARCHIVE_API_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ snapshot }),
  });

  if (!response.ok) {
    throw new Error(`保存远端档案失败（${response.status}）`);
  }

  return (await response.json()) as { durable?: boolean; ok?: boolean };
};
