import { jest } from '@jest/globals';

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = 5001;
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 = 'eyJ0ZXN0IjoidHJ1ZSJ9'; // Dummy valid base64

// Create standard mock Firestore implementation
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockUpdate = jest.fn();
const mockAdd = jest.fn();
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockGetDocs = jest.fn();

const mockFirestore = {
  collection: jest.fn().mockImplementation(() => ({
    doc: jest.fn().mockImplementation(() => ({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
    })),
    where: mockWhere.mockImplementation(() => ({
      get: mockGetDocs,
      limit: mockLimit.mockImplementation(() => ({
        get: mockGetDocs,
      })),
    })),
    add: mockAdd,
  })),
};

const mockAuth = {
  verifyIdToken: jest.fn(),
  createUser: jest.fn(),
  getUser: jest.fn(),
};

// Mock modules
jest.unstable_mockModule('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn().mockReturnValue([]),
  cert: jest.fn(),
}));

jest.unstable_mockModule('firebase-admin/firestore', () => ({
  getFirestore: jest.fn().mockReturnValue(mockFirestore),
  FieldValue: {
    arrayUnion: jest.fn((val) => `arrayUnion(${val})`),
    arrayRemove: jest.fn((val) => `arrayRemove(${val})`),
  },
}));

jest.unstable_mockModule('firebase-admin/auth', () => ({
  getAuth: jest.fn().mockReturnValue(mockAuth),
}));

// Export mock targets globally for test files to configure behavior
global.mockFirestore = mockFirestore;
global.mockAuth = mockAuth;
global.mockFirestoreActions = {
  get: mockGet,
  set: mockSet,
  update: mockUpdate,
  add: mockAdd,
  where: mockWhere,
  getDocs: mockGetDocs,
};
