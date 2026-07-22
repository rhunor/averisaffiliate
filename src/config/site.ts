export const siteConfig = {
  name: "Averis Academy",
  tagline: "Learn to Earn. Invest to Build Wealth.",
  description:
    "Nigeria's premier wealth-building platform. Learn digital marketing, earn ₦500K–₦1M/month, then invest to build generational wealth.",
  url: "https://app.averisacademy.com",
  signupFee: 35_000,
  renewalFee: 30_000,
  commission: {
    rate: 50,
    newSubscription: 17_500,
    renewal: 15_000,
  },
  forex: {
    price: 50_000,
    commission: 25_000, // 50% of price
    productName: "Forex Income Blueprint",
    slug: "forex-income-blueprint",
  },
  minWithdrawal: 10_000,
  referralCodePrefix: "AVR",
  links: {
    telegram: "https://t.me/averisacademy",
    affiliateCommunity: "https://t.me/averisacademycommunity",
    instagram: "https://www.instagram.com/averisacademy",
    twitter: "https://x.com/averisacademy",
    whatsapp: "+2348085300040",
    support: "hello@averisacademy.com",
  },
} as const;
