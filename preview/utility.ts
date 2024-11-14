import { parseURLData } from 'web-utility';

export const { renderMode } = parseURLData() as { renderMode: 'sync' };
