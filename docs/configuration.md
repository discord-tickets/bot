# NOTICE

All configuration files are in `user/`.

The following values are **REQUIRED**

1. .env
 - `TOKEN` - Your Discord bot's token
2. config.js
 - `guild` - ID of your Discord server/guild
 - `staff_role` - ID of your staff role
 - `tickets.category` - ID of the category channel

***

<!-- auto-generated -->
# Contents

- [Contents](#contents)
- [.env](#env)
- [config.js](#configjs)
	- [prefix](#prefix)
	- [name](#name)
	- [presences](#presences)
	- [append_presence](#append_presence)
	- [colour](#colour)
	- [err_colour](#err_colour)
	- [cooldown](#cooldown)
	- [guild](#guild)
	- [staff_role](#staff_role)
	- [tickets](#tickets)
		- [tickets.category](#ticketscategory)
		- [tickets.send_img](#ticketssend_img)
		- [tickets.ping](#ticketsping)
		- [tickets.text](#ticketstext)
		- [tickets.pin](#ticketspin)
		- [tickets.max](#ticketsmax)
	- [transcripts](#transcripts)
		- [transcripts.text](#transcriptstext)
			- [transcripts.text.enabled](#transcriptstextenabled)
			- [transcripts.text.keep_for](#transcriptstextkeep_for)
		- [transcripts.web](#transcriptsweb)
			- [transcripts.web.enabled](#transcriptswebenabled)
			- [transcripts.web.server](#transcriptswebserver)
	- [panel](#panel)
		- [panel.title](#paneltitle)
		- [panel.description](#paneldescription)
		- [panel.reaction](#panelreaction)
	- [storage](#storage)
		- [storage.type](#storagetype)
			- [Using a non-default provider](#using-a-non-default-provider)
	- [logs](#logs)
		- [logs.files](#logsfiles)
			- [logs.files.enabled](#logsfilesenabled)
			- [logs.files.keep_for](#logsfileskeep_for)
		- [logs.discord](#logsdiscord)
			- [logs.discord.enabled](#logsdiscordenabled)
			- [logs.discord.channel](#logsdiscordchannel)
	- [debug](#debug)
	- [updater](#updater)

# .env

|Setting|Required?|Info|
|-------|---------|----|
|TOKEN|**yes**|Discord Token|
|ARCHIVES_KEY|if using web archives|Secret API key for DiscordTickets-Portal|
|DB_HOST|if using MySQL|`server[:port]` for MySQL server|
|DB_NAME|if using MySQL| Database name|
|DB_USER|if using MySQL| Database user|
|DB_PASS|no| Database password|

# config.js

**Important:** You **must** set values (Discord IDs) to any empty options (other than where a feature is disabled).

## prefix

| | |
|-|-|
|default|`-`|
|info|command prefix|

## name

| | |
|-|-|
|default|`'DiscordTickets'`|
|info|name of bot, used in log files and errors messages|

## presences

| | |
|-|-|
|default|*an example object*|
|info|arrary of presence objects (objects should have `name` and `type` properties)|

Use `%s` to use the prefix (eg: `%snew` would become `-new`).

`type` must be a valid (bot) [ActivityType](https://discord.js.org/#/docs/main/stable/typedef/ActivityType): `PLAYING`, `STREAMING`, `LISTENING`, or `WATCHING`.

## append_presence

| | |
|-|-|
|default|`' \| %shelp'`|
|info|String appended the end of the above activities|

Set to an empty string (`''`) if you don't want this.
Use `%s` to use the prefix (eg: `%shelp` would become `-help`).


## colour

| | |
|-|-|
|default|`'#009999'`|
|info|A [resolvable colour](https://discord.js.org/#/docs/main/stable/typedef/ColorResolvable) for embeds|

String (`'#ABCDEF'` HEX or `'COLOUR'` name), or RGB array `[0, 153, 153]`.

## err_colour

| | |
|-|-|
|default|`'#E74C3C'`|
|info|A [resolvable colour](https://discord.js.org/#/docs/main/stable/typedef/ColorResolvable) for error embeds|

String (`'#ABCDEF'` HEX or `'COLOUR'` name), or RGB array `[0, 153, 153]`.

## cooldown

| | |
|-|-|
|default|`3`|
|info|Number of seconds for command cooldown|

## guild

| | |
|-|-|
|default||
|info|**REQUIRED:** ID of your guild|

Enable developer mode in your Discord client's settings, then right click the guild and copy the ID.

## staff_role

| | |
|-|-|
|default||
|info|**REQUIRED**: ID of your support team role|

Send `\@Role` or copy the ID from the roles page in the settings by right clicking the role with developer mode enabled.

## tickets

### tickets.category

| | |
|-|-|
|default||
|info|**REQUIRED**: ID of the category for ticket channels|

Create a category that can't be seen by members and copy the ID.

### tickets.send_img

| | |
|-|-|
|default|`true`|
|info|Send an image on ticket creation? See below for details|

If enabled, a random image from `user/images/` will be sent. If you want the same image to be sent every time, just make sure there is only 1 file in the directory. *Note it does not check file type or extension, any file in this directory may be randomly selected.*

<details>
<summary>Default images</summary>
<br>
The 3 images included are GIFs from a series called New Amsterdam. See <a href="https://github.com/eartharoid/DiscordTickets/#screenshot">README#Screenshot</a>.
</details>
<br>

### tickets.ping

| | |
|-|-|
|default|`'here'`|
|info|Who to ping on ticket creation|
|options|`'here'`, `'everyone'`, `'staff'`, `false`|

Set to `false` to disable.
`'here'` will ping all online staff, `'everyone'` and `'staff'` will ping all staff.

### tickets.text

| | |
|-|-|
|default| <pre>\`Hello there, {{ tag }}!<br>A member of staff will assist you shortly.<br>In the mean time, please describe your issue in as much detail as possible! :)\`</pre>|
|info|Text inside embed description sent in new tickets|
|placeholders|`name`, `tag`|

You can use `{{ name }}` and `{{ tag }}` placeholders: `Eartharoid`, `@Eartharoid`.

### tickets.pin

| | |
|-|-|
|default|`false`|
|info|pin the embed after sending new ticket message?|

### tickets.max

| | |
|-|-|
|default|`3`|
|info|max number of open tickets per member|

## transcripts

### transcripts.text

#### transcripts.text.enabled

| | |
|-|-|
|default|`true`|
|info|enable text transcripts?|

#### transcripts.text.keep_for

| | |
|-|-|
|default|`90`|
|info|number of days to keep files|

### transcripts.web

#### transcripts.web.enabled

| | |
|-|-|
|default|`false`|
|info|enable web archives?|

Please see [this page](https://github.com/eartharoid/DiscordTickets/wiki/Archives).

#### transcripts.web.server

| | |
|-|-|
|default|`'https://tickets.example.com'`|
|info|Server address **WITHOUT** trailing `/`|

**Note:** Make sure you set your key in `user/.env`.

## panel

### panel.title

| | |
|-|-|
|default|`'Support Tickets'`|
|info|title of panel embed|

### panel.description

| | |
|-|-|
|default|`'Need help? No problem! React to this panel to create a new support ticket so our Support Team can assist you.'`|
|info|panel text|

### panel.reaction

| | |
|-|-|
|default|`'🧾'`|
|info|emoji to react to panel with. either unicode character, or the ID of a custom emoji from your guild|

## storage

### storage.type

| | |
|-|-|
|default|`'sqlite'`|
|info|Database provider to use|
|options|`'sqlite'`, `'mysql'`, `'mariadb'`, `'postgre'`, `'microsoft'`|

Although SQLite is the default, MySQL (or one of the others) is highly recommended if you are able to use it as it is much faster.

#### Using a non-default provider


1. Set the database provider name as shown above.
2. Install the package with NPM (eg: `npm i mysql2`).
3. Edit `user/.env`, setting the `DB_` options.

## logs

### logs.files

#### logs.files.enabled

| | |
|-|-|
|default|`true`|
|info|log everything into `logs/*.log` ?|

#### logs.files.keep_for

| | |
|-|-|
|default|`7`|
|info|Number of days to keep logs|

### logs.discord

#### logs.discord.enabled

| | |
|-|-|
|default|`false`|
|info|Send ticket logs to a Discord channel?|

#### logs.discord.channel

| | |
|-|-|
|default||
|info|Required if above is true. ID of a channel.|

## debug

| | |
|-|-|
|default|`false`|
|info|Spam the console?|

## updater

| | |
|-|-|
|default|`true`|
|info|Bot update alerts?|
