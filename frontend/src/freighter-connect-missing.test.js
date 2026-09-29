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

const { connectFreighterWallet } = await import("./freighter");

describe("connectFreighterWallet when Freighter is missing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects with Freighter is not installed when isConnected resolves isConnected false", async () => {
    isConnectedMock.mockResolvedValueOnce({ isConnected: false });

    await expect(connectFreighterWallet()).rejects.toThrow(
      "Freighter is not installed. Get it from freighter.app, set Testnet, then refresh."
    );
    expect(isConnectedMock).toHaveBeenCalledTimes(1);
    expect(setAllowedMock).not.toHaveBeenCalled();
    expect(getAddressMock).not.toHaveBeenCalled();
  });
});
