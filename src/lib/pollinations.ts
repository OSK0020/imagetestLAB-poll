const DEFAULT_APP_KEY = 'pk_CBViurgPPhpt77kS';

export function isPollinationsKey(value: unknown): value is string {
  return typeof value === 'string' && /^(?:pk|sk)_\S+$/.test(value);
}

export function resolvePollinationsKey(userKey: unknown): string {
  if (userKey !== null && userKey !== undefined && userKey !== '') {
    if (!isPollinationsKey(userKey)) {
      throw new Error('Pollinations keys must start with pk_ or sk_.');
    }
    return userKey;
  }

  const appKey = process.env.POLLINATIONS_APP_KEY || DEFAULT_APP_KEY;
  if (!isPollinationsKey(appKey) || !appKey.startsWith('pk_')) {
    throw new Error('POLLINATIONS_APP_KEY must be a publishable pk_ key.');
  }
  return appKey;
}

export function pollinationsHeaders(key: string): HeadersInit {
  return { Authorization: `Bearer ${key}` };
}
