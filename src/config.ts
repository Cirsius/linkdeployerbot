import * as fs from 'fs';
import * as path from 'path';
import type { BotConfig, UserData } from './types';

const ROOT_DIR = path.join(import.meta.dir, '..');
export const CONFIG_FILE = path.join(ROOT_DIR, 'bot-config.json');
export const DATA_FILE = path.join(ROOT_DIR, 'user-data.json');

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

export function loadUserData(): UserData {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return {};
}

export function saveUserData(data: UserData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function saveConfig(config: BotConfig): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export let config = loadConfig();
export let userData = loadUserData();