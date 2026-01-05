import type { ButtonInteraction } from 'discord.js';
import { canGetLink, getNextLink, getTimeRemaining } from '../services/links';

export async function onButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  if (interaction.customId !== 'get_link') return;

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