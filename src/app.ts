import express from 'express';
import cors from 'cors';
import villaRoutes from './routes/villa.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/v1/villas', villaRoutes);

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

export default app;
