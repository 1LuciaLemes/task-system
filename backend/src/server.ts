import { createApp } from './app.js';
import { createPool } from './db/pool.js';
import { InMemoryTaskRepository } from './repositories/inMemoryTaskRepository.js';
import { PgTaskRepository } from './repositories/pgTaskRepository.js';

const PORT = Number(process.env.PORT ?? 3000);

const repository = process.env.DATABASE_URL
  ? new PgTaskRepository(createPool())
  : new InMemoryTaskRepository();

createApp(repository).listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});