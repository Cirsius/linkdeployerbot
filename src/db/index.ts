import { Database } from 'bun:sqlite';
import * as path from 'path';

const ROOT_DIR = path.join(import.meta.dir, '../..');
const DB_PATH = path.join(ROOT_DIR, 'data.db');

const db = new Database(DB_PATH);

db.run('PRAGMA journal_mode = WAL');
db.run('PRAGMA synchronous = NORMAL');

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    last_request INTEGER NOT NULL DEFAULT 0
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS used_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    link TEXT NOT NULL,
    claimed_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    UNIQUE(user_id, link)
  )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_used_links_user ON used_links(user_id)`);

export interface UserRecord {
  user_id: string;
  last_request: number;
}

const stmts = {
  getUser: db.query<UserRecord, string>('SELECT * FROM users WHERE user_id = ?'),
  getUsedLinks: db.query<{ link: string }, string>('SELECT link FROM used_links WHERE user_id = ?'),
  upsertUser: db.query('INSERT INTO users (user_id, last_request) VALUES (?1, ?2) ON CONFLICT(user_id) DO UPDATE SET last_request = ?2'),
  insertLink: db.query('INSERT OR IGNORE INTO used_links (user_id, link, claimed_at) VALUES (?, ?, ?)'),
  deleteUser: db.query('DELETE FROM users WHERE user_id = ?'),
  deleteUserLinks: db.query('DELETE FROM used_links WHERE user_id = ?'),
};

const claimLinkTx = db.transaction((userId: string, link: string, now: number) => {
  stmts.upsertUser.run(userId, now);
  stmts.insertLink.run(userId, link, now);
});

export function getUser(userId: string): UserRecord | null {
  return stmts.getUser.get(userId);
}

export function getUsedLinks(userId: string): Set<string> {
  const rows = stmts.getUsedLinks.all(userId);
  return new Set(rows.map(r => r.link));
}

export function claimLink(userId: string, link: string): void {
  claimLinkTx(userId, link, Date.now());
}

export function getLastRequest(userId: string): number {
  const user = stmts.getUser.get(userId);
  return user?.last_request ?? 0;
}

export function resetUser(userId: string): boolean {
  const result = stmts.deleteUser.run(userId);
  stmts.deleteUserLinks.run(userId);
  return result.changes > 0;
}

export { db };
