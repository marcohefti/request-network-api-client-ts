import { http, HttpResponse } from "msw";

import { TEST_BASE_URL } from "../../utils/test-env";

export const currenciesHandlers = [
  http.get(`${TEST_BASE_URL}/v2/currencies`, () =>
    HttpResponse.json(
      [
        {
          id: "USDC-sepolia",
          name: "USD Coin",
          symbol: "USDC",
          decimals: 6,
          network: "sepolia",
        },
        {
          id: "DAI-sepolia",
          name: "Dai",
          symbol: "DAI",
          decimals: 18,
          network: "sepolia",
        },
      ],
      { status: 200 },
    ),
  ),
  http.get(`${TEST_BASE_URL}/v2/currencies/:currencyId/conversion-routes`, ({ params }) => {
    const { currencyId } = params as { currencyId: string };
    return HttpResponse.json(
      {
        currencyId,
        conversionRoutes: [
          {
            id: `${currencyId}-ETH`,
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
            network: "sepolia",
          },
        ],
      },
      { status: 200 },
    );
  }),
  http.get(`${TEST_BASE_URL}/v1/currencies`, ({ request }) => {
    const url = new URL(request.url);
    const firstOnly = url.searchParams.get("firstOnly");

    const baseCurrency = {
      id: "USDC-mainnet",
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      network: "mainnet",
      type: "ERC20",
      hash: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      chainId: 1,
    };

    if (firstOnly === "true") {
      return HttpResponse.json(baseCurrency, { status: 200 });
    }

    return HttpResponse.json(
      [
        baseCurrency,
        {
          id: "DAI-mainnet",
          name: "Dai",
          symbol: "DAI",
          decimals: 18,
          network: "mainnet",
        },
      ],
      { status: 200 },
    );
  }),
  http.get(`${TEST_BASE_URL}/v1/currencies/:currencyId/conversion-routes`, ({ params }) => {
    const { currencyId } = params as { currencyId: string };
    return HttpResponse.json(
      {
        currencyId,
        conversionRoutes: [
          {
            id: `${currencyId}-DAI`,
            name: "Dai",
            symbol: "DAI",
            decimals: 18,
            network: "mainnet",
          },
        ],
      },
      { status: 200 },
    );
  }),
];
