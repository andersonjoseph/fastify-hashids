import { randomInt } from 'crypto';

export const idKeys = ['id', 'Id', 'ID', 'userId', 'userID'] as const;
export const idsKeys = [
  'ids',
  'Ids',
  'IDs',
  'IDS',
  'userIds',
  'userIDs',
  'userIDS',
] as const;

export const randomId = (): number => randomInt(99999999);
export const randomIds = (): number[] => [randomId(), randomId(), randomId()];
