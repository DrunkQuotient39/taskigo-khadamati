@echo off
set DATABASE_URL=postgresql://neondb_owner:npg_0zmGLFAVTfD8@ep-late-bird-a2hy8pmq.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
echo Environment variable set: DATABASE_URL
echo Now run: npm run db:push
