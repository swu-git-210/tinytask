import request from 'supertest';
import app from '../src/server';
import { resetTasks } from '../src/taskStore';

// Define the shape of a task for type-checking in tests
interface Task {
  id: number;
  title: string;
  done: boolean;
}

describe('Task Board API', () => {
  // Reset tasks before each test to ensure a clean state
  beforeEach(() => {
    resetTasks();
  });

  // 1. Test for /health endpoint
  describe('GET /health', () => {
    it('should return 200 OK and status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /tasks', () => {
    // 2. THIS IS THE INTENTIONALLY FAILING TEST FOR THE LAB
    it('should return 400 Bad Request for whitespace-only titles', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: '   ' }); // Sending only spaces
      
      // The bug in taskStore.ts will cause this check to fail.
      // The server will incorrectly return 201 Created instead of 400.
      expect(res.status).toBe(400);
    });

    // 3. Test for valid title
    it('should return 201 Created for a valid title', async () => {
      const newTaskTitle = 'A valid new task';
      const res = await request(app)
        .post('/tasks')
        .send({ title: newTaskTitle });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(newTaskTitle);
      expect(res.body.done).toBe(false);
    });
  });

  // 4. Test for toggling a task's 'done' state
  describe('PATCH /tasks/:id/toggle', () => {
    it('should toggle the done state of a task and return the updated task', async () => {
      const taskId = 1; // Assumes a task with ID 1 exists from resetTasks()
      
      // First, get the initial state
      let res = await request(app).get('/tasks');
      const initialTask = res.body.find((t: Task) => t.id === taskId);
      const initialDoneState = initialTask.done;

      // Now, toggle it
      res = await request(app).patch(`/tasks/${taskId}/toggle`);
      
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(taskId);
      expect(res.body.done).toBe(!initialDoneState);

      // Optional: Verify the state is persisted by fetching all tasks again
      res = await request(app).get('/tasks');
      const finalTask = res.body.find((t: Task) => t.id === taskId);
      expect(finalTask.done).toBe(!initialDoneState);
    });

    it('should return 404 Not Found for a non-existent task ID', async () => {
      const nonExistentId = 999;
      const res = await request(app).patch(`/tasks/${nonExistentId}/toggle`);
      expect(res.status).toBe(404);
    });
  });

  // 5. Test for deleting a task
  describe('DELETE /tasks/:id', () => {
    it('should return 204 No Content and remove the task', async () => {
      const taskId = 2; // Task with ID 2: "Fix the Failing Test"

      // Verify the task exists before deleting
      let res = await request(app).get('/tasks');
      expect(res.body.some((t: Task) => t.id === taskId)).toBe(true);

      // Delete the task
      res = await request(app).delete(`/tasks/${taskId}`);
      expect(res.status).toBe(204);

      // Verify the task is gone
      res = await request(app).get('/tasks');
      expect(res.body.some((t: Task) => t.id === taskId)).toBe(false);
    });

    it('should return 404 Not Found for a non-existent task ID', async () => {
      const nonExistentId = 999;
      const res = await request(app).delete(`/tasks/${nonExistentId}`);
      expect(res.status).toBe(404);
    });
  });
});
