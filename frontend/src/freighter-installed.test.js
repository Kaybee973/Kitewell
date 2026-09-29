import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { isConnectedMock, setAllowedMock, getAddressMock, signTransactionMock } =
  vi.hoisted(() => ({
    isConnectedMock: vi.fn(),
    setAllowedMock: vi.fn(),
    getAddressMock: vi.fn(),
    signTransactionMock: vi.fn(),
  }));

vi.mock("@stellar/freighter-api", () => ({
  isConnected: isConnectedMock,
  setAllowed: setAllowedMock,
  getAddress: getAddressMock,
  signTransaction: signTransactionMock,
}));

vi.mock("@stellar/stellar-sdk", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    rpc: {
      ...actual.rpc,
      Server: vi.fn(function () {
        return {
          simulateTransaction: vi.fn(),
          prepareTransaction: vi.fn(),
          sendTransaction: vi.fn(),
          getTransaction: vi.fn(),
          getAccount: vi.fn(),
        };
      }),
    },
  };
});

const { checkFreighterInstalled } = await import("./freighter");

describe("checkFreighterInstalled", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves true when isConnected resolves isConnected true", async () => {
    isConnectedMock.mockResolvedValueOnce({ isConnected: true });
    const result = await checkFreighterInstalled();
    expect(result).toBe(true);
    expect(isConnectedMock).toHaveBeenCalledTimes(1);
  });

  it("resolves false when isConnected resolves isConnected false", async () => {
    isConnectedMock.mockResolvedValueOnce({ isConnected: false });
    const result = await checkFreighterInstalled();
    expect(result).toBe(false);
    expect(isConnectedMock).toHaveBeenCalledTimes(1);
  });
});
