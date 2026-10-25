'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, FolderOpen, RefreshCw, Sparkles } from 'lucide-react'
import { useAppDispatch } from '@/redux/hook'
import { getUserCollections } from '@/redux/slices/collectionSlice'
import StartNewComicFast from './StartNewComicFast'

type CreatorCollection = {
  id: string
  title: string
  description: string
  image: string | null
  episodeCount: number
}

/**
 * Read the same authenticated API response as the existing Collections page.
 * Never manufacture a populated dashboard when the API fails or returns no data.
 */
function extractCollections(response: any): any[] {
  const payload = response?.data?.collections ?? response?.data?.data ?? response?.data ?? response
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.collections)) return payload.collections
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

function toCollection(raw: any): CreatorCollection | null {
  const id = raw?._id ?? raw?.id
  if (typeof id !== 'string' || !id) return null
  return {
    id,
    title: String(raw.title || 'Untitled series'),
    description: String(raw.description || ''),
    image: raw.bannerImage || raw.coverImage || null,
    episodeCount: Array.isArray(raw.comic)
      ? raw.comic.length
      : Array.isArray(raw.episodes)
      ? raw.episodes.length
      : Number(raw.totalEpisodes || 0),
  }
}

export default function CreatorDashboard() {
  const dispatch = useAppDispatch()
  const [collections, setCollections] = useState<CreatorCollection[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    let active = true
    setStatus('loading')
    dispatch(getUserCollections())
      .unwrap()
      .then((response: any) => {
        if (!active) return
        setCollections(extractCollections(response).map(toCollection).filter((c): c is CreatorCollection => c !== null))
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => { active = false }
  }, [dispatch, requestVersion])

  const retry = useCallback(() => setRequestVersion(n => n + 1), [])
  const episodeCount = collections.reduce((total, item) => total + item.episodeCount, 0)

  if (status === 'loading') {
    return (
      <div className="flex min-h-[55vh] items-center justify-center px-4 text-white/70" role="status">
        <RefreshCw className="mr-3 h-5 w-5 animate-spin" aria-hidden="true" /> Loading your creator workspace…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto my-12 max-w-2xl rounded-2xl border border-red-400/25 bg-black-200 p-8 text-white">
        <h1 className="text-xl font-bold">We couldn't load your creator workspace.</h1>
        <p className="mt-2 text-sm text-white/60">Check your connection or sign in with your creator account. Your existing collections have not been changed.</p>
        <button type="button" onClick={retry} className="mt-5 rounded-full bg-secondary-200 px-6 py-2 font-semibold text-black">Retry loading</button>
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="space-y-4">
        <header className="px-3 pt-6 sm:px-8">
          <p className="text-sm text-white/50">Quiva Studio</p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">Your story starts here</h1>
          <p className="mt-2 text-white/60">You haven't published a series yet. Create your first collection or open the script workspace to begin.</p>
        </header>
        <StartNewComicFast />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-3 pb-16 pt-6 text-white sm:px-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-200">Quiva Studio</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">Your creator dashboard</h1>
          <p className="mt-2 text-sm text-white/60">Manage the stories and episodes already associated with your account.</p>
        </div>
        <Link href="/comic-pad/collections" className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary-200 px-5 py-3 font-semibold text-black hover:brightness-110">
          Manage collections <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Creator overview">
        <div className="rounded-2xl border border-white/10 bg-black-200 p-5"><FolderOpen className="mb-4 h-6 w-6 text-secondary-200" aria-hidden="true" /><p className="text-sm text-white/60">Your collections</p><p className="mt-2 text-3xl font-bold">{collections.length}</p></div>
        <div className="rounded-2xl border border-white/10 bg-black-200 p-5"><BookOpen className="mb-4 h-6 w-6 text-secondary-200" aria-hidden="true" /><p className="text-sm text-white/60">Episodes in collections</p><p className="mt-2 text-3xl font-bold">{episodeCount}</p></div>
        <Link href="/comic-pad/script-builder" className="rounded-2xl border border-white/10 bg-black-200 p-5 hover:border-secondary-200/50"><Sparkles className="mb-4 h-6 w-6 text-secondary-200" aria-hidden="true" /><p className="text-sm text-white/60">Creative tools</p><p className="mt-2 inline-flex items-center gap-2 font-semibold">Open Script Builder <ArrowRight className="h-4 w-4" aria-hidden="true" /></p></Link>
      </section>

      <section aria-labelledby="creator-collections-title">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="creator-collections-title" className="text-xl font-bold">Your series</h2>
          <Link href="/comic-pad/collections" className="text-sm font-semibold text-secondary-200 hover:underline">View all series</Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.slice(0, 6).map(collection => (
            <Link key={collection.id} href={`/comic-pad/collections/${encodeURIComponent(collection.id)}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-black-200 transition hover:border-secondary-200/60">
              <div className="aspect-video overflow-hidden bg-black-400">
                {collection.image ? <img src={collection.image} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center"><BookOpen className="h-12 w-12 text-white/20" aria-hidden="true" /></div>}
              </div>
              <div className="p-5"><h3 className="truncate font-semibold">{collection.title}</h3><p className="mt-1 line-clamp-2 min-h-10 text-sm text-white/60">{collection.description || 'Open this collection to manage its episodes.'}</p><div className="mt-4 flex items-center justify-between text-sm"><span className="text-white/60">{collection.episodeCount} episodes</span><span className="inline-flex items-center gap-1 text-secondary-200">Open <ArrowRight className="h-4 w-4" aria-hidden="true" /></span></div></div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
