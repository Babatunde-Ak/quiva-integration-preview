import { FiArrowDown, FiArrowUp, FiInstagram } from "react-icons/fi";
import { RiTelegram2Fill, RiTwitterXFill, RiYoutubeFill } from "react-icons/ri";
import { soloLevel } from "../../../public/dev_images";
import { FaBook, FaCog, FaHome, FaMoneyBill } from "react-icons/fa";
import { FcMoneyTransfer } from "react-icons/fc";
import { FaArrowTrendUp } from "react-icons/fa6";
import { BiAt, BiEnvelope, BiPhone, BiSolidUser } from "react-icons/bi";

export type NavLink = {
	label: string;
	href: string;
};

export const MY_COMICS_DATA = [
	{
		id: 1,
		imageSrc: soloLevel,
		subtitle: "Solo Level",
		title: "Chu-Geng",
		status: "published",
		views: 1245,
		likes: 89,
		lastUpdated: "2 days ago",
		category: "Recent",
	},
	{
		id: 2,
		imageSrc: soloLevel,
		subtitle: "Demon Slayer",
		title: "Kimetsu no Yaiba",
		status: "published",
		views: 2897,
		likes: 156,
		lastUpdated: "1 week ago",
		category: "Popular",
	},
	{
		id: 3,
		imageSrc: soloLevel,
		subtitle: "One Piece",
		title: "Wano Kingdom Arc",
		status: "draft",
		views: 0,
		likes: 0,
		lastUpdated: "Just now",
		category: "Free",
	},
	{
		id: 4,
		imageSrc: soloLevel,
		subtitle: "Attack on Titan",
		title: "Final Season",
		status: "archived",
		views: 3452,
		likes: 287,
		lastUpdated: "1 month ago",
		category: "Paid",
	},
	{
		id: 5,
		imageSrc: soloLevel,
		subtitle: "My Hero Academia",
		title: "Heroes Rising",
		status: "published",
		views: 1876,
		likes: 102,
		lastUpdated: "3 days ago",
		category: "Popular",
	},
	{
		id: 6,
		imageSrc: soloLevel,
		subtitle: "Jujutsu Kaisen",
		title: "Shibuya Incident",
		status: "published",
		views: 2310,
		likes: 198,
		lastUpdated: "5 days ago",
		category: "Free",
	},
	{
		id: 7,
		imageSrc: soloLevel,
		subtitle: "Tokyo Revengers",
		title: "Bloody Halloween",
		status: "draft",
		views: 0,
		likes: 0,
		lastUpdated: "Yesterday",
		category: "Paid",
	},
];

export const NAV_LINKS: NavLink[] = [
	{ href: "/products", label: "Our Products" },
	// { href: "/creators", label: "Creators" },
	{ href: "/roadmap", label: "Whitepaper" },
	// { href: "/comic-pad", label: "Comic Pad" },
	// { href: "/faq", label: "FAQ" },
	{ href: "/roadmap", label: "Roadmap" },
	{ href: "/community", label: "Community" },
] as const;

export const SOCIAL_MEDIA_LINKS = [
	{
		id: "instagram",
		icon: <FiInstagram className='text-2xl hover:text-red-100' />,
		url: "https://www.instagram.com/quivacomics",
	},
	{
		id: "twitter",
		icon: <RiTwitterXFill className='text-2xl hover:text-black-100' />,
		url: "https://x.com/quivacomics",
	},
	{
		id: "youtube",
		icon: <RiYoutubeFill className='text-2xl hover:text-red-100' />,
		url: "https://youtube.com/@quivacomics?si=yXh4OpxcOm8tUp6g",
	},
	{
		id: "telegram",
		icon: <RiTelegram2Fill className='text-2xl hover:text-red-100' />,
		url: "https://t.me/Quiva_bot/quivaGame",
	},
];

