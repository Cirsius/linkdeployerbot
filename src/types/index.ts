export interface BotConfig {
  token: string;
  ownerId: string;
  channelId: string;
  links: string[];
}

export interface UserEntry {
  usedLinks: string[];
  lastRequest: number;
}

export interface UserData {
  [userId: string]: UserEntry;
}