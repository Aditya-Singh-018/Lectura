import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const ingestQueue = new Queue('youtube-ingestion', { connection });

async function triggerPlaylistTest() {
  console.log('Sending a real PLAYLIST to the ingestQueue...');
  
  // 🟩 Drop a real YouTube playlist URL payload down the pipe!
  // Replace this with any real multi-video playlist URL you want to test
  const playlistUrl = 'https://youtube.com/playlist?list=PL0vfts4VzfNi6_7SCEWwQXo1C17Lf9WFV&si=eWXERcLTx4WoYccC'; 
  
  const job = await ingestQueue.add('ingest-job', {
    url: playlistUrl,
    playlistId: null // The parent job starts clean
  });

  console.log(`Success! Parent Playlist Job added with ID: ${job.id}`);
  await connection.quit();
}

triggerPlaylistTest().catch(console.error);