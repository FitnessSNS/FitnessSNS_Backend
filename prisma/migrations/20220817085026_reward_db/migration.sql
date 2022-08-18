-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nickname" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upadtedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUN',
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserProfile" ("createdAt", "id", "nickname", "status", "upadtedAt", "userId") SELECT "createdAt", "id", "nickname", "status", "upadtedAt", "userId" FROM "UserProfile";
DROP TABLE "UserProfile";
ALTER TABLE "new_UserProfile" RENAME TO "UserProfile";
CREATE UNIQUE INDEX "UserProfile_nickname_key" ON "UserProfile"("nickname");
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
CREATE TABLE "new_Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ip" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upadtedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUN',
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("createdAt", "id", "ip", "refresh_token", "status", "upadtedAt", "userId") SELECT "createdAt", "id", "ip", "refresh_token", "status", "upadtedAt", "userId" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_userId_key" ON "Session"("userId");
CREATE TABLE "new_Reward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "point" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upadtedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUN',
    CONSTRAINT "Reward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reward" ("createdAt", "id", "point", "reason", "status", "upadtedAt", "userId") SELECT "createdAt", "id", "point", "reason", "status", "upadtedAt", "userId" FROM "Reward";
DROP TABLE "Reward";
ALTER TABLE "new_Reward" RENAME TO "Reward";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "provider" TEXT NOT NULL,
    "provider_id" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "account_details_saved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upadtedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUN'
);
INSERT INTO "new_User" ("account_details_saved", "createdAt", "email", "id", "password", "provider", "provider_id", "status", "upadtedAt") SELECT "account_details_saved", "createdAt", "email", "id", "password", "provider", "provider_id", "status", "upadtedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_provider_provider_id_key" ON "User"("provider", "provider_id");
CREATE UNIQUE INDEX "User_provider_email_key" ON "User"("provider", "email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
