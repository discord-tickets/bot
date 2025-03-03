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
	 * @param {import("discord.js").ChatInputCommandInteraction} interaction
	 */
	async run(interaction) {
		/** @type {import("client")} */
		const client = this.client;

		// Fix: Remove ephemeral option to avoid deprecation warning
		await interaction.deferReply();

		// Get guild settings
		const settings = await client.prisma.guild.findUnique({ where: { id: interaction.guild.id } });

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
		let startDate;
		const endDate = new Date();
		
		// Calculate start date based on time range
		switch(timeRange) {
			case '24h':
				startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
				break;
			case '7d':
				startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case '30d':
				startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case '90d':
				startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			default:
				startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
		}

		// Map time range to display text
		const timeRangeDisplay = {
			'24h': 'Last 24 Hours',
			'7d': 'Last 7 Days', 
			'30d': 'Last 30 Days',
			'90d': 'Last 90 Days'
		}[timeRange];

		try {
			// Get tickets with related data
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

			// 1. Calculate Most Popular Category
			const categoryCount = {};
			tickets.forEach(ticket => {
				if (ticket.category) {
					const categoryName = ticket.category.name;
					categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
				}
			});
			
			let mostPopularCategory = { name: 'None', count: 0 };
			Object.entries(categoryCount).forEach(([name, count]) => {
				if (count > mostPopularCategory.count) {
					mostPopularCategory = { name, count };
				}
			});

			// 2. Calculate Average Response Time (in minutes)
			let totalResponseTime = 0;
			let ticketsWithResponse = 0;
			
			tickets.forEach(ticket => {
				if (ticket.firstResponseAt && ticket.createdAt) {
					const responseTime = ticket.firstResponseAt.getTime() - ticket.createdAt.getTime();
					totalResponseTime += responseTime;
					ticketsWithResponse++;
				}
			});
			
			const avgResponseTime = ticketsWithResponse > 0 
				? (totalResponseTime / ticketsWithResponse) / (1000 * 60) // Convert to minutes
				: 0;

			// 3. Calculate Average Daily Tickets
			const daysDifference = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
			const avgDailyTickets = tickets.length / daysDifference;

			// 4. Calculate Average Feedback Rating
			let totalRating = 0;
			let ticketsWithFeedback = 0;
			
			tickets.forEach(ticket => {
				if (ticket.feedback && ticket.feedback.rating) {
					totalRating += ticket.feedback.rating;
					ticketsWithFeedback++;
				}
			});
			
			const avgFeedbackRating = ticketsWithFeedback > 0 
				? totalRating / ticketsWithFeedback
				: 0;
				
			// Generate star display for the rating
			const starRating = generateStarRating(avgFeedbackRating);

			// 5. Calculate Staff Performance
			const staffPerformance = {};
			
			// Collect stats for claimed tickets
			tickets.forEach(ticket => {
				if (ticket.claimedById) {
					if (!staffPerformance[ticket.claimedById]) {
						staffPerformance[ticket.claimedById] = {
							id: ticket.claimedById,
							name: ticket.claimedBy?.id ? `<@${ticket.claimedBy.id}>` : `ID: ${ticket.claimedById}`,
							ticketsHandled: 0,
							closedTickets: 0,
							totalResponseTime: 0,
							ticketsWithResponse: 0,
							totalRating: 0,
							ticketsWithFeedback: 0
						};
					}
					
					staffPerformance[ticket.claimedById].ticketsHandled++;
					
					if (!ticket.open) {
						staffPerformance[ticket.claimedById].closedTickets++;
					}
					
					if (ticket.firstResponseAt && ticket.createdAt) {
						staffPerformance[ticket.claimedById].totalResponseTime += 
							ticket.firstResponseAt.getTime() - ticket.createdAt.getTime();
						staffPerformance[ticket.claimedById].ticketsWithResponse++;
					}
					
					if (ticket.feedback && ticket.feedback.rating) {
						staffPerformance[ticket.claimedById].totalRating += ticket.feedback.rating;
						staffPerformance[ticket.claimedById].ticketsWithFeedback++;
					}
				}
			});
			
			// Process staff performance data and sort by tickets handled
			const staffStats = Object.values(staffPerformance).map(staff => {
				return {
					...staff,
					avgResponseTime: staff.ticketsWithResponse > 0 
						? (staff.totalResponseTime / staff.ticketsWithResponse) / (1000 * 60) 
						: 0,
					avgRating: staff.ticketsWithFeedback > 0
						? staff.totalRating / staff.ticketsWithFeedback
						: 0
				};
			}).sort((a, b) => b.ticketsHandled - a.ticketsHandled);
			
			// Create the main stats embed
			const statsEmbed = new ExtendedEmbedBuilder({
				iconURL: interaction.guild.iconURL(),
				text: settings.footer,
			})
				.setColor(settings.primaryColour)
				.setTitle('📊 Ticket Statistics')
				.setDescription(`Statistics for ${timeRangeDisplay}`);
			
			// Add basic ticket counts
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
				name: '⭐ Average Feedback Rating',
				value: ticketsWithFeedback > 0
					? `${starRating} (${avgFeedbackRating.toFixed(2)}/5 from ${ticketsWithFeedback} ratings)`
					: 'No feedback ratings yet',
			});
			
			// Add staff performance if available
			if (staffStats.length > 0) {
				const staffField = {
					name: '👥 Staff Performance',
					value: staffStats.slice(0, 5).map((staff, index) => {
						let staffLine = `${index + 1}. ${staff.name}: ${staff.ticketsHandled} tickets (${staff.avgResponseTime.toFixed(2)} min avg)`;
						
						if (staff.ticketsWithFeedback > 0) {
							const staffStars = generateStarRating(staff.avgRating);
							staffLine += ` ${staffStars}`;
						}
						
						return staffLine;
					}).join('\n'),
				};
				
				statsEmbed.addFields(staffField);
			}
			
			await interaction.editReply({ embeds: [statsEmbed] });
			
			// Fix: Skip logging to avoid the Prisma error 
			// The logTicketEvent function seems to be looking for a ticket ID when action is 'stats'
			// Instead of logging with ticket actions, we'll just log to console
			console.log(`Stats command used by ${interaction.user.tag} (${interaction.user.id}) with timerange: ${timeRange}`);
			
		} catch (error) {
			console.error('Error in stats command:', error);
			
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

/**
 * Generate a star rating display based on a numeric rating
 * @param {number} rating - Rating value (typically between 0-5)
 * @returns {string} Star rating display (e.g., "★★★☆☆")
 */
function generateStarRating(rating) {
	const fullStars = Math.floor(rating);
	const halfStar = rating - fullStars >= 0.5;
	const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
	
	return '★'.repeat(fullStars) + (halfStar ? '⭐' : '') + '☆'.repeat(emptyStars);
}
