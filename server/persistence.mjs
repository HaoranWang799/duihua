import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { Pool } from 'pg'

let archivePool = null
let archivePoolUrl = ''
let archiveSetupPromise = null
let bucketClient = null
let bucketClientSignature = ''

const ARCHIVE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS story_archives (
    client_id TEXT PRIMARY KEY,
    snapshot JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`

const getArchivePool = (databaseUrl) => {
  if (!databaseUrl) {
    return null
  }

  if (!archivePool || archivePoolUrl !== databaseUrl) {
    archivePoolUrl = databaseUrl
    archiveSetupPromise = null
    archivePool = new Pool({
      connectionString: databaseUrl,
    })
  }

  return archivePool
}

const ensureArchiveTable = async (databaseUrl) => {
  const pool = getArchivePool(databaseUrl)

  if (!pool) {
    return null
  }

  if (!archiveSetupPromise) {
    archiveSetupPromise = pool.query(ARCHIVE_TABLE_SQL)
  }

  await archiveSetupPromise
  return pool
}

const getBucketClient = (bucketConfig) => {
  const {
    accessKeyId,
    bucket,
    endpoint,
    region,
    secretAccessKey,
  } = bucketConfig

  if (!accessKeyId || !bucket || !endpoint || !region || !secretAccessKey) {
    return null
  }

  const nextSignature = JSON.stringify({
    accessKeyId,
    bucket,
    endpoint,
    region,
    secretAccessKey,
  })

  if (!bucketClient || bucketClientSignature !== nextSignature) {
    bucketClientSignature = nextSignature
    bucketClient = new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      endpoint,
      region,
    })
  }

  return bucketClient
}

export const readArchiveSnapshotFromDatabase = async ({
  clientId,
  databaseUrl,
}) => {
  const pool = await ensureArchiveTable(databaseUrl)

  if (!pool) {
    return null
  }

  const result = await pool.query(
    'SELECT snapshot FROM story_archives WHERE client_id = $1 LIMIT 1',
    [clientId],
  )

  return result.rows[0]?.snapshot ?? null
}

export const writeArchiveSnapshotToDatabase = async ({
  clientId,
  databaseUrl,
  snapshot,
}) => {
  const pool = await ensureArchiveTable(databaseUrl)

  if (!pool) {
    return false
  }

  await pool.query(
    `
      INSERT INTO story_archives (client_id, snapshot, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (client_id)
      DO UPDATE SET
        snapshot = EXCLUDED.snapshot,
        updated_at = NOW()
    `,
    [clientId, JSON.stringify(snapshot)],
  )

  return true
}

export const readBucketObject = async ({
  bucketConfig,
  key,
}) => {
  const client = getBucketClient(bucketConfig)

  if (!client) {
    return null
  }

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucketConfig.bucket,
        Key: key,
      }),
    )

    const body = response.Body

    if (!body) {
      return null
    }

    const bytes = await body.transformToByteArray()
    return {
      body: Buffer.from(bytes),
      contentType: response.ContentType ?? undefined,
    }
  } catch (error) {
    const code = error && typeof error === 'object' ? error.name : ''

    if (code === 'NoSuchKey' || code === 'NotFound') {
      return null
    }

    throw error
  }
}

export const writeBucketObject = async ({
  body,
  bucketConfig,
  contentType,
  key,
}) => {
  const client = getBucketClient(bucketConfig)

  if (!client) {
    return false
  }

  await client.send(
    new PutObjectCommand({
      Body: body,
      Bucket: bucketConfig.bucket,
      ContentType: contentType || 'application/octet-stream',
      Key: key,
    }),
  )

  return true
}
