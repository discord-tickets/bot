const { Listener } = require('@eartharoid/dbf');
const { isStaff } = require('../../lib/users');
const ms = require('ms');

/**
 * Ghost Ping Listener
 * Automatically ghost pings ticket creators when staff members
 * send messages and the creator hasn't been active recently
 */
module.exports = class extends Listener {
  constructor(client, options) {
    super(client, {
      ...options,
      emitter: client,
      event: 'messageCreate',
    });

    // Cache to track recently notified users to prevent spam
    this.recentlyNotified = new Map();

    // Cache to track active ticket creators
    this.activeTicketCreators = new Map();

    // Log initialization
    client.log.info.tickets('Ghost ping system initialized');
  }

  /**
   * @param {import("discord.js").Message} message
   */
  async run(message) {
    /** @type {import("client")} */
    const client = this.client;

    // Skip messages from bots
    if (message.author.bot) return;
    
    // Skip if not in a guild
    if (!message.guild) return;

    // Check if this is a ticket channel
    const ticket = await client.prisma.ticket.findUnique({
      where: { id: message.channel.id },
    });
    if (!ticket) return;

    // Skip if the ticket is closed
    if (!ticket.open) return;

    // Track activity for the ticket creator
    if (message.author.id === ticket.createdById) {
      this.activeTicketCreators.set(ticket.id, Date.now());
      client.log.verbose.tickets(`Ticket creator ${message.author.tag} is now marked as active`);
      return;
    }

    // Check if the message author is staff
    const isAuthorStaff = await isStaff(message.guild, message.author.id);
    if (!isAuthorStaff) return;

    // Check if the ticket creator was recently notified
    const lastNotified = this.recentlyNotified.get(ticket.id);
    if (lastNotified && Date.now() - lastNotified < ms('10m')) {
      // Don't notify again if less than 10 minutes have passed
      return;
    }

    // Check if ticket creator is recently active (last 15 minutes)
    const lastActive = this.activeTicketCreators.get(ticket.id);
    if (lastActive && Date.now() - lastActive < ms('15m')) {
      // Don't ping if they've been active recently
      client.log.verbose.tickets(`Skipping ghost ping: user was active ${ms(Date.now() - lastActive)} ago`);
      return;
    }

    try {
      // Fetch the ticket creator to make sure they still exist
      const creatorMember = await message.guild.members.fetch(ticket.createdById).catch(() => null);
      if (!creatorMember) {
        client.log.verbose.tickets(`Ticket creator is no longer in the server, skipping ghost ping`);
        return;
      }

      // Send a ping to the ticket creator and delete it immediately (ghost ping)
      const pingMessage = await message.channel.send(`<@${ticket.createdById}>`);
      await pingMessage.delete();
      
      client.log.verbose.tickets(`Ghost pinged ${creatorMember.user.tag} in ticket ${ticket.id}`);

      // Update the recently notified cache
      this.recentlyNotified.set(ticket.id, Date.now());

      // Clean up old cache entries periodically
      this._cleanupCache();
    } catch (error) {
      client.log.error.tickets(`Failed to ghost ping ticket creator: ${error.message}`);
    }
  }

  /**
   * Cleanup outdated cache entries to prevent memory leaks
   * @private
   */
  _cleanupCache() {
    const now = Date.now();
    let cleanupCount = 0;
    
    // Clear entries older than 15 minutes from the recently notified cache
    for (const [ticketId, timestamp] of this.recentlyNotified.entries()) {
      if (now - timestamp > ms('15m')) {
        this.recentlyNotified.delete(ticketId);
        cleanupCount++;
      }
    }
    
    // Clear entries older than 30 minutes from the active creators cache
    for (const [ticketId, timestamp] of this.activeTicketCreators.entries()) {
      if (now - timestamp > ms('30m')) {
        this.activeTicketCreators.delete(ticketId);
        cleanupCount++;
      }
    }
    
    if (cleanupCount > 0) {
      this.client.log.verbose.tickets(`Cleaned up ${cleanupCount} outdated cache entries`);
    }
  }
};
