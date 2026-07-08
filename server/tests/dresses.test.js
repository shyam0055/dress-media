import request from 'supertest';
import app from '../src/app.js';
import { jest } from '@jest/globals';

describe('Dresses Feed & Interaction Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dresses/feed', () => {
    it('should fetch feed successfully and skip already seen/interacted items', async () => {
      // Mock valid token verification
      global.mockAuth.verifyIdToken.mockResolvedValueOnce({
        uid: 'user123',
        email: 'test@example.com',
        role: 'user',
      });

      // Mock user seen interactions (e.g. they already saw dress 'seen-1')
      const mockInteractions = [
        { data: () => ({ dressId: 'seen-1', action: 'skip' }) }
      ];
      global.mockFirestoreActions.getDocs.mockResolvedValueOnce({
        docs: mockInteractions,
      });

      // Mock available active dresses in Firestore (simple query)
      const mockDresses = [
        {
          id: 'seen-1',
          data: () => ({ title: 'Seen Dress', isActive: true, createdAt: '2026-07-01' })
        },
        {
          id: 'new-1',
          data: () => ({ title: 'New Dress 1', isActive: true, createdAt: '2026-07-02' })
        },
        {
          id: 'new-2',
          data: () => ({ title: 'New Dress 2', isActive: true, createdAt: '2026-07-03' })
        }
      ];
      global.mockFirestoreActions.getDocs.mockResolvedValueOnce({
        docs: mockDresses,
      });

      const res = await request(app)
        .get('/api/dresses/feed')
        .set('Authorization', 'Bearer valid-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      // 'seen-1' must be filtered out, sorted by desc ('new-2' first)
      expect(res.body.dresses.length).toBe(2);
      expect(res.body.dresses[0].id).toBe('new-2');
      expect(res.body.dresses[1].id).toBe('new-1');
    });
  });

  describe('POST /api/dresses/:id/interact', () => {
    it('should return 400 for invalid interaction actions', async () => {
      global.mockAuth.verifyIdToken.mockResolvedValueOnce({
        uid: 'user123',
        email: 'test@example.com',
        role: 'user',
      });

      const res = await request(app)
        .post('/api/dresses/dress-abc/interact')
        .set('Authorization', 'Bearer valid-token')
        .send({ action: 'invalid-action' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid action');
    });

    it('should successfully wishlist a dress', async () => {
      global.mockAuth.verifyIdToken.mockResolvedValueOnce({
        uid: 'user123',
        email: 'test@example.com',
        role: 'user',
      });

      // Mock interaction add
      global.mockFirestoreActions.add.mockResolvedValueOnce({ id: 'int-123' });

      // Mock user doc update
      global.mockFirestoreActions.update.mockResolvedValueOnce({});

      // Mock dress update likeCount lookup
      global.mockFirestoreActions.get.mockResolvedValueOnce({
        exists: true,
        data: () => ({ likeCount: 5 }),
      });
      global.mockFirestoreActions.update.mockResolvedValueOnce({});

      const res = await request(app)
        .post('/api/dresses/dress-abc/interact')
        .set('Authorization', 'Bearer valid-token')
        .send({ action: 'wishlist' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Added to wishlist');
      expect(global.mockFirestoreActions.add).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user123',
          dressId: 'dress-abc',
          action: 'wishlist',
        })
      );
    });
  });
});
