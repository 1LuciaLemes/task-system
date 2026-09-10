import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { InMemoryTaskRepository } from './repositories/inMemoryTaskRepository.js';
import { TaskPriority, TaskStatus } from './models/task.js';

function setup() {
  const repository = new InMemoryTaskRepository();
  const app = createApp(repository);
  return { repository, app };
}

describe('POST /tasks', () => {
  it('crea una tarea raíz con valores por defecto', async () => {
    const { app } = setup();
    const res = await request(app).post('/tasks').send({ title: 'Task A' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Task A');
    expect(res.body.description).toBeNull();
    expect(res.body.status).toBe(TaskStatus.PENDING);
    expect(res.body.priority).toBe(TaskPriority.MEDIUM);
    expect(res.body.estimate).toBeNull();
    expect(res.body.parentTaskId).toBeNull();
    expect(res.body.position).toBe(0);
  });

  it('responde 400 cuando el título es inválido', async () => {
    const { app } = setup();
    const res = await request(app).post('/tasks').send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
    expect(res.body.message).toBe('El título es obligatorio');
  });

  it('responde 400 cuando la estimación es negativa', async () => {
    const { app } = setup();
    const res = await request(app).post('/tasks').send({ title: 'Task', estimate: -1 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('crea una subtarea con parentTaskId', async () => {
    const { app } = setup();
    const root = await request(app).post('/tasks').send({ title: 'Root' });
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Sub', parentTaskId: root.body.id });

    expect(res.status).toBe(201);
    expect(res.body.parentTaskId).toBe(root.body.id);
    expect(res.body.position).toBe(0);
  });
});

describe('GET /tasks', () => {
  it('devuelve la lista completa de tareas', async () => {
    const { app } = setup();
    await request(app).post('/tasks').send({ title: 'A' });
    const root = await request(app).post('/tasks').send({ title: 'B' });
    await request(app).post('/tasks').send({ title: 'Sub', parentTaskId: root.body.id });

    const res = await request(app).get('/tasks');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body.map((task: { title: string }) => task.title)).toEqual(['A', 'B', 'Sub']);
  });
});

describe('GET /tasks/:id', () => {
  it('devuelve el detalle de una tarea', async () => {
    const { app } = setup();
    const created = await request(app).post('/tasks').send({ title: 'Task A' });

    const res = await request(app).get(`/tasks/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Task A');
  });

  it('responde 404 para una tarea inexistente', async () => {
    const { app } = setup();
    const res = await request(app).get('/tasks/inexistente');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });
});

describe('PATCH /tasks/:id', () => {
  it('actualiza una tarea', async () => {
    const { app } = setup();
    const created = await request(app).post('/tasks').send({ title: 'Task A' });

    const res = await request(app)
      .patch(`/tasks/${created.body.id}`)
      .send({ title: 'Task A actualizada', status: TaskStatus.COMPLETE });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Task A actualizada');
    expect(res.body.status).toBe(TaskStatus.COMPLETE);
  });

  it('permite mover una tarea a otro padre mediante PATCH', async () => {
    const { app } = setup();
    const root = await request(app).post('/tasks').send({ title: 'Root' });
    const sub = await request(app).post('/tasks').send({ title: 'Sub' });

    await request(app)
      .patch(`/tasks/${sub.body.id}`)
      .send({ parentTaskId: root.body.id })
      .expect(200);

    const res = await request(app).get(`/tasks/${sub.body.id}`);
    expect(res.body.parentTaskId).toBe(root.body.id);
  });

  it('responde 404 para una tarea inexistente', async () => {
    const { app } = setup();
    const res = await request(app).patch('/tasks/inexistente').send({ title: 'X' });

    expect(res.status).toBe(404);
  });

  it('responde 400 ante un título inválido', async () => {
    const { app } = setup();
    const created = await request(app).post('/tasks').send({ title: 'Task' });

    const res = await request(app).patch(`/tasks/${created.body.id}`).send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});

describe('DELETE /tasks/:id', () => {
  it('elimina una tarea', async () => {
    const { app } = setup();
    const created = await request(app).post('/tasks').send({ title: 'Task' });

    const res = await request(app).delete(`/tasks/${created.body.id}`);

    expect(res.status).toBe(204);
    const getRes = await request(app).get(`/tasks/${created.body.id}`);
    expect(getRes.status).toBe(404);
  });

  it('elimina en cascada todos los descendientes', async () => {
    const { app } = setup();
    const root = await request(app).post('/tasks').send({ title: 'Root' });
    const sub = await request(app).post('/tasks').send({
      title: 'Sub',
      parentTaskId: root.body.id,
    });
    await request(app).post('/tasks').send({ title: 'Leaf', parentTaskId: sub.body.id });

    const res = await request(app).delete(`/tasks/${root.body.id}`);

    expect(res.status).toBe(204);
    const getSub = await request(app).get(`/tasks/${sub.body.id}`);
    expect(getSub.status).toBe(404);
  });

  it('responde 404 para una tarea inexistente', async () => {
    const { app } = setup();
    const res = await request(app).delete('/tasks/inexistente');

    expect(res.status).toBe(404);
  });
});