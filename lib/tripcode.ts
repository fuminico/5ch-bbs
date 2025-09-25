import crypto from 'crypto';

const DEFAULT_SALT = 'bbs-secret-salt';
const DEFAULT_DISPLAY_NAME = 'Anonymous';

export type TripResult = {
  displayName: string;
  trip?: string;
};

export function parseTrip(input: string): TripResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { displayName: DEFAULT_DISPLAY_NAME };
  }

  const hashIndex = trimmed.indexOf('#');
  if (hashIndex === -1) {
    return { displayName: trimmed };
  }

  const baseName = trimmed.slice(0, hashIndex).trim() || DEFAULT_DISPLAY_NAME;
  const secret = trimmed.slice(hashIndex + 1);

  if (!secret) {
    return { displayName: baseName };
  }

  const salt = process.env.TRIP_SALT ?? DEFAULT_SALT;
  const digest = crypto
    .createHash('sha1')
    .update(`${secret}${salt}`)
    .digest('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 10);

  return {
    displayName: baseName,
    trip: digest,
  };
}
