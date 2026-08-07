import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

declare global {
  // eslint-disable-next-line no-var
  var __invoicify_redis__: Redis | undefined;
}

const createRedis = () =>
  new Redis(redisUrl as string, {
    maxRetriesPerRequest: 3,
    enableAutoPipelining: true,
    retryStrategy(times: number) {
      if (times > 3) return null;
      return Math.min(times * 100, 3000);
    },
  });

export function getRedis(): Redis {
  if (!redisUrl) {
    throw new Error("Missing REDIS_URL environment variable.");
  }

  if (!global.__invoicify_redis__) {
    global.__invoicify_redis__ = createRedis();
  }

  return global.__invoicify_redis__ as Redis;
}

export async function getPdfCache(invoiceId: string): Promise<Buffer | null> {
  const redis = getRedis();
  const key = `invoice-pdf:${invoiceId}`;
  const cachedBase64 = await redis.get(key);
  if (!cachedBase64) return null;
  return Buffer.from(cachedBase64, "base64");
}

export async function setPdfCache(
  invoiceId: string,
  pdfBuffer: Buffer
): Promise<void> {
  const redis = getRedis();
  const key = `invoice-pdf:${invoiceId}`;
  await redis.set(key, pdfBuffer.toString("base64"), "EX", 120);
}
