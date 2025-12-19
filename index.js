const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'bot-config.json');
const DATA_FILE = path.join(__dirname, 'user-data.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  const defaultConfig = {
    token: 'bot token',
    ownerId: 'ur user id',
    channelId: 'channel id',
    links: [
      'https://degloved.net'
    ]
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
  return defaultConfig;
}

function loadUserData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return {};
}

function saveUserData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let config = loadConfig();
let userData = loadUserData();

function createEmbed() {
  const embed = new EmbedBuilder()
    .setColor('#4d416e')
    .setTitle('cirsi.us')
    .setDescription('click the button below to get a link. you can request a new link once a week.')
    .setFooter({ text: 'links are sent in dms' });

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('get_link')
        .setLabel('get link')
        .setStyle(ButtonStyle.Primary)
    );

  return { embeds: [embed], components: [row] };
}

function canGetLink(userId) {
  if (!userData[userId]) return true;

  const lastRequest = userData[userId].lastRequest;
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - lastRequest >= oneWeek;
}

function getNextLink(userId) {
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

function getTimeRemaining(userId) {
  const lastRequest = userData[userId].lastRequest;
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const timeLeft = oneWeek - (Date.now() - lastRequest);

  const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
  const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  return `${days}d ${hours}h`;
}

client.once('clientReady', async () => {
  console.log(`logged in as ${client.user.tag}`);

  const channel = client.channels.cache.get(config.channelId);
  if (channel) {
    const messages = await channel.messages.fetch({ limit: 10 });
    const botMessage = messages.find(msg => msg.author.id === client.user.id);

    if (botMessage) {
      await botMessage.edit(createEmbed());
    } else {
      await channel.send(createEmbed());
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'get_link') {
    const userId = interaction.user.id;

    if (!canGetLink(userId)) {
      const timeLeft = getTimeRemaining(userId);
      await interaction.reply({
        content: `you can request another link in ${timeLeft}`,
        ephemeral: true
      });
      return;
    }

    const link = getNextLink(userId);

    if (!link) {
      await interaction.reply({
        content: 'you alr got every link possible',
        ephemeral: true
      });
      return;
    }

    try {
      await interaction.user.send(`${link}`);
      await interaction.reply({
        content: 'check ur dms for the link',
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({
        content: 'make sure ur dms are open. couldnt dm',
        ephemeral: true
      });
    }
  }
});

client.on('messageCreate', async message => {
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
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    await message.reply(`added link: ${link}`);
  }

  if (command === '!removelink') {
    const index = parseInt(args[1]) - 1;
    if (isNaN(index) || index < 0 || index >= config.links.length) {
      await message.reply('invalid link number');
      return;
    }
    const removed = config.links.splice(index, 1);
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
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
    delete userData[userId];
    saveUserData(userData);
    await message.reply(`reset user data for ${userId}`);
  }

  if (command === '!setchannel') {
    config.channelId = message.channel.id;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));

    const channel = client.channels.cache.get(config.channelId);
    await channel.send(createEmbed());
    await message.reply('channel set and embed posted');
  }
});

client.login(config.token);