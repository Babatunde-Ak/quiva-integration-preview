export interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
}

export const categories: Category[] = [
  {
    id: "getting-started",
    title: "Getting Started with Quiva",
    description: "If this is your first time visiting Quiva, get started here.",
    image: "https://cdn.marvel.com/content/1x/asm2025001_dimeo.jpg",
  },
  {
    id: "creator",
    title: "Be a Creator with Quiva",
    description: "Learn how to put your art out there for users to read",
    image: "/dev_images/hinata-picture.png",
  },
  {
    id: "account",
    title: "Account Management",
    description: "Learn how to create an account and set up your wallet",
    image: "/dev_images/kakashi.png",
  },
  {
    id: "buying",
    title: "Buying Comics on Quiva",
    description: "Learn how to purchase your first comic on Quiva",
    image: "/dev_images/demon-slayer.png",
  },
  {
    id: "selling",
    title: "Selling Comics on Quiva",
    description: "Learn how to list your comic for sale on Quiva marketplace",
    image: "/dev_images/solo-level.png",
  },
  {
    id: "faq",
    title: "FAQ on Quiva",
    description: "Learn answers to frequently asked questions on Quiva",
    image: "/dev_images/goofy-friend.png",
  },
];

export const articles: Article[] = [
  {
    id: "1",
    title: "Welcome to Quiva",
    content:
      "Welcome! Quiva is a decentralized marketplace for digital comics. Here you can buy, sell, and trade unique comic issues secured by blockchain technology. We aim to empower creators and give true ownership to readers.",
  },
  {
    id: "2",
    title: "Create your account with a wallet address",
    content:
      'To create an account, simply click the "Connect Wallet" button in the top right corner. We support MetaMask, Phantom, and WalletConnect. Once connected, your account is automatically created—no email required.',
  },
  {
    id: "3",
    title: "Get to know your wallet",
    content:
      "Your wallet is your identity on Quiva. It holds your funds (ETH/SOL) and stores your comic collection. Always keep your seed phrase safe and never share it with anyone, not even Quiva support.",
  },
  {
    id: "4",
    title: "Purchase your first Comic",
    content:
      'Navigate to the Marketplace tab. You can filter by genre, popularity, or new releases. Click on a comic cover, review the price, and click "Buy Now." Approve the transaction in your wallet to complete the purchase.',
  },
  {
    id: "5",
    title: "Review your Marketplace page",
    content:
      'Your Marketplace page shows all your listed items. You can edit prices, delist items, or view offer history from your Profile dashboard under the "My Listings" tab.',
  },
];
