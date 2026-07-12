import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const ingestQueue = new Queue('youtube-ingestion', { connection });

async function triggerPlaylistTest() {
  console.log('Sending a real VIDEO to the ingestQueue...');
  
  const videoUrl = 'https://youtu.be/FepDo-0DrSo?si=xQiWmWr2IeLL7Auq'; 
  
  const job = await ingestQueue.add('ingest-job', {
    url: videoUrl,
    videoId: null // The parent job starts clean
  });

  console.log(`Success! Video Job added with ID: ${job.id}`);
  await connection.quit();
}

triggerPlaylistTest().catch(console.error);