import { config } from '../config';
import { getUsedLinks, getLastRequest, claimLink } from '../db';

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export function canGetLink(userId: string): boolean {
  const lastRequest = getLastRequest(userId);
  if (lastRequest === 0) return true;
  return Date.now() - lastRequest >= ONE_WEEK;
}

export function getNextLink(userId: string): string | null {
  const usedLinks = getUsedLinks(userId);
  const availableLinks = config.links.filter(link => !usedLinks.has(link));

  if (availableLinks.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availableLinks.length);
  const link = availableLinks[randomIndex];
  claimLink(userId, link);

  return link;
}

export function getTimeRemaining(userId: string): string {
  const lastRequest = getLastRequest(userId);
  const timeLeft = ONE_WEEK - (Date.now() - lastRequest);

  const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
  const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  return `${days}d ${hours}h`;
}