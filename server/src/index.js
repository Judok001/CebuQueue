import express from 'express';
import cors from 'cors';
import auth from './routes/auth.js';
import services from './routes/services.js';
import users from './routes/users.js';
import patients from './routes/patients.js';
import queue from './routes/queue.js';
import reports from './routes/reports.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', auth);
app.use('/api/services', services);
app.use('/api/users', users);
app.use('/api/patients', patients);
app.use('/api/queue', queue);
app.use('/api/reports', reports);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server. Try again.' });
});

app.listen(process.env.PORT || 4000, () => console.log(`CebuQueue API on port ${process.env.PORT || 4000}`));
