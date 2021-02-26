<img src='https://discordtickets.app/img/logo-small-circle.png' align='left' width='180px' height='180px' style='margin: 30px 40px 0 0'/>
<!-- <img align='left' width='0' height='192px' hspace='10'/> -->

<!-- omit in toc -->
# [DiscordTickets](https://discordtickets.app)

[![GitHub stars](https://img.shields.io/github/stars/eartharoid/DiscordTickets?style=flat-square)](https://github.com/eartharoid/DiscordTickets/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/eartharoid/DiscordTickets?style=flat-square)](https://github.com/eartharoid/DiscordTickets/stargazers)
[![License](https://img.shields.io/github/license/eartharoid/DiscordTickets?style=flat-square)](https://github.com/eartharoid/DiscordTickets/blob/master/LICENSE)
![Codacy grade](https://img.shields.io/codacy/grade/14e6851c85444424b75b8bc3f93e93db?logo=codacy&style=flat-square)
[![Discord](https://img.shields.io/discord/451745464480432129?label=discord&color=7289DA&style=flat-square)](https://discord.gg/pXc9vyC)

An open-source ticket management bot for Discord - a free alternative to the premium and white-label plans of other popular ticketing bots.

<br><br>

⚠️
**The code on the master branch is for v3 which is not ready. Please go to the [v2 branch](https://github.com/eartharoid/DiscordTickets/tree/v2) for the current version of the code and [documentation](https://github.com/eartharoid/DiscordTickets/wiki)**.

⚠️
**The following information is about v3. Please read the README file on the [v2 branch](https://github.com/eartharoid/DiscordTickets/tree/v2) for information that is about the current version.**

## What is this?

DiscordTickets is a Discord bot for creating and managing "support ticket" channels. It is a free and open-source alternative to the popular paid "premium" and "white-label" ticketing bots, such as [Ticket Tool](https://tickettool.xyz/), [TicketsBot](https://ticketsbot.net/), [Tickety](https://tickety.net/), [Helper.gg](https://helper.gg/), [Helper](https://helper.wtf), and others.

DiscordTickets is feature-rich and much more customisable than many of the bots mentioned above. As it is intended for self-hosting, the bot can have your community or company's logo, for free.

Although intended for use in a single Discord server, the bot can also function in multiple servers at once if you run more than one community.

### Features

DiscordTickets is packed full of features, many of which were suggested by its users. If it's missing a feature you want, you can:

- Create a plugin for it, if you can code JavaScript
- Request someone else to make a plugin
- [Submit a feature request](https://github.com/eartharoid/DiscordTickets/blob/master/.github/CONTRIBUTING.md#submitting-a-feature-request) if you think many other users would benefit from it

Here's some of the things that makes DiscordTickets awesome:

1. **Highly customisable**  
Some messages can be configured for each server and for each ticket category. Every other message is set in the locale files, making it relatively easy to override the default messages.
You can also configure the functionality of the bot to your liking and add commands with plugins.

2. **Localisable**  
If the bot hasn't already been translated to your (community's) language, you can [translate](https://github.com/eartharoid/DiscordTickets/blob/master/.github/CONTRIBUTING.md#translating) it yourself.
Plugin authors are encouraged to support multiple languages as well.

3. **Multiple ticket categories**  
Each ticket category has its own settings for messages and the support team roles. There's also multiple methods of creating a ticket.

4. **A beautiful ticket archives portal**  
Add the official [DiscordTickets-Portal](https://github.com/eartharoid/DiscordTickets-Portal) plugin for an instant ticket archives website.

5. **Plugin support**  
Developers can add a lot of functionality to DiscordTickets without modifying the source code by creating plugins. Plugins can listen for client and ticket events, create commands, and more. [DiscordTickets-Portal](https://github.com/eartharoid/DiscordTickets-Portal) is an example of what can be done with plugins.

6. **Open-source and self-hosted**  
It's yours.

7. **Supports multiple databases**  
DiscordTickets uses [Sequelize](https://github.com/sequelize/sequelize) to allow you to choose from SQLite, MySQL, MariaDB, PostgreSQL, or MSSQL for your database, with very little setup.
If you choose SQLite, which is the default as it is the easiest, you don't need to do anything! If you choose to use another database (recommended), you only need to install the package(s) with NPM and create the database. All of the database tables are created automatically, regardless of which database type you use.

### Screenshots

> screenshot of a ticket channel
<!-- -->
> screenshot of a panel

## Getting started

| [**Host it yourself**](https://discordtickets.app/installation) | [**Fully managed hosting**](https://discordtickets.app/hosting) | [**Public test bot**](https://discord.com/oauth2/authorize?permissions=8&scope=applications.commands%20bot&client_id=475371285531066368) |
|:-:|:-:|:-:|
| Recommended if you have a host and you've done this before. | Recommended if you have no idea what you're doing. | Try out the bot. Not recommended for production use. |
| [Go to the docs »](https://discordtickets.app/installation) | [Learn more »](https://discordtickets.app/hosting) | [Add to Discord »](https://discord.com/oauth2/authorize?permissions=8&scope=applications.commands%20bot&client_id=475371285531066368) |

## Documentation

You will find most of information you need at [discordtickets.app](https://discordtickets.app).

## Support

If the [documentation](https://discordtickets.app) leaves you with questions, you can ask for help in the [discussions](https://github.com/eartharoid/DiscordTickets/discussions/categories/support-q-a) or join the support server on Discord.

[![Discord](https://discordapp.com/api/guilds/451745464480432129/widget.png?style=banner4)](https://go.eartharoid.me/discord)

## Contributing

For contributing instructions, or to find out all of the ways you can contribute, read [CONTRIBUTING.md](https://github.com/eartharoid/DiscordTickets/blob/master/.github/CONTRIBUTING.md). All contributions are welcome and encouraged, but please [read the information](https://github.com/eartharoid/DiscordTickets/blob/master/.github/CONTRIBUTING.md) given before doing so.

## Contributors

Thank you to everyone to has contributed to DiscordTickets, including everyone who has:

- Contributed code
- Translated
- Improved documentation
- Reported bugs
- Requested a feature
- Given help or support to other users
- Created a public plugin
- Created resources such as tutorials

**A full list of contributors can be found in [CONTRIBUTORS.md](https://github.com/eartharoid/DiscordTickets/blob/master/CONTRIBUTORS.md).**

## Sponsors

Does your community or company use DiscordTickets? Sponsor the project to get your logo shown here.

### Donate

[![Donate at ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/eartharoid)

## License

DiscordTickets is licensed under the [GPLv3 license](https://github.com/eartharoid/DiscordTickets/blob/master/LICENSE).

DiscordTickets is not related to Discord Inc.

© 2021 Isaac Saunders
