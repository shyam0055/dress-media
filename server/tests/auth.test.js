import request from 'supertest';
import app from '../src/app.js';
import { jest } from '@jest/globals';

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/verify', () => {
    it('should return 401 if Authorization header is missing', async () => {
      const res = await request(app).post('/api/auth/verify');
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No token provided');
    });

    it('should sync existing user and return 200', async () => {
      // Mock valid token verification
      global.mockAuth.verifyIdToken.mockResolvedValueOnce({
        uid: 'user123',
        email: 'test@example.com',
        role: 'user',
      });

      // Mock that user document already exists
      const mockUserData = {
        uid: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
      };
      global.mockFirestoreActions.get.mockResolvedValueOnce({
        exists: true,
        data: () => mockUserData,
      });

      const res = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toEqual(mockUserData);
    });

    it('should create new user document if not exists and return 200', async () => {
      // Mock valid token verification
      global.mockAuth.verifyIdToken.mockResolvedValueOnce({
        uid: 'newuser123',
        email: 'new@example.com',
        role: 'user',
      });

      // Mock user doc does not exist on first check
      global.mockFirestoreActions.get.mockResolvedValueOnce({
        exists: false,
      });

      // Mock getUser details from Firebase Admin Auth
      global.mockAuth.getUser.mockResolvedValueOnce({
        uid: 'newuser123',
        email: 'new@example.com',
        displayName: 'newuser',
        photoURL: 'avatar-url',
      });

      // Mock set() to create user
      global.mockFirestoreActions.set.mockResolvedValueOnce({});

      const res = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.uid).toBe('newuser123');
      expect(res.body.user.username).toBe('newuser');
      expect(global.mockFirestoreActions.set).toHaveBeenCalled();
    });
  });
});
