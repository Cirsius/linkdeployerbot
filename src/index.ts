import { Client, GatewayIntentBits } from 'discord.js';
import { config } from './config';
import { onReady, onButtonInteraction, onMessageCreate } from './events';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.once('clientReady', () => onReady(client));

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    await onButtonInteraction(interaction);
  }
});

client.on('messageCreate', message => onMessageCreate(message, client));

client.login(config.token);