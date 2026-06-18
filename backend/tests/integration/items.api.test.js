import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../server.js';

describe('Items API Integration', () => {
  it('GET /api/items should return 401 Unauthorized if no token provided', async () => {
    // When hitting a protected endpoint without auth headers, we expect a 401
    const res = await request(app).get('/api/items');
    expect(res.statusCode).toEqual(401);
  });
});
