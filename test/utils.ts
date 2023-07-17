import { randomInt } from 'crypto';

export const idKeys = ['id', 'Id', 'ID', 'userId', 'userID'] as const;

export const randomId = (): number => randomInt(99999999);
