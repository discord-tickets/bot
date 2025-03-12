const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');
const ms = require('ms');

module.exports = class TagManageSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'tagmanage';
		super(client, {
			...options,
			description: 'Create, edit, or delete tags',
			dmPermission: false,
			name,
			options: [
				{
					name: 'create',
					description: 'Create a new tag',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'name',
							description: 'The name of the tag',
							type: ApplicationCommandOptionType.String,
							required: true
						},
						{
							name: 'content',
							description: 'The content of the tag',
							type: ApplicationCommandOptionType.String,
							required: true
						},
						{
							name: 'image',
							description: 'Image URL to include in the tag embed',
							type: ApplicationCommandOptionType.String,
							required: false
						}
					]
				},
				{
					name: 'edit',
					description: 'Edit an existing tag',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'tag',
							description: 'The tag to edit',
							type: ApplicationCommandOptionType.Integer,
							required: true,
							autocomplete: true
						},
						{
							name: 'content',
							description: 'The new content for the tag',
							type: ApplicationCommandOptionType.String,
							required: false
						},
						{
							name: 'image',
							description: 'Image URL to include in the tag embed',
							type: ApplicationCommandOptionType.String,
							required: false
						}
					]
				},
				{
					name: 'delete',
					description: 'Delete a tag',
					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'tag',
							description: 'The tag to delete',
							type: ApplicationCommandOptionType.Integer,
							required: true,
							autocomplete: true
						}
					]
				}
			]
		});
	}

	/**
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		try {
			// Check if the user has the required permissions
			if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
				return await interaction.reply({
					embeds: [
						new ExtendedEmbedBuilder()
							.setColor('Red')
							.setDescription('You do not have permission to manage tags!')
					],
					ephemeral: true
				});
			}

			const subcommand = interaction.options.getSubcommand();
			const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });

			if (subcommand === 'create') {
				await this.createTag(interaction, client, settings);
			} else if (subcommand === 'edit') {
				await this.editTag(interaction, client, settings);
			} else if (subcommand === 'delete') {
				await this.deleteTag(interaction, client, settings);
			}
		} catch (error) {
			client.log.error(`Error in tagmanage command: ${error}`);
			
			// Try to respond to the user about the error
			try {
				if (interaction.deferred) {
					await interaction.editReply({
						content: 'An error occurred while managing tags.',
						ephemeral: true
					});
				} else if (!interaction.replied) {
					await interaction.reply({
						content: 'An error occurred while managing tags.',
						ephemeral: true
					});
				}
			} catch (responseError) {
				client.log.error(`Failed to send error response: ${responseError}`);
			}
		}
	}

	async createTag(interaction, client, settings) {
		try {
			await interaction.deferReply({ ephemeral: true });

			const name = interaction.options.getString('name', true).toLowerCase();
			const content = interaction.options.getString('content', true);
			const imageUrl = interaction.options.getString('image');

			// Check if the tag already exists
			const existingTag = await client.prisma.tag.findFirst({
				where: {
					name,
					guildId: interaction.guild.id
				}
			});

			if (existingTag) {
				return await interaction.editReply({
					embeds: [
						new ExtendedEmbedBuilder()
							.setColor(settings.errorColour || 'Red')
							.setDescription(`A tag with the name \`${name}\` already exists!`)
					]
				});
			}

			// Create the tag
			const tag = await client.prisma.tag.create({
				data: {
					name,
					content,
					imageUrl,
					guild: {
						connect: {
							id: interaction.guild.id
						}
					}
				}
			});

			// Update the tag cache
			const cacheKey = `cache/guild-tags:${interaction.guild.id}`;
			let tags = await client.keyv.get(cacheKey);
			if (tags) {
				tags.push({
					id: tag.id,
					name: tag.name,
					content: tag.content,
					regex: tag.regex,
					imageUrl: tag.imageUrl
				});
				client.keyv.set(cacheKey, tags, ms('1h'));
			}

			// Preview the tag
			const embed = new ExtendedEmbedBuilder()
				.setColor(settings.successColour || 'Green')
				.setTitle('Tag Created')
				.setDescription(`The tag \`${name}\` has been created successfully!`);

			const tagEmbed = new ExtendedEmbedBuilder()
				.setColor(settings.primaryColour || '#0099ff')
				.setDescription(content);

			if (imageUrl) {
				tagEmbed.setImage(imageUrl);
			}

			await interaction.editReply({
				embeds: [embed, tagEmbed]
			});
		} catch (error) {
			client.log.error(`Error creating tag: ${error}`);
			if (interaction.deferred) {
				await interaction.editReply({
					content: 'An error occurred while creating the tag.',
					ephemeral: true
				});
			}
		}
	}

	async editTag(interaction, client, settings) {
		try {
			await interaction.deferReply({ ephemeral: true });

			const tagId = interaction.options.getInteger('tag', true);
			const content = interaction.options.getString('content');
			const imageUrl = interaction.options.getString('image');

			// Check if the tag exists
			const tag = await client.prisma.tag.findUnique({
				where: {
					id: tagId
				}
			});

			if (!tag) {
				return await interaction.editReply({
					embeds: [
						new ExtendedEmbedBuilder()
							.setColor(settings.errorColour || 'Red')
							.setDescription(`No tag found with the ID ${tagId}!`)
					]
				});
			}

			// Check if any changes were provided
			if (!content && imageUrl === undefined) {
				return await interaction.editReply({
					embeds: [
						new ExtendedEmbedBuilder()
							.setColor(settings.errorColour || 'Red')
							.setDescription('You must provide either content or an image to edit!')
					]
				});
			}

			// Prepare update data
			const updateData = {};
			if (content) updateData.content = content;
			if (imageUrl !== undefined) updateData.imageUrl = imageUrl; // This handles both setting and clearing the image

			// Update the tag
			const updatedTag = await client.prisma.tag.update({
				where: {
					id: tagId
				},
				data: updateData
			});

			// Update the tag cache
			const cacheKey = `cache/guild-tags:${interaction.guild.id}`;
			let tags = await client.keyv.get(cacheKey);
			if (tags) {
				const tagIndex = tags.findIndex(t => t.id === tagId);
				if (tagIndex !== -1) {
					tags[tagIndex] = {
						id: updatedTag.id,
						name: updatedTag.name,
						content: updatedTag.content,
						regex: updatedTag.regex,
						imageUrl: updatedTag.imageUrl
					};
					client.keyv.set(cacheKey, tags, ms('1h'));
				}
			}

			// Preview the updated tag
			const embed = new ExtendedEmbedBuilder()
				.setColor(settings.successColour || 'Green')
				.setTitle('Tag Updated')
				.setDescription(`The tag \`${updatedTag.name}\` has been updated successfully!`);

			const tagEmbed = new ExtendedEmbedBuilder()
				.setColor(settings.primaryColour || '#0099ff')
				.setDescription(updatedTag.content);

			if (updatedTag.imageUrl) {
				tagEmbed.setImage(updatedTag.imageUrl);
			}

			await interaction.editReply({
				embeds: [embed, tagEmbed]
			});
		} catch (error) {
			client.log.error(`Error editing tag: ${error}`);
			if (interaction.deferred) {
				await interaction.editReply({
					content: 'An error occurred while editing the tag.',
					ephemeral: true
				});
			}
		}
	}

	async deleteTag(interaction, client, settings) {
		try {
			await interaction.deferReply({ ephemeral: true });

			const tagId = interaction.options.getInteger('tag', true);

			// Check if the tag exists
			const tag = await client.prisma.tag.findUnique({
				where: {
					id: tagId
				}
			});

			if (!tag) {
				return await interaction.editReply({
					embeds: [
						new ExtendedEmbedBuilder()
							.setColor(settings.errorColour || 'Red')
							.setDescription(`No tag found with the ID ${tagId}!`)
					]
				});
			}

			// Delete the tag
			await client.prisma.tag.delete({
				where: {
					id: tagId
				}
			});

			// Update the tag cache
			const cacheKey = `cache/guild-tags:${interaction.guild.id}`;
			let tags = await client.keyv.get(cacheKey);
			if (tags) {
				tags = tags.filter(t => t.id !== tagId);
				client.keyv.set(cacheKey, tags, ms('1h'));
			}

			await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder()
						.setColor(settings.successColour || 'Green')
						.setDescription(`The tag \`${tag.name}\` has been deleted successfully!`)
				]
			});
		} catch (error) {
			client.log.error(`Error deleting tag: ${error}`);
			if (interaction.deferred) {
				await interaction.editReply({
					content: 'An error occurred while deleting the tag.',
					ephemeral: true
				});
			}
		}
	}
};