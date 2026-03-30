'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Trophy, UserPlus } from 'lucide-react'
import {
  USER_STATS,
  DAILY_MISSIONS,
  STREAK_DAYS,
  MILESTONES,
  BONUS_TASKS,
  LEADERBOARD,
  REFERRER_HISTORY,
  CURRENT_DAY_STREAK,
  TOTAL_STREAK_DAYS,
  DAILY_XP_EARNED,
  DAILY_XP_GOAL,
  USER_ROLE,
  ROLE_XP_TO_NEXT,
  ROLE_XP_CURRENT,
  ROLE_XP_TOTAL,
} from '../data/data'
import StatBadge from './stat-badge'
import MissionCard from './mission-card'
import DayStreakBubble from './day-streak-bubble'
import MilestoneCard from './milestone-card'
import BonusTaskRow from './bonus-task-row'
import LeaderboardPodium from './leaderboard-podium'
import ReferrerHistory from './referrer-history'
import ToggleSwitch from '@/components/switch/Switch'

export default function DashboardView() {
  const [bonusTasks, setBonusTasks] = useState(BONUS_TASKS)
  const [isPro, setIsPro] = useState(false)

  const toggleBonus = (id: string) => {
    setBonusTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, done: !t.done } : t))
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-lg">Quiva Dashboard – Testnet</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
            <UserPlus className="w-4 h-4" />
            Invite Friends
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Join Pro</span>
            <ToggleSwitch enabled={isPro} onChange={() => setIsPro(prev => !prev)} />
          </div>
        </div>
      </div>

      {/* ── Top Stats Bar ── */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBadge label="Wallet Address" value={USER_STATS.walletAddress} />
          <StatBadge label="Current Rank" value={USER_STATS.currentRank} />
          <StatBadge label="Role" value={USER_STATS.role} />
          <StatBadge label="Total Accumulated Point" value={String(USER_STATS.totalPoints)} />
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
        <div className="flex flex-col sm:flex-row gap-4">
          {DAILY_MISSIONS.map(m => (
            <MissionCard key={m.id} mission={m} />
          ))}
        </div>
      </section>

      {/* ── Daily XP Earned ── */}
      <section>
        <div className="mb-2">
          <h2 className="text-white font-bold text-base">Daily XP Earned</h2>
          <p className="text-white/40 text-xs mt-0.5">This is an overall of total XP earned today</p>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4">
          <div className="relative">
            <div className="w-full bg-white/80 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-[#FAA31E] transition-all duration-500"
                style={{ width: `${(DAILY_XP_EARNED / DAILY_XP_GOAL) * 100}%` }}
              />
            </div>
            <Trophy className="absolute -right-1 -top-1 w-5 h-5 text-[#FAA31E]" />
          </div>
          <div className="flex justify-end mt-2">
            <span className=" text-[#D3D3D3]">
              {DAILY_XP_EARNED}/{DAILY_XP_GOAL}
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
            {/* Big streak card */}
            <div className="w-20 h-20 rounded-xl overflow-hidden relative flex flex-col items-center justify-center flex-shrink-0">
              <Image src="/streak-card-bg.png" alt="streak" fill className="object-cover" />
              <span className="text-3xl font-extrabold text-white leading-none relative z-10">{CURRENT_DAY_STREAK}</span>
              <span className="text-[10px] text-white/70 leading-none relative z-10 mt-1">days streak</span>
            </div>

            {/* Days + progress */}
            <div className="flex-1 min-w-0">
              {/* Progress bar row */}
              <div className="flex items-center justify-end gap-2 mb-3">
                <div className="w-32 bg-white/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-[#FAA31E]"
                    style={{ width: `${(CURRENT_DAY_STREAK / TOTAL_STREAK_DAYS) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white font-semibold flex-shrink-0">
                  {CURRENT_DAY_STREAK}/{TOTAL_STREAK_DAYS}
                </span>
              </div>

              {/* Day bubbles */}
              <div className="flex items-end gap-2 overflow-x-auto pb-1 no-scrollbar">
                {STREAK_DAYS.map(d => (
                  <DayStreakBubble key={d.day} day={d.day} label={d.label} done={d.done} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Cards */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 space-y-6">
          {MILESTONES.map(m => (
            <MilestoneCard key={m.id} milestone={m} />
          ))}
        </div>
      </section>

      {/* ── Social Tasks ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-white font-bold text-base">Social Tasks</h2>
          <p className="text-white/40 text-xs mt-0.5">These are one time tasks and don&apos;t count on the daily XP bar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {bonusTasks.map(t => (
            <button key={t.id} onClick={() => toggleBonus(t.id)} className="text-left">
              <BonusTaskRow task={t} />
            </button>
          ))}
        </div>

        {/* Role + XP progress */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-sm text-white mb-3">
            <span className="font-bold">Role-</span>{' '}
            <span className="text-[#FAA31E] font-semibold">{USER_ROLE}</span>
          </p>
          <div className="relative w-full bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-[#FAA31E] transition-all duration-500"
              style={{ width: `${(ROLE_XP_CURRENT / ROLE_XP_TOTAL) * 100}%` }}
            />
          </div>
          <div className="flex justify-end mt-1.5">
            <span className="text-sm text-white/60">{ROLE_XP_TO_NEXT} XP to next level</span>
          </div>
        </div>
      </section>

      {/* ── Leaderboard ── */}
      <section>
        <LeaderboardPodium entries={LEADERBOARD} />
      </section>

      {/* ── Referrer History ── */}
      <section>
        <ReferrerHistory entries={REFERRER_HISTORY} />
      </section>

    </div>
  )
}
