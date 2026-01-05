import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function createEmbed() {
  const embed = new EmbedBuilder()
    .setColor('#4d416e')
    .setTitle('cirsi.us')
    .setDescription('click the button below to get a link. you can request a new link once a week.')
    .setFooter({ text: 'links are sent in dms' });

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('get_link')
        .setLabel('get link')
        .setStyle(ButtonStyle.Primary)
    );

  return { embeds: [embed], components: [row] };
}