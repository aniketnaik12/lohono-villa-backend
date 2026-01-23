import app from './app';
import { AppDataSource } from './data-source';

AppDataSource.initialize()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log('Server running on port 3000');
    });
  })
  .catch((err) => {
    console.error('Database connection failed', err);
  });
