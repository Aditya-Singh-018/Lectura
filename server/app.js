// server/index.js (or server/server.js)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import your route modules
// import videoRoutes from './routes/videoRoutes.js';
import graphRoutes from './routes/graph.js';
import questionRoutes from './routes/questions.js';
import ingestRoutes from "./routes/ingest.js";
import profileRoutes from "./routes/profile.js";

// Import workers to ensure BullMQ queue listeners start listening
import './workers/ingestWorker.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Mount routes with the /api prefix
//app.use('/api', videoRoutes);  // Serves /api/videos
app.use('/api', graphRoutes);  // Serves /api/graph and /api/graph/video/:videoId
app.use("/api", questionRoutes);
app.use("/api",ingestRoutes);
app.use("/api",profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Lectura Express API Server running on port ${PORT}`);
});