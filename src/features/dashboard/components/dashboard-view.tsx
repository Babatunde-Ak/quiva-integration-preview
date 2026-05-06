'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Trophy, Copy, Check, Loader2, Zap, Flame } from 'lucide-react'
import { MILESTONES } from '../data/data'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MILESTONE_CYCLE_DAYS = 28
const MILESTONE_THRESHOLDS = [28, 56, 84, 112]

import StatBadge from './stat-badge'
import MissionCard from './mission-card'
import DayStreakBubble from './day-streak-bubble'
import MilestoneCard from './milestone-card'
import BonusTaskRow from './bonus-task-row'
import LeaderboardPodium from './leaderboard-podium'
import ReferrerHistory from './referrer-history'
import ClaimSuccessModal from './claim-success-modal'
import SocialTaskModal from './social-task-modal'
import TaskTimerModal from './task-timer-modal'
import ToggleSwitch from '@/components/switch/Switch'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { useDisclosure } from '@heroui/react'
import {
  getReferralCode,
  getReferralHistory,
  getActivityFeed,
  checkIn,
  getCheckinStreak,
  getUserTasks,
  claimUserTask,
  getLeaderboard,
} from '@/redux/slices/dashboardSlice'

const ACTIVITY_LABELS: Record<string, string> = {
  CHECKIN: 'Daily Check-in',
  REFERRAL_INVITE: 'Referred a Friend',
  REFERRAL_JOIN: 'Joined via Referral',
  TASK_CLAIM: 'Task Completed',
  ONCHAIN_TX: 'On-chain Transaction',
  XP_AWARD: 'XP Awarded',
}

const DAILY_XP_GOAL = 200


function truncateAddress(addr?: string | null) {
  if (!addr) return '—'
  return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr
}

function computeLevel(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1
  const currentLevelXp = (level - 1) ** 2 * 100
  const nextLevelXp = level ** 2 * 100
  return {
    level,
    xpInLevel: xp - currentLevelXp,
    xpNeededInLevel: nextLevelXp - currentLevelXp,
    xpToNext: nextLevelXp - xp,
  }
}

export default function DashboardView() {
  const dispatch = useAppDispatch()

  // ── Auth / user data ────────────────────────────────────────────────────────
  const user = useAppSelector((s) => s.auth?.user?.data)
  const walletAddress = useAppSelector(
    (s) => s.auth?.user?.data?.walletAddress ?? s.wallet?.walletAddress ?? null
  )

  // ── Dashboard state ─────────────────────────────────────────────────────────
  const referralCode = useAppSelector((s) => s.dashboard.referralCode.data)
  const referralCodeLoading = useAppSelector((s) => s.dashboard.referralCode.isLoading)
  const referralHistory = useAppSelector((s) => s.dashboard.referralHistory)
  const activityFeed = useAppSelector((s) => s.dashboard.activityFeed)
  const checkin = useAppSelector((s) => s.dashboard.checkin)
  const userTasks = useAppSelector((s) => s.dashboard.userTasks)
  const claimTask = useAppSelector((s) => s.dashboard.claimTask)
  const leaderboard = useAppSelector((s) => s.dashboard.leaderboard)

  const [isPro, setIsPro] = useState(false)
  const [copied, setCopied] = useState(false)
  const [claimSuccessXp, setClaimSuccessXp] = useState<number | null>(null)
  const [checkinResult, setCheckinResult] = useState<{
    xpAwarded: number
    isWeeklyMilestone: boolean
  } | null>(null)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const {
    isOpen: isCheckinModalOpen,
    onOpen: openCheckinModal,
    onOpenChange: onCheckinModalChange,
    onClose: closeCheckinModal,
  } = useDisclosure()

  const {
    isOpen: isClaimModalOpen,
    onOpen: openClaimModal,
    onOpenChange: onClaimModalChange,
    onClose: closeClaimModal,
  } = useDisclosure()

  const {
    isOpen: isTaskModalOpen,
    onOpen: openTaskModal,
    onOpenChange: onTaskModalChange,
    onClose: closeTaskModal,
  } = useDisclosure()

  const {
    isOpen: isTimerModalOpen,
    onOpen: openTimerModal,
    onOpenChange: onTimerModalChange,
    onClose: closeTimerModal,
  } = useDisclosure()

  useEffect(() => {
    dispatch(getReferralCode())
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch(getReferralHistory({ page: 1, limit: 5 } as any))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch(getActivityFeed({ limit: 20 } as any))
    dispatch(getCheckinStreak())
    dispatch(getUserTasks())
    dispatch(getLeaderboard())
  }, [dispatch])

  // ── Derived user values ──────────────────────────────────────────────────────
  const xp = user?.xp ?? 0
  const { level, xpInLevel, xpNeededInLevel, xpToNext } = useMemo(() => computeLevel(xp), [xp])
  const primaryRole = Array.isArray(user?.role)
    ? (user.role.includes('creator') ? 'Creator' : 'Reader')
    : (user?.role ?? 'Reader')
  const roleLabel = `${primaryRole} Level ${level}`

  // Dates with a CHECKIN event — used to mark streak bubbles
  const checkinDates = useMemo(() => {
    const dates = new Set<string>()
    ;(activityFeed.data as any[])
      .filter((item) => item.type === 'CHECKIN')
      .forEach((item) => dates.add(new Date(item.createdAt).toDateString()))
    return dates
  }, [activityFeed.data])

  // Last 10 calendar days ending today
  const streakDays = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 10 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (9 - i))
      return {
        day: d.getDate(),
        label: DAY_LABELS[d.getDay()],
        done: checkinDates.has(d.toDateString()),
      }
    })
  }, [checkinDates])

  const dailyXpEarned = useMemo(() => {
    const today = new Date().toDateString()
    return (activityFeed.data as any[])
      .filter((item) => new Date(item.createdAt).toDateString() === today)
      .reduce((sum, item) => sum + (item.xpAwarded ?? 0), 0)
  }, [activityFeed.data])

  // ── Task filtering ───────────────────────────────────────────────────────────
  const platformTasks = useMemo(
    () =>
      (userTasks.data as any[]).filter(
        (t) =>
          (t.type === 'READ' || t.type === 'ONCHAIN') &&
          String(t._id).startsWith('platform:')
      ),
    [userTasks.data]
  )

  const socialTasks = useMemo(
    () =>
      (userTasks.data as any[]).filter(
        (t) =>
          t.type === 'TWITTER' ||
          t.type === 'TELEGRAM' ||
          (t.type === 'CUSTOM' && !t.metadata?.milestoneId)
      ),
    [userTasks.data]
  )

  const milestoneTasks = useMemo(
    () =>
      (userTasks.data as any[])
        .filter((t) => t.metadata?.milestoneId)
        .sort((a: any, b: any) => (a.metadata?.streakDays ?? 0) - (b.metadata?.streakDays ?? 0)),
    [userTasks.data]
  )

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCopyReferralLink = async () => {
    if (referralCode) {
      const url = `${window.location.origin}?ref=${referralCode}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      dispatch(getReferralCode())
    }
  }

  const handleCheckIn = async () => {
    const result = await dispatch(checkIn())
    if (checkIn.fulfilled.match(result)) {
      const data = result.payload?.data
      setCheckinResult({
        xpAwarded: data?.xpAwarded ?? 0,
        isWeeklyMilestone: data?.isWeeklyMilestone ?? false,
      })
      openCheckinModal()
      // Refresh activity feed so streak bubbles update
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch(getActivityFeed({ limit: 20 } as any))
    }
  }

  // Opens the task detail / social URL modal
  const handleViewTask = (task: any) => {
    setSelectedTask(task)
    openTaskModal()
  }

  // Fires when user clicks Confirm inside the task modal
  const handleConfirmTask = async () => {
    if (!selectedTask) return
    closeTaskModal()
    openTimerModal()
    setIsConfirming(true)

    // Wait for both the API call AND the 15-second minimum display time
    const [result] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dispatch(claimUserTask(selectedTask._id as any)),
      new Promise<void>((resolve) => setTimeout(resolve, 15000)),
    ])

    setIsConfirming(false)
    closeTimerModal()

    if (claimUserTask.fulfilled.match(result)) {
      const xp = (result.payload as any)?.data?.xpResult?.xpAwarded ?? 0
      setClaimSuccessXp(xp)
      openClaimModal()
    }
  }

  const handleMilestoneClaim = async (taskId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await dispatch(claimUserTask(taskId as any))
    if (claimUserTask.fulfilled.match(result)) {
      const xp = (result.payload as any)?.data?.xpResult?.xpAwarded ?? 0
      setClaimSuccessXp(xp)
      openClaimModal()
    }
  }

  const currentStreak = checkin.streak

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-lg">Quiva Dashboard – Testnet</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyReferralLink}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            {copied ? (
              <><Check className="w-4 h-4 text-green-400" /><span className="text-green-400">Copied!</span></>
            ) : referralCodeLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Loading...</>
            ) : (
              <><Copy className="w-4 h-4" />Invite Friends</>
            )}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Join Pro</span>
            <ToggleSwitch enabled={isPro} onChange={() => setIsPro((prev) => !prev)} />
          </div>
        </div>
      </div>

      {/* ── Top Stats Bar ── */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBadge label="Wallet Address" value={truncateAddress(walletAddress)} />
          <StatBadge label="Current Rank" value={user?.rank ? `#${user.rank}` : '—'} />
          <StatBadge label="Role" value={primaryRole} />
          <StatBadge label="Total XP" value={xp.toLocaleString()} />
        </div>
      </div>

      {/* ── Daily Platform Tasks ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-white font-bold text-base">Daily Platform Tasks</h2>
          <p className="text-white/40 text-xs mt-0.5">
            Complete these daily actions to earn XP and streak rewards.{' '}
            <span className="text-white font-semibold">These reset every 24 hours</span>
          </p>
        </div>
        {userTasks.isLoading ? (
          <div className="flex flex-col sm:flex-row gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="flex-1 h-44 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            {platformTasks.map((t: any) => (
              <MissionCard key={t._id} task={t} />
            ))}
          </div>
        )}
      </section>

      {/* ── Daily XP Earned ── */}
      <section>
        <div className="mb-2">
          <h2 className="text-white font-bold text-base">Daily XP Earned</h2>
          <p className="text-white/40 text-xs mt-0.5">Total XP earned today from all activities</p>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4">
          <div className="relative">
            <div className="w-full bg-white/80 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-[#FAA31E] transition-all duration-500"
                style={{ width: `${Math.min((dailyXpEarned / DAILY_XP_GOAL) * 100, 100)}%` }}
              />
            </div>
            <Trophy className="absolute -right-1 -top-1 w-5 h-5 text-[#FAA31E]" />
          </div>
          <div className="flex justify-end mt-2">
            <span className="text-[#D3D3D3]">
              {dailyXpEarned}/{DAILY_XP_GOAL}
            </span>
          </div>
        </div>
      </section>

      {/* ── Milestone Rewards ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-white font-bold text-base">Milestone Reward</h2>
          <p className="text-white/40 text-xs mt-0.5">
            Complete your daily tasks to unlock milestone XP bonuses.{' '}
            <span className="text-white font-semibold">Rewards are distributed using a 28-day system</span>
          </p>
        </div>

        {/* Streak Tracker */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 mb-4">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden relative flex flex-col items-center justify-center flex-shrink-0">
              <Image src="/streak-card-bg.png" alt="streak" fill className="object-cover" />
              <span className="text-3xl font-extrabold text-white leading-none relative z-10">{currentStreak}</span>
              <span className="text-[10px] text-white/70 leading-none relative z-10 mt-1">days streak</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1 bg-white/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-[#FAA31E]"
                      style={{ width: `${Math.min((currentStreak / MILESTONE_CYCLE_DAYS) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-white font-semibold flex-shrink-0">
                    {currentStreak}/{MILESTONE_CYCLE_DAYS}
                  </span>
                </div>

                {/* Check-in button */}
                <button
                  onClick={handleCheckIn}
                  disabled={checkin.alreadyCheckedIn || checkin.isLoading}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
                    checkin.alreadyCheckedIn
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-[#FAA31E] text-black hover:bg-[#FAA31E]/90'
                  }`}
                >
                  {checkin.isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : checkin.alreadyCheckedIn ? (
                    'Come back tomorrow'
                  ) : (
                    <>
                      <Flame className="w-3 h-3" />
                      Check In
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-end gap-2 overflow-x-auto pb-1 no-scrollbar">
                {streakDays.map((d) => (
                  <DayStreakBubble key={d.day} day={d.day} label={d.label} done={d.done} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Cards */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 space-y-6">
          {MILESTONES.map((m, i) => {
            const task = milestoneTasks[i] as any | undefined
            const threshold = task?.metadata?.streakDays ?? MILESTONE_THRESHOLDS[i]
            const locked = currentStreak < threshold
            const completed = task?.completed ?? false
            return (
              <MilestoneCard
                key={m.id}
                milestone={m}
                locked={locked}
                completed={completed}
                isClaiming={task ? claimTask.claimingId === task._id : false}
                onClaim={task && !locked && !completed ? () => handleMilestoneClaim(task._id) : undefined}
              />
            )
          })}
        </div>
      </section>

      {/* ── Social Tasks ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-white font-bold text-base">Social Tasks</h2>
          <p className="text-white/40 text-xs mt-0.5">These are one time tasks and don&apos;t count on the daily XP bar</p>
        </div>

        {userTasks.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : socialTasks.length === 0 ? (
          <div className="py-6 text-center text-sm text-white/40">No social tasks available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {socialTasks.map((t: any) => (
              <BonusTaskRow
                key={t._id}
                task={t}
                onClaim={() => handleViewTask(t)}
                isClaiming={claimTask.claimingId === t._id}
              />
            ))}
          </div>
        )}

        {/* Role + XP level progress */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-sm text-white mb-3">
            <span className="font-bold">Role –</span>{' '}
            <span className="text-[#FAA31E] font-semibold">{roleLabel}</span>
          </p>
          <div className="relative w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-[#FAA31E] transition-all duration-500"
              style={{ width: `${Math.min((xpInLevel / xpNeededInLevel) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-end mt-1.5">
            <span className="text-sm text-white/60">{xpToNext.toLocaleString()} XP to next level</span>
          </div>
        </div>
      </section>

      {/* ── Leaderboard ── */}
      <section>
        <LeaderboardPodium
          topUsers={leaderboard.topUsers}
          currentUser={leaderboard.currentUser}
        />
      </section>

      {/* ── Activity Feed ── */}
      <section>
        <div className="flex items-center justify-between px-0 py-0 mb-3">
          <div>
            <h2 className="text-white font-bold text-base">Recent Activity</h2>
            <p className="text-white/40 text-xs mt-0.5">Your latest XP-earning actions</p>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
          {activityFeed.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-white/10 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-32 rounded bg-white/10 animate-pulse" />
                    <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-14 rounded bg-white/10 animate-pulse" />
              </div>
            ))
          ) : activityFeed.data.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-white/40">
              No activity yet. Complete tasks and check in daily to earn XP.
            </div>
          ) : (
            (activityFeed.data as any[]).map((item) => (
              <div key={item._id} className="flex items-center justify-between px-5 py-4 border-b border-white/10 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FAA31E]/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-[#FAA31E]" />
                  </div>
                  <div>
                    <p className="text-sm text-white/90 font-medium">
                      {ACTIVITY_LABELS[item.type] ?? item.type}
                    </p>
                    <p className="text-xs text-white/40">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                {item.xpAwarded > 0 && (
                  <span className="text-sm font-semibold text-[#FAA31E]">+{item.xpAwarded} XP</span>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── Referrer History ── */}
      <section>
        <ReferrerHistory entries={referralHistory.data} isLoading={referralHistory.isLoading} />
      </section>

      {/* ── Success Modals ── */}
      {/* Check-in success */}
      <ClaimSuccessModal
        isOpen={isCheckinModalOpen}
        onOpenChange={onCheckinModalChange}
        onClose={() => {
          closeCheckinModal()
          setCheckinResult(null)
        }}
        xp={checkinResult?.xpAwarded ?? 0}
      />

      {/* Task claim success */}
      <ClaimSuccessModal
        isOpen={isClaimModalOpen}
        onOpenChange={onClaimModalChange}
        onClose={() => {
          closeClaimModal()
          setClaimSuccessXp(null)
        }}
        xp={claimSuccessXp ?? 0}
      />

      {/* Social task detail + URL modal */}
      <SocialTaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onOpenChange={onTaskModalChange}
        onClose={() => {
          closeTaskModal()
          setSelectedTask(null)
        }}
        onConfirm={handleConfirmTask}
        isConfirming={isConfirming}
      />

      {/* Hourglass timer modal — shown while API fires */}
      <TaskTimerModal isOpen={isTimerModalOpen} onOpenChange={onTimerModalChange} />
    </div>
  )
}
