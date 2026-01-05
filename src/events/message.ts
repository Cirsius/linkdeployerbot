import type { Client, Message, TextChannel } from 'discord.js';
import { config, saveConfig } from '../config';
import { resetUser } from '../db';
import { createEmbed } from '../utils/embed';

export async function onMessageCreate(message: Message, client: Client): Promise<void> {
  if (message.author.bot) return;
  if (message.author.id !== config.ownerId) return;

  const args = message.content.split(' ');
  const command = args[0].toLowerCase();

  if (command === '!addlink') {
    const link = args[1];
    if (!link) {
      await message.reply('usage: !addlink <url>');
      return;
    }
    config.links.push(link);
    saveConfig(config);
    await message.reply(`added link: ${link}`);
  }

  if (command === '!removelink') {
    const index = parseInt(args[1]) - 1;
    if (isNaN(index) || index < 0 || index >= config.links.length) {
      await message.reply('invalid link number');
      return;
    }
    const removed = config.links.splice(index, 1);
    saveConfig(config);
    await message.reply(`removed link: ${removed[0]}`);
  }

  if (command === '!listlinks') {
    if (config.links.length === 0) {
      await message.reply('no links configured');
      return;
    }
    const linkList = config.links.map((link, i) => `${i + 1}. ${link}`).join('\n');
    await message.reply(`current links:\n${linkList}`);
  }

  if (command === '!resetuser') {
    const userId = args[1];
    if (!userId) {
      await message.reply('usage: !resetuser <user_id>');
      return;
    }
    const deleted = resetUser(userId);
    if (deleted) {
      await message.reply(`reset user data for ${userId}`);
    } else {
      await message.reply(`no data found for ${userId}`);
    }
  }

  if (command === '!setchannel') {
    config.channelId = message.channel.id;
    saveConfig(config);

    const channel = client.channels.cache.get(config.channelId) as TextChannel | undefined;
    if (channel) {
      await channel.send(createEmbed());
    }
    await message.reply('channel set and embed posted');
  }
}