> REPL is great, but I do **NOT** recommend hosting a Discord bot on it unless you have no other option. A £35 Raspberry Pi is more than enough to host this bot. Unless you have a premium "hacker" account, you won't be able to make your REPL private, meaning **anyone can read through all of your ticket transcripts.**

If you want to host the bot using [repl.it](https://repl.it) or other free hosting, you need to make some changes. This is required to ensure no one can steal your bot token (REPL only hides `/.env`, not `/user/.env`)

1. Open `/src/index.js`, edit [line 19](https://github.com/eartharoid/DiscordTickets/blob/49b5205713517434db89e46549f3fdeb61581490/src/index.js#L19):
```diff
- 19 | require('dotenv').config({path: path.join('user/', dev ? 'dev.env' : '.env')}); // replace this
+ 19 | require('dotenv').config(); // with this
```
2. Delete `/user/.env`
3. Create `/.env` and add paste the following:
```env
TOKEN=

ARCHIVES_KEY=

DB_HOST=
DB_NAME=
DB_USER=
DB_PASS=
```
4. Continue setup as usual, configure the bot as required.

## Video

Note that this video does **not** include the required changes as described above.

[![YouTube video](https://img.youtube.com/vi/k0Y4HBs2Bgk/0.jpg)](https://www.youtube.com/watch?v=k0Y4HBs2Bgk "Make your own Ticket Bot || Discord Ticket Bot || 24/7 Online")
