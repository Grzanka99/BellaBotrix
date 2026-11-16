-- All or nothing: a failure leaves the database as it was.
BEGIN;

-- Block writes (reads still work) until COMMIT, so no access row can be
-- inserted between removing the duplicates and creating the index.
LOCK TABLE "ChannelAccess" IN SHARE ROW EXCLUSIVE MODE;

-- One access row per (user, channel). Existing duplicates are removed first,
-- keeping the oldest row (lowest id) of each pair.
DELETE FROM "ChannelAccess" a
USING "ChannelAccess" b
WHERE a.userid = b.userid
  AND a."channelId" = b."channelId"
  AND a.id > b.id;

-- CreateIndex
CREATE UNIQUE INDEX "ChannelAccess_userid_channelId_key" ON "ChannelAccess"("userid", "channelId");

COMMIT;
