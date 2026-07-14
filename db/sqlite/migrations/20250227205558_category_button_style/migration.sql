-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_categories" (
    "buttonStyle" INTEGER NOT NULL DEFAULT 2,
    "channelName" TEXT NOT NULL,
    "claiming" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cooldown" INTEGER,
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
INSERT INTO "new_categories" ("channelName", "claiming", "cooldown", "createdAt", "customTopic", "description", "discordCategory", "emoji", "enableFeedback", "guildId", "id", "image", "memberLimit", "name", "openingMessage", "pingRoles", "ratelimit", "requireTopic", "requiredRoles", "staffRoles", "totalLimit") SELECT "channelName", "claiming", "cooldown", "createdAt", "customTopic", "description", "discordCategory", "emoji", "enableFeedback", "guildId", "id", "image", "memberLimit", "name", "openingMessage", "pingRoles", "ratelimit", "requireTopic", "requiredRoles", "staffRoles", "totalLimit" FROM "categories";
DROP TABLE "categories";
ALTER TABLE "new_categories" RENAME TO "categories";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
