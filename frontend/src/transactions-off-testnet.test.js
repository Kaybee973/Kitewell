import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./api", () => ({
  fetchAccountViaApi: vi.fn(),
  fetchPaymentsViaApi: vi.fn(),
}));

const { loadAccountMock, paymentsCallMock } = vi.hoisted(() => ({
  loadAccountMock: vi.fn(),
  paymentsCallMock: vi.fn(),
}));

vi.mock("@stellar/stellar-sdk", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Horizon: {
      ...actual.Horizon,
      Server: vi.fn(function () {
        return {
          loadAccount: loadAccountMock,
          payments: () => ({
            forAccount: () => ({
              limit: () => ({
                order: () => ({ call: paymentsCallMock }),
              }),
            }),
          }),
        };
      }),
    },
  };
});

const { fetchPaymentsViaApi } = await import("./api");
const { getTransactions } = await import("./stellar");
const { setActiveNetwork } = await import("./network");

const MOCK_HORIZON_PAYMENTS = {
  records: [
    {
      id: "p1",
      type: "payment",
      from: "GALICE",
      to: "GBOB",
      amount: "10.0000000",
      asset_type: "native",
      asset_code: "XLM",
      transaction_hash: "hash123",
      created_at: "2026-01-01T00:00:00Z",
    },
  ],
};

describe("transactions off Testnet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setActiveNetwork("TESTNET");
    vi.restoreAllMocks();
  });

  it("reads payment history from Horizon directly on Futurenet without calling backend API", async () => {
    setActiveNetwork("FUTURENET");
    paymentsCallMock.mockResolvedValueOnce(MOCK_HORIZON_PAYMENTS);

    const result = await getTransactions("GBOB");

    expect(fetchPaymentsViaApi).not.toHaveBeenCalled();
    expect(paymentsCallMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        id: "p1",
        from: "GALICE",
        to: "GBOB",
        amount: "10.0000000",
        asset_type: "native",
        asset_code: "XLM",
        transaction_hash: "hash123",
        created_at: "2026-01-01T00:00:00Z",
      },
    ]);
  });
});
