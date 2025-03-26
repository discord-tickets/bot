const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType } = require('discord.js');
const ExtendedEmbedBuilder = require('../../lib/embed');
const { isStaff } = require('../../lib/users');
const { logTicketEvent } = require('../../lib/logging');

module.exports = class StatsSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'stats';
		super(client, {
			...options,
			description: 'View ticket statistics',
			dmPermission: false,
			name,
			options: [
				{
					name: 'timerange',
					description: 'Select a time period for statistics',
					required: false,
					type: ApplicationCommandOptionType.String,
					choices: [
						{ name: '24 Hours', value: '24h' },
						{ name: '7 Days', value: '7d' },
						{ name: '30 Days', value: '30d' },
						{ name: '90 Days', value: '90d' },
					],
				},
			],
		});
	}

	/**
	 * Calculate start date based on time range
	 * @param {string} timeRange - Selected time range
	 * @param {Date} endDate - End date for calculation
	 * @returns {Date} Start date
	 */
	calculateStartDate(timeRange, endDate) {
		const timeMultipliers = {
			'24h': 24,
			'7d': 7 * 24,
			'30d': 30 * 24,
			'90d': 90 * 24
		};

		const hours = timeMultipliers[timeRange] || timeMultipliers['7d'];
		return new Date(endDate.getTime() - hours * 60 * 60 * 1000);
	}

	/**
	 * Get display text for time range
	 * @param {string} timeRange - Selected time range
	 * @returns {string} Display text
	 */
	getTimeRangeDisplay(timeRange) {
		const displays = {
			'24h': 'Last 24 Hours',
			'7d': 'Last 7 Days', 
			'30d': 'Last 30 Days',
			'90d': 'Last 90 Days'
		};
		return displays[timeRange] || displays['7d'];
	}

	/**
	 * Calculate most popular category
	 * @param {Array} tickets - List of tickets
	 * @returns {Object} Most popular category
	 */
	calculateMostPopularCategory(tickets) {
		const categoryCount = tickets.reduce((counts, ticket) => {
			if (ticket.category) {
				const categoryName = ticket.category.name;
				counts[categoryName] = (counts[categoryName] || 0) + 1;
			}
			return counts;
		}, {});

		return Object.entries(categoryCount).reduce(
			(mostPopular, [name, count]) => 
				count > mostPopular.count ? { name, count } : mostPopular, 
			{ name: 'None', count: 0 }
		);
	}

	/**
	 * Calculate average response time
	 * @param {Array} tickets - List of tickets
	 * @returns {number} Average response time in minutes
	 */
	calculateAverageResponseTime(tickets) {
		const responseTimeData = tickets.reduce((acc, ticket) => {
			if (ticket.firstResponseAt && ticket.createdAt) {
				const responseTime = ticket.firstResponseAt.getTime() - ticket.createdAt.getTime();
				acc.totalResponseTime += responseTime;
				acc.ticketsWithResponse++;
			}
			return acc;
		}, { totalResponseTime: 0, ticketsWithResponse: 0 });

		return responseTimeData.ticketsWithResponse > 0
			? (responseTimeData.totalResponseTime / responseTimeData.ticketsWithResponse) / (1000 * 60)
			: 0;
	}

	/**
	 * Calculate staff performance
	 * @param {Array} tickets - List of tickets
	 * @param {Array} staffFeedback - Staff-specific feedback
	 * @returns {Array} Sorted staff performance statistics
	 */
	calculateStaffPerformance(tickets, staffFeedback) {
		const staffPerformance = {};

		// Collect ticket handling stats
		tickets.forEach(ticket => {
			if (!ticket.claimedById) return;

			const staffId = ticket.claimedById;
			if (!staffPerformance[staffId]) {
				staffPerformance[staffId] = {
					id: staffId,
					name: ticket.claimedBy?.id ? `<@${ticket.claimedBy.id}>` : `ID: ${staffId}`,
					ticketsHandled: 0,
					closedTickets: 0,
					totalResponseTime: 0,
					ticketsWithResponse: 0,
					staffFeedbackRatings: []
				};
			}

			const staff = staffPerformance[staffId];
			staff.ticketsHandled++;
			
			if (!ticket.open) {
				staff.closedTickets++;
			}
			
			if (ticket.firstResponseAt && ticket.createdAt) {
				staff.totalResponseTime += 
					ticket.firstResponseAt.getTime() - ticket.createdAt.getTime();
				staff.ticketsWithResponse++;
			}
		});

		// Add staff-specific feedback ratings
		staffFeedback.forEach(feedback => {
			if (feedback.staffId && staffPerformance[feedback.staffId]) {
				staffPerformance[feedback.staffId].staffFeedbackRatings.push(feedback.rating);
			}
		});

		// Process and sort staff performance
		return Object.values(staffPerformance)
			.map(staff => ({
				...staff,
				avgResponseTime: staff.ticketsWithResponse > 0 
					? (staff.totalResponseTime / staff.ticketsWithResponse) / (1000 * 60)
					: 0,
				avgStaffRating: staff.staffFeedbackRatings.length > 0
					? staff.staffFeedbackRatings.reduce((a, b) => a + b, 0) / staff.staffFeedbackRatings.length
					: 0,
				staffFeedbackCount: staff.staffFeedbackRatings.length
			}))
			.sort((a, b) => b.ticketsHandled - a.ticketsHandled);
	}

	/**
	 * Generate star rating display
	 * @param {number} rating - Rating value
	 * @returns {string} Star rating display
	 */
	generateStarRating(rating) {
		const fullStars = Math.floor(rating);
		const halfStar = rating - fullStars >= 0.5;
		const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
		
		return '★'.repeat(fullStars) + (halfStar ? '⭐' : '') + '☆'.repeat(emptyStars);
	}

	/**
	 * Main command execution
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction 
	 */
	async run(interaction) {
		try {
			/** @type {import("client")} */
			const client = this.client;

			await interaction.deferReply();

			// Get guild settings
			const settings = await client.prisma.guild.findUnique({ 
				where: { id: interaction.guild.id } 
			});

			// Check if user is staff
			if (!(await isStaff(interaction.guild, interaction.member.id))) {
				return await interaction.editReply({
					embeds: [
						new ExtendedEmbedBuilder({
							iconURL: interaction.guild.iconURL(),
							text: settings.footer,
						})
							.setColor(settings.errorColour)
							.setTitle('❌ Error')
							.setDescription('Only staff members can view ticket statistics.'),
					],
				});
			}

			// Get time range
			const timeRange = interaction.options.getString('timerange') || '7d';
			const endDate = new Date();
			const startDate = this.calculateStartDate(timeRange, endDate);
			const timeRangeDisplay = this.getTimeRangeDisplay(timeRange);

			// Fetch tickets
			const tickets = await client.prisma.ticket.findMany({
				where: {
					guildId: interaction.guild.id,
					createdAt: {
						gte: startDate,
						lte: endDate,
					},
				},
				include: {
					category: true,
					claimedBy: true,
					feedback: true,
				},
			});

			// No tickets found
			if (tickets.length === 0) {
				return await interaction.editReply({
					embeds: [
						new ExtendedEmbedBuilder({
							iconURL: interaction.guild.iconURL(),
							text: settings.footer,
						})
							.setColor(settings.primaryColour)
							.setTitle('ℹ️ No Data')
							.setDescription('No tickets found in the selected time period.'),
					],
				});
			}

			// Fetch staff-specific feedback
			const staffFeedback = await client.prisma.feedback.findMany({
				where: {
					guildId: interaction.guild.id,
					createdAt: {
						gte: startDate,
						lte: endDate,
					},
					staffId: { not: null }
				}
			});

			// Calculate statistics
			const mostPopularCategory = this.calculateMostPopularCategory(tickets);
			const avgResponseTime = this.calculateAverageResponseTime(tickets);
			const daysDifference = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
			const avgDailyTickets = tickets.length / daysDifference;

			// Calculate overall feedback
			const feedbackStats = tickets.reduce((acc, ticket) => {
				if (ticket.feedback && ticket.feedback.rating) {
					acc.totalRating += ticket.feedback.rating;
					acc.ticketsWithFeedback++;
				}
				return acc;
			}, { totalRating: 0, ticketsWithFeedback: 0 });

			const avgFeedbackRating = feedbackStats.ticketsWithFeedback > 0
				? feedbackStats.totalRating / feedbackStats.ticketsWithFeedback
				: 0;
			const starRating = this.generateStarRating(avgFeedbackRating);

			// Calculate staff performance
			const staffStats = this.calculateStaffPerformance(tickets, staffFeedback);

			// Create embed
			const statsEmbed = new ExtendedEmbedBuilder({
				iconURL: interaction.guild.iconURL(),
				text: settings.footer,
			})
				.setColor(settings.primaryColour)
				.setTitle('📊 Ticket Statistics')
				.setDescription(`Statistics for ${timeRangeDisplay}`);

			// Add ticket count fields
			statsEmbed.addFields([
				{
					name: '📊 Total Tickets',
					value: `${tickets.length} tickets`,
					inline: true,
				},
				{
					name: '🟢 Open Tickets',
					value: `${tickets.filter(t => t.open).length} tickets`,
					inline: true,
				},
				{
					name: '🔴 Closed Tickets',
					value: `${tickets.filter(t => !t.open).length} tickets`,
					inline: true,
				},
			]);

			// Add advanced metrics
			statsEmbed.addFields([
				{
					name: '🏆 Most Popular Category',
					value: mostPopularCategory.count > 0 
						? `${mostPopularCategory.name}: ${mostPopularCategory.count} tickets` 
						: 'No categorized tickets',
					inline: true,
				},
				{
					name: '⏱️ Average Response Time',
					value: `${avgResponseTime.toFixed(2)} minutes`,
					inline: true,
				},
				{
					name: '📈 Average Daily Tickets',
					value: `${avgDailyTickets.toFixed(2)} tickets per day`,
					inline: true,
				},
			]);

			// Add feedback rating
			statsEmbed.addFields({
				name: '⭐ Overall Feedback Rating',
				value: feedbackStats.ticketsWithFeedback > 0
					? `${starRating} (${avgFeedbackRating.toFixed(2)}/5 from ${feedbackStats.ticketsWithFeedback} ratings)`
					: 'No feedback ratings yet',
			});

			// Add staff performance if available
			if (staffStats.length > 0) {
				const staffField = {
					name: '👥 Staff Performance',
					value: staffStats.slice(0, 5).map((staff, index) => {
						let staffLine = `${index + 1}. ${staff.name}: ${staff.ticketsHandled} tickets`;
						
						staffLine += ` (${staff.avgResponseTime.toFixed(2)} min avg)`;
						
						if (staff.staffFeedbackCount > 0) {
							const staffStars = this.generateStarRating(staff.avgStaffRating);
							staffLine += ` ${staffStars} (${staff.avgStaffRating.toFixed(2)}/5 from ${staff.staffFeedbackCount} ratings)`;
						}
						
						return staffLine;
					}).join('\n'),
				};
				
				statsEmbed.addFields(staffField);
			}

			await interaction.editReply({ embeds: [statsEmbed] });

		} catch (error) {
			// Use a proper logging mechanism instead of console.error
			client.logger.error('Error in stats command', { 
				error: error.message, 
				stack: error.stack,
				userId: interaction.user.id,
				guildId: interaction.guild.id
			});

			return await interaction.editReply({
				embeds: [
					new ExtendedEmbedBuilder({
						iconURL: interaction.guild.iconURL(),
						text: settings.footer,
					})
						.setColor(settings.errorColour)
						.setTitle('❌ Error')
						.setDescription('There was an error generating ticket statistics.'),
				],
			});
		}
	}
};
