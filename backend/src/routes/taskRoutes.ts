import { Router } from 'express';
import type { TaskController } from '../controllers/taskController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function createTaskRouter(controller: TaskController): Router {
  const router = Router();

  router.get('/', asyncHandler(controller.listTasks.bind(controller)));
  router.get('/:id', asyncHandler(controller.getTask.bind(controller)));
  router.post('/', asyncHandler(controller.createTask.bind(controller)));
  router.patch('/:id', asyncHandler(controller.updateTask.bind(controller)));
  router.delete('/:id', asyncHandler(controller.deleteTask.bind(controller)));

  return router;
}