declare module 'vitest' {
  export const describe: (name: string, fn: () => void) => void;
  export const it: (name: string, fn: () => void | Promise<void>) => void;
  export const expect: any;
  export const vi: {
    fn: <T = any>() => jest.Mock<T>;
    mockReset: () => void;
    resetAllMocks: () => void;
    restoreAllMocks: () => void;
    clearAllMocks: () => void;
    mock: (path: string, factory?: () => any) => void;
    MockedFunction: any;
  };
  export const beforeEach: (fn: () => void | Promise<void>) => void;
  export const afterEach: (fn: () => void | Promise<void>) => void;
  export const beforeAll: (fn: () => void | Promise<void>) => void;
  export const afterAll: (fn: () => void | Promise<void>) => void;

  namespace jest {
    type Mock<T = any> = {
      mockResolvedValue: (value: any) => void;
      mockRejectedValue: (value: any) => void;
      mockRejectedValueOnce: (value: any) => void;
      mockReturnValue: (value: any) => void;
      mockImplementation: (fn: (...args: any[]) => any) => void;
    };
  }
} 