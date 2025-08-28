// Test setup file for Jest
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  // Add any global test utilities here
  createMockRequest: (overrides = {}) => ({
    method: 'GET',
    path: '/test',
    originalUrl: '/test',
    ...overrides,
  }),
  
  createMockResponse: () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },
  
  createMockNext: () => jest.fn(),
};

// Type declaration for global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockRequest: (overrides?: any) => any;
        createMockResponse: () => any;
        createMockNext: () => jest.Mock;
      };
    }
  }
}
