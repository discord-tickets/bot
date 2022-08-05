DISCORD_SECRET=
DISCORD_TOKEN=
DB_CONNECTION_URL="mysql://test:password@localhost/tickets0"
DB_PROVIDER=mysql
ENCRYPTION_KEY=
HTTP_BIND=8080
HTTP_EXTERNAL=http://localhost:8080
PORTAL=http://localhost:3000
SUPER=


https://www.prisma.io/docs/reference/database-reference/supported-databases

![](https://static.eartharoid.me/k/22/08/02185801.png) - for user/create, slash/force-close and slash/move

menu question max length cannot be higher than question options 

- TODO: post stats
- TODO: settings bundle download
- TODO: update notifications
- TODO: check inline to-dos


creation requires an interaction:
- /new -> category? -> topic or questions -> create
- user:create(self) -> category? -> topic or questions -> create
- user:create(staff) -> category? -> DM (channel fallback) button -> topic or questions -> create
- message:create(self) -> category? -> topic or questions -> create
- message:create(staff) -> category? -> DM (channel fallback) button -> topic or questions -> create
- DM -> guild? -> category? -> topic or questions -> create
- panel(interaction) -> topic or questions -> create
- panel(message) -> DM (channel fallback) button -> topic or questions -> create