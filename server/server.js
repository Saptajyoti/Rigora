import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set.');
  }
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Rigora API listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start Rigora API:', error);
  process.exit(1);
});
