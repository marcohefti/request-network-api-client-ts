export default {
  title: '@request-suite/sdk',
  description: 'TypeScript SDK for Request Network',
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/quick-start' },
      { text: 'Domains', items: [
        { text: 'Requests', link: '/guide/domains/requests' },
        { text: 'Payouts', link: '/guide/domains/payouts' },
        { text: 'Payer', link: '/guide/domains/payer' },
        { text: 'Payments & Pay', link: '/guide/domains/payments' },
        { text: 'Currencies', link: '/guide/domains/currencies' },
        { text: 'Client IDs', link: '/guide/domains/client-ids' },
      ]},
      { text: 'HTTP', link: '/guide/http-client' },
      { text: 'Errors & Retries', link: '/guide/error-retry' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'HTTP Client', link: '/guide/http-client' },
            { text: 'Errors & Retries', link: '/guide/error-retry' },
          ],
        },
        {
          text: 'Domains',
          items: [
            { text: 'Requests', link: '/guide/domains/requests' },
            { text: 'Payouts', link: '/guide/domains/payouts' },
            { text: 'Payer', link: '/guide/domains/payer' },
            { text: 'Payments & Pay', link: '/guide/domains/payments' },
            { text: 'Currencies', link: '/guide/domains/currencies' },
            { text: 'Client IDs', link: '/guide/domains/client-ids' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/request-suite/request-suite' },
    ],
  },
};
