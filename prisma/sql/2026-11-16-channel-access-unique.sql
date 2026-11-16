-- One access row per (user, channel), matching @@unique([userid, channelId])
-- on ChannelAccess in schema.prisma.
--
-- Apply this by hand instead of `prisma db push`: the live database has
-- drifted from schema.prisma (varchar vs text columns, idx_* constraint
-- names, nullable timeout columns), and a push would apply all of that too.
-- The index name is the one Prisma generates, so later pushes see it as done.
--
-- Duplicates are removed first, keeping the oldest row (lowest id) of each
-- (userid, channelId) pair. Check what will be removed beforehand with:
--   SELECT userid, "channelId", array_agg(id ORDER BY id) AS ids,
--          array_agg("accessLevel" ORDER BY id) AS levels
--   FROM "ChannelAccess" GROUP BY 1, 2 HAVING count(*) > 1;

BEGIN;

DELETE FROM "ChannelAccess" a
USING "ChannelAccess" b
WHERE a.userid = b.userid
  AND a."channelId" = b."channelId"
  AND a.id > b.id;

CREATE UNIQUE INDEX IF NOT EXISTS "ChannelAccess_userid_channelId_key"
  ON "ChannelAccess" ("userid", "channelId");

COMMIT;
