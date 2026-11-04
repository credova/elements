import { mock, type Mock } from 'bun:test';

export { mock, spyOn } from 'bun:test';

export class NoErrorThrownError extends Error {}

export const getError = async <TError>(call: () => unknown): Promise<TError> => {
  try {
    await call();

    throw new NoErrorThrownError();
  } catch (error: unknown) {
    return error as TError;
  }
};

export type AnyMock = Mock<(...args: any[]) => any>;

export const mockFetch = (): AnyMock => {
  const fetchMock = mock();
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
};
