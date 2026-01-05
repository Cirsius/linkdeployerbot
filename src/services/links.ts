import { config, userData, saveUserData } from '../config';

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export function canGetLink(userId: string): boolean {
  if (!userData[userId]) return true;

  const lastRequest = userData[userId].lastRequest;
  return Date.now() - lastRequest >= ONE_WEEK;
}

export function getNextLink(userId: string): string | null {
  if (!userData[userId]) {
    userData[userId] = { usedLinks: [], lastRequest: 0 };
  }

  const usedLinks = userData[userId].usedLinks || [];
  const availableLinks = config.links.filter(link => !usedLinks.includes(link));

  if (availableLinks.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableLinks.length);
  const link = availableLinks[randomIndex];
  userData[userId].usedLinks.push(link);
  userData[userId].lastRequest = Date.now();
  saveUserData(userData);

  return link;
}

export function getTimeRemaining(userId: string): string {
  const lastRequest = userData[userId].lastRequest;
  const timeLeft = ONE_WEEK - (Date.now() - lastRequest);

  const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
  const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  return `${days}d ${hours}h`;
}