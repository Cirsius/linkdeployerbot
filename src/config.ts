import * as fs from 'fs';
import * as path from 'path';
import type { BotConfig } from './types';

const ROOT_DIR = path.join(import.meta.dir, '..');
export const CONFIG_FILE = path.join(ROOT_DIR, 'bot-config.json');

export function loadConfig(): BotConfig {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  const defaultConfig: BotConfig = {
    token: 'bot token',
    ownerId: 'ur user id',
    channelId: 'channel id',
    links: ['https://degloved.net']
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
  return defaultConfig;
}

export function saveConfig(config: BotConfig): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export let config = loadConfig();