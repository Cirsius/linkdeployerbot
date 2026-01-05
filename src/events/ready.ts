import type { Client, TextChannel } from 'discord.js';
import { config } from '../config';
import { createEmbed } from '../utils/embed';

export async function onReady(client: Client): Promise<void> {
  console.log(`logged in as ${client.user?.tag}`);

  const channel = client.channels.cache.get(config.channelId) as TextChannel | undefined;
  if (channel) {
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessage = messages.find(msg => msg.author.id === client.user?.id);

    if (botMessage) {
      await botMessage.edit(createEmbed());
    } else {
      await channel.send(createEmbed());
    }
  }
}