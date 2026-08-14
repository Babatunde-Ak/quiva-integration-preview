// constants/seo.ts
interface SEOConfig {
	title: string;
	description: string;
	url: string;
	keywords: string[];
	ogImage?: string;
	ogType?: string;
	twitterCard?: string;
}

interface SEODatabase {
	[key: string]: SEOConfig;
}

// Core website information
export const SITE = {
	name: "Quiva Website",
	url: "", // Always use https
	defaultOGImage: "", // Relative path to default OG image
	twitterHandle: "", // Optional
};

// Common descriptions reused across pages
const DESCRIPTIONS = {
	default: ``,
	home: ``,
};

// Keyword clusters for different pages
const KEYWORDS = {
	primary: ["", "publications", "articles", "inspiration"],
	articles: ["reading", "content", "blog", "writing"],
	about: ["about us", "mission", "team", "story"],
};

export const SEO_CONFIG: SEODatabase = {
	default: {
		title: SITE.name,
		description: DESCRIPTIONS.default,
		url: SITE.url,
		keywords: [...KEYWORDS.primary],
		ogImage: "",
		ogType: "website",
		twitterCard: "summary_large_image",
	},

	home: {
		title: `${SITE.name} | Home`,
		description: DESCRIPTIONS.home,
		url: `${SITE.url}/`,
		keywords: [...KEYWORDS.primary, ...KEYWORDS.articles],
		ogImage: "",
	},
};

// Helper function to generate page-specific metadata
export const generatePageMetadata = (
	page: string,
	additional?: Partial<SEOConfig>,
): SEOConfig => {
	const baseConfig = SEO_CONFIG[page] || SEO_CONFIG.default;
	return {
		...baseConfig,
		...additional,
		title: additional?.title
			? `${additional.title} | ${SITE.name}`
			: baseConfig.title,
	};
};