export const faqs = [
	{
		question: "What Is Quiva?",
		answer:
			"Quiva is a comic platform for creators and fans to engage through web3 publishing, games, and immersive stories.",
	},
	{
		question: "How Is Quiva Different From Other Comic Platforms?",
		answer:
			"Quiva integrates blockchain, allowing you to mint, own, and monetize your comics securely.",
	},
	{
		question: "Is Quiva Only For Crypto Users?",
		answer:
			"No. Anyone can read and enjoy comics on Quiva. Crypto is optional for unlocking deeper features.",
	},
	{
		question: "How Can I Start Reading Comics On Quiva?",
		answer:
			"Simply create an account and explore the library. You can start reading free content instantly.",
	},
	{
		question: "What Kind Of Games Are Available On Quiva?",
		answer:
			"Quiva hosts story-based games, minigames, and interactive fiction tied to comic universes.",
	},
	{
		question: "How Do I Publish My Comic On Quiva?",
		answer:
			"Sign in as a creator, upload your content, and follow the minting process to go live.",
	},
	{
		question: "Can I Read Comics For Free?",
		answer:
			"Yes, Quiva offers a library of free-to-read comics alongside premium content.",
	},
	{
		question: "Can I Publish Fan Fiction Or Meme-Based Comics?",
		answer:
			"Yes, as long as it complies with Quiva’s content policies and IP rules.",
	},
];

export const phoneNum = "+1 (323) 275-1718";
export const emailAddress = "hello@logoipsum.com";

export const mobileHeaderLinkUrl = [
	{
		url: "/comic-pad",
		link: "Comic Pad",
		icon: (className: string) => (
			<FaHome className={`${className} !text-2xl`} />
		),
	},
	{
		url: "/comic-pad/my-comics",
		link: "My Comics",
		icon: (className: string) => <FaBook className={`${className} !text-xl`} />,
	},
	{
		url: "",
		link: "",
		icon: (className: string) => (
			<FaMoneyBill className={`${className} text-lg`} />
		),
	},
	{
		url: "/comic-pad/earnings",
		link: "Earnings",
		icon: (className: string) => (
			<FcMoneyTransfer className={`${className} !text-3xl`} />
		),
	},
	{
		url: "/comic-pad/settings",
		link: "Settings",
		icon: (className: string) => <FaCog className={`${className} !text-2xl`} />,
	},
];

export const OVERVIEW_CARDS = [
	{
		id: "readers",
		title: "Readers",
		value: "0",
		change: "0",
		changeColor: "text-red-500",
		changeBg: "bg-red-900/30",
		Icon: FiArrowUp,
		Icon2: FaBook,
	},
	{
		id: "income",
		title: "Income",
		value: "0",
		change: "0",
		changeColor: "text-amber-300",
		changeBg: "bg-amber-900/30",
		Icon: FiArrowDown,
		Icon2: FaArrowTrendUp,
	},
];

export const profileInfo = [
	{
		icon: BiSolidUser,
		text: "Male",
		key: "gender",
	},
	{
		icon: BiEnvelope,
		text: "example@marytesting.com",
		key: "email",
	},
	{
		icon: BiPhone,
		text: "33757005467",
		key: "phone",
	},
	{
		icon: BiAt,
		text: "@maryalex",
		key: "username",
	},
];

export interface BookType {
	id: number;
	image: string;
	title: string;
	author: string;
	price: number;
	rating: number;
	isFree: boolean;
	category: "all" | "paid" | "free";
}

export const BOOK_TABS = [
	{
		id: "all",
		label: "All Books",
		count: 24,
	},
	{
		id: "paid",
		label: "Paid Books",
		count: 18,
	},
	{
		id: "free",
		label: "Free Books",
		count: 6,
	},
];

export const SAMPLE_BOOKS: BookType[] = [
	{
		id: 1,
		image: "/dev_images/avatar-2.png",
		title: "The Last Odyssey",
		author: "Sarah Chen",
		price: 49.99,
		rating: 4.8,
		isFree: false,
		category: "paid",
	},
	{
		id: 2,
		image: "/dev_images/avatar-2.png",
		title: "Echoes of Time",
		author: "Marcus Johnson",
		price: 0,
		rating: 4.5,
		isFree: true,
		category: "free",
	},
	{
		id: 3,
		image: "/dev_images/avatar-2.png",
		title: "Neon Dreams",
		author: "Alex Rivera",
		price: 39.99,
		rating: 4.9,
		isFree: false,
		category: "paid",
	},
	{
		id: 4,
		image: "/dev_images/avatar-2.png",
		title: "Silent Whispers",
		author: "Emma Zhang",
		price: 0,
		rating: 4.3,
		isFree: true,
		category: "free",
	},
	{
		id: 5,
		image: "/dev_images/avatar-2.png",
		title: "Quantum Legacy",
		author: "David Kim",
		price: 54.99,
		rating: 4.7,
		isFree: false,
		category: "paid",
	},
];
