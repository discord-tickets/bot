# Getting Started

See the [README](https://github.com/eartharoid/DiscordTickets#readme) for information about the project.

## Installation

### Requirements

A server with
- **at least** 50mb free memory and disk space
- Node.js v13.x or above (and NPM, Yarn, or PNPM)

If you don't have your own server and intend to use something like REPL.it or other free hosting, please [**READ THIS**](./REPL)!

### Download

Ideally, clone with Git.

```bash
git clone https://github.com/eartharoid/DiscordTickets.git
```

Otherwise, download the [latest release zip](https://github.com/eartharoid/DiscordTickets/releases).

### Setting up

#### Discord

1. Get your bot token from <https://discord.com/developers/applications/me>
2. Copy token into `user/.env` (`TOKEN=your-bot-token`)
3. Invite your bot: `https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID_HERE&permissions=8&scope=bot`

#### Configuation

With the exception of the [LICENSE](https://github.com/eartharoid/DiscordTickets/blob/master/LICENSE) *(which you should look at)*, the only files you need to edit are located in `user/`. This is also the directory used for storage.

[Configure](https://github.com/eartharoid/DiscordTickets/wiki/Configuration/) your bot.

#### Run

1. `cd ~/path/to/bot`, then `npm i` (or `yarn` / `pnpm`)
2. Edit `user/.env` and `user/config.js` ([configuration](./Configuration))
3. Start with `npm start` (or `yarn` / `pnpm`)

To keep it running, start it in a `screen`, use PM2, or use `systemd`.
