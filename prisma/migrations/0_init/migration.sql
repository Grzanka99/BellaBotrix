-- CreateTable
CREATE TABLE "AutomodEvents" (
    "id" SERIAL NOT NULL,
    "streamId" INTEGER NOT NULL,
    "timestamp" VARCHAR(191) NOT NULL,
    "action" VARCHAR(191) NOT NULL,
    "handler" VARCHAR(191) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT -1,
    "target" VARCHAR(191) NOT NULL,
    "channel" VARCHAR(191) NOT NULL,
    "message" VARCHAR(191) NOT NULL DEFAULT '',

    CONSTRAINT "idx_32769_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "channel_id" VARCHAR(191) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "token" VARCHAR(191) NOT NULL,

    CONSTRAINT "idx_32778_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelAccess" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "channelId" INTEGER NOT NULL,
    "accessLevel" VARCHAR(191) NOT NULL DEFAULT 'MOD',

    CONSTRAINT "idx_32786_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commands" (
    "id" SERIAL NOT NULL,
    "uniqueName" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "message" JSON,
    "alias" VARCHAR(191) NOT NULL DEFAULT '',
    "channelName" VARCHAR(191) NOT NULL DEFAULT '',
    "isCore" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" VARCHAR(191) NOT NULL DEFAULT '',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "price" INTEGER NOT NULL DEFAULT 0,
    "timeout" INTEGER DEFAULT 30,
    "timeoutEnabled" BOOLEAN DEFAULT false,
    "timeoutType" TEXT DEFAULT 'USER',

    CONSTRAINT "idx_32792_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OllamaAIHistory" (
    "id" SERIAL NOT NULL,
    "model" VARCHAR(191) NOT NULL,
    "historySize" INTEGER NOT NULL,
    "entryPrompt" TEXT NOT NULL,
    "username" VARCHAR(191) NOT NULL,
    "userMessage" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "channel" VARCHAR(191) NOT NULL,
    "language" VARCHAR(191) NOT NULL,

    CONSTRAINT "idx_32805_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OllamaAIModels" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "provider" VARCHAR(191) NOT NULL DEFAULT 'ollama',

    CONSTRAINT "idx_32812_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OllamaAISetupPrompts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(191),
    "text" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "idx_32820_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "R6DleGame" (
    "id" SERIAL NOT NULL,
    "operator" VARCHAR(191) NOT NULL,
    "winner" VARCHAR(191),
    "channel" VARCHAR(191) NOT NULL,
    "inProgress" BOOLEAN NOT NULL,

    CONSTRAINT "idx_32827_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "R6DleGuessHistory" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "guess" VARCHAR(191) NOT NULL,
    "player" VARCHAR(191) NOT NULL,
    "correctGuess" BOOLEAN NOT NULL,

    CONSTRAINT "idx_32834_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "R6DleOperators" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "role" VARCHAR(191) NOT NULL,
    "side" VARCHAR(191) NOT NULL,
    "country" VARCHAR(191) NOT NULL,
    "org" VARCHAR(191) NOT NULL,
    "squad" VARCHAR(191) NOT NULL,
    "release" INTEGER NOT NULL,
    "speed" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "region" VARCHAR(191) NOT NULL,
    "gender" VARCHAR(191) NOT NULL DEFAULT 'Other',

    CONSTRAINT "idx_32839_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solo" (
    "id" SERIAL NOT NULL,
    "user1" VARCHAR(191) NOT NULL,
    "user2" VARCHAR(191) NOT NULL,
    "channel" VARCHAR(191) NOT NULL,
    "inProgress" BOOLEAN NOT NULL,
    "points" INTEGER NOT NULL,
    "winner" VARCHAR(191),

    CONSTRAINT "idx_32848_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamStats" (
    "id" SERIAL NOT NULL,
    "streamId" INTEGER NOT NULL,
    "timestamp" VARCHAR(191) NOT NULL,
    "viewers" INTEGER NOT NULL DEFAULT 0,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "follows" INTEGER NOT NULL DEFAULT 0,
    "subscribers" INTEGER NOT NULL DEFAULT 0,
    "newChatters" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "idx_32855_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Streams" (
    "id" SERIAL NOT NULL,
    "unique_id" VARCHAR(191) NOT NULL,
    "streamer_id" VARCHAR(191) NOT NULL,
    "channel" VARCHAR(191) NOT NULL,
    "started_at" VARCHAR(191) NOT NULL,
    "finished_at" VARCHAR(191),
    "uniqueChatters" INTEGER,

    CONSTRAINT "idx_32865_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCommands" (
    "id" SERIAL NOT NULL,
    "uniqueName" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "parentCommand" VARCHAR(191) NOT NULL,
    "message" JSON,
    "alias" VARCHAR(191) NOT NULL DEFAULT '',
    "channelName" VARCHAR(191) NOT NULL DEFAULT '',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "price" INTEGER NOT NULL DEFAULT 0,
    "timeout" INTEGER DEFAULT 30,
    "timeoutEnabled" BOOLEAN DEFAULT false,
    "timeoutType" TEXT DEFAULT 'USER',

    CONSTRAINT "idx_32872_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timers" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "timeout" INTEGER NOT NULL,
    "message" VARCHAR(191) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "idx_32883_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriggerWords" (
    "id" SERIAL NOT NULL,
    "channelId" INTEGER NOT NULL,
    "triggers" VARCHAR(191) NOT NULL,
    "response" VARCHAR(191) NOT NULL,
    "enabled" BOOLEAN NOT NULL,

    CONSTRAINT "idx_32889_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "userid" VARCHAR(191) NOT NULL,
    "username" VARCHAR(191) NOT NULL,
    "channel" VARCHAR(191) NOT NULL,
    "sentMessages" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "isBot" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "idx_32894_PRIMARY" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebuiUser" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(191) NOT NULL,
    "password" VARCHAR(191) NOT NULL,
    "token" VARCHAR(191) NOT NULL DEFAULT '',
    "channelId" INTEGER NOT NULL DEFAULT -1,
    "settings" JSON NOT NULL,
    "perms" VARCHAR(191) NOT NULL DEFAULT 'user',

    CONSTRAINT "idx_32904_PRIMARY" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idx_32778_Channel_channel_id_key" ON "Channel"("channel_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_32778_Channel_name_key" ON "Channel"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_32778_Channel_token_key" ON "Channel"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_32792_Commands_uniqueName_key" ON "Commands"("uniqueName" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_32839_R6DleOperators_name_key" ON "R6DleOperators"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_32865_Streams_unique_id_key" ON "Streams"("unique_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_32872_SubCommands_uniqueName_key" ON "SubCommands"("uniqueName" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_32894_User_userid_key" ON "User"("userid" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_32904_WebuiUser_username_key" ON "WebuiUser"("username" ASC);

-- AddForeignKey
ALTER TABLE "R6DleGuessHistory" ADD CONSTRAINT "R6DleGuessHistory_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "R6DleGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamStats" ADD CONSTRAINT "StreamStats_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "Streams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

