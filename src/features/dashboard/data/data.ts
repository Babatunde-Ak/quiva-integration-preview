export const USER_STATS = {
  walletAddress: '0x1234...abcd',
  currentRank: '#1,234',
  role: 'Creator',
  totalPoints: 405,
}

export const DAILY_MISSIONS = [
  {
    id: 'mint-comic',
    title: 'Mint Comic',
    xp: 100,
    description: 'Mint successful to ensure validation',
    progress: 0,
    progressMax: 10,
    buttonLabel: 'Go to Marketplace',
    href: '/marketplace',
    image: '/dashboard-coin.png',
  },
  {
    id: 'read-comic',
    title: 'Read Comic',
    xp: 100,
    description: 'Reading only counts when the final page is reached.',
    progress: 0,
    progressMax: 5,
    buttonLabel: 'Start Reading',
    href: '/marketplace/library',
    image: '/book-colored.png',
  },
]

export const STREAK_DAYS = [
  { day: 5, label: 'Wed', done: true },
  { day: 6, label: 'Thur', done: true },
  { day: 7, label: 'Fri', done: true },
  { day: 8, label: 'Sat', done: true },
  { day: 9, label: 'Sun', done: false },
  { day: 10, label: 'Mon', done: false },
  { day: 11, label: 'Tue', done: false },
  { day: 12, label: 'Wed', done: false },
  { day: 13, label: 'Thur', done: false },
  { day: 14, label: 'Fri', done: false },
]

export const MILESTONES = [
  {
    id: 'first-issue',
    streakLabel: '28 day streak',
    issueNumber: 'ISSUE I',
    title: 'The first issue',
    xp: 50,
    description: 'Every legend has a beginning. With your first step, you enter the world of endless stories, where every choice sparks a new adventure.',
    claimable: true,
  },
  {
    id: 'momentum-issue',
    streakLabel: '56 day streak',
    issueNumber: 'ISSUE II',
    title: 'Momentum Issue',
    xp: 75,
    description: 'Consistency shapes heroes. Your streak proves determination, and the universe starts to recognize your presence.',
    claimable: true,
  },
  {
    id: 'collector-issue',
    streakLabel: '84 day streak',
    issueNumber: 'ISSUE III',
    title: "Collector's Issue",
    xp: 100,
    description: 'Ownership transforms participation into identity. You are no longer just a reader, you are a guardian of stories.',
    claimable: false,
  },
  {
    id: 'legacy-issue',
    streakLabel: '112 day streak',
    issueNumber: 'ISSUE IV',
    title: 'Legacy Issue',
    xp: 150,
    description: 'Legends never fade. Your unwavering commitment cements your place as a founding force in the Quiva cosmos.',
    claimable: false,
  },
]

export const BONUS_TASKS = [
  { id: 'twitter', label: 'Follow on Twitter', xp: 10, done: false },
  { id: 'telegram', label: 'Join Telegram', xp: 10, done: false },
  { id: 'retweet', label: 'Retweet Pinned Post', xp: 10, done: false },
  { id: 'weekly-activity', label: 'Weekly Activity', xp: 20, done: false },
  { id: 'post-twitter', label: 'Post on Twitter with @Quiva', xp: 50, done: false },
  { id: 'ama', label: 'Attend AMA / Space', xp: 120, done: false },
  { id: 'complete-profile', label: 'Complete Profile', xp: 20, done: false },
]

export const REFERRER_HISTORY = [
  { id: '1', profile: 'User A', points: 1.5, role: 'Creator' },
  { id: '2', profile: 'User B', points: 1.5, role: 'Reader' },
]

export const USER_ROLE = 'Creator Level 2'
export const ROLE_XP_TO_NEXT = 700
export const ROLE_XP_CURRENT = 300
export const ROLE_XP_TOTAL = 1000

export const LEADERBOARD = [
  { rank: 2, name: 'Mary', xp: 60, role: 'Creator' },
  { rank: 1, name: 'Jacob', xp: 80, role: 'Creator' },
  { rank: 3, name: 'Jane', xp: 50, role: 'Reader' },
]

export const CURRENT_DAY_STREAK = 4
export const TOTAL_STREAK_DAYS = 28
export const DAILY_XP_EARNED = 100
export const DAILY_XP_GOAL = 200
