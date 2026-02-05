-- SQLite does not require explicit column type change for BIGINT
-- as it uses dynamic typing and INTEGER can already store 64-bit values.
-- However, we create this migration for consistency with other databases.
-- RedefineTables
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_categories" (
    "channelName" TEXT NOT NULL,
    "claiming" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cooldown" BIGINT,
    "customTopic" TEXT,
    "description" TEXT NOT NULL,
    "discordCategory" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "enableFeedback" BOOLEAN NOT NULL DEFAULT false,
    "guildId" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "image" TEXT,
    "memberLimit" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "openingMessage" TEXT NOT NULL,
    "pingRoles" TEXT NOT NULL DEFAULT '[]',
    "ratelimit" INTEGER,
    "requiredRoles" TEXT NOT NULL DEFAULT '[]',
    "requireTopic" BOOLEAN NOT NULL DEFAULT false,
    "staffRoles" TEXT NOT NULL,
    "totalLimit" INTEGER NOT NULL DEFAULT 50,
    CONSTRAINT "categories_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_categories" (
    "channelName",
    "claiming",
    "createdAt",
    "cooldown",
    "customTopic",
    "description",
    "discordCategory",
    "emoji",
    "enableFeedback",
    "guildId",
    "id",
    "image",
    "memberLimit",
    "name",
    "openingMessage",
    "pingRoles",
    "ratelimit",
    "requiredRoles",
    "requireTopic",
    "staffRoles",
    "totalLimit"
) SELECT
    "channelName",
    "claiming",
    "createdAt",
    "cooldown",
    "customTopic",
    "description",
    "discordCategory",
    "emoji",
    "enableFeedback",
    "guildId",
    "id",
    "image",
    "memberLimit",
    "name",
    "openingMessage",
    "pingRoles",
    "ratelimit",
    "requiredRoles",
    "requireTopic",
    "staffRoles",
    "totalLimit"
FROM "categories";
DROP TABLE "categories";
ALTER TABLE "new_categories" RENAME TO "categories";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
