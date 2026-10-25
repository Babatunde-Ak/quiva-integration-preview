'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, LockKeyhole, BookOpen } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { getComicById } from '@/redux/slices/comicSlice'

type PublicSample = { imageUrl: string; pageNumber?: number }

/**
 * Only render pages expressly identified as public samples.
 * A paid comic's full `chapters[].pages` must NEVER be used as preview content.
 * Server/API authorization of sample URLs remains essential.
 */
function publicSamples(comic: any): PublicSample[] {
  const explicit = comic?.previewPages ?? comic?.samplePages ?? comic?.previewImages
  if (Array.isArray(explicit)) {
    return explicit.map((item: any, index: number) => ({
      imageUrl: typeof item === 'string' ? item : String(item?.imageUrl || item?.url || ''),
      pageNumber: typeof item?.pageNumber === 'number' ? item.pageNumber : index + 1,
    })).filter(page => Boolean(page.imageUrl))
  }
  if (!Array.isArray(comic?.chapters)) return []
  return comic.chapters.flatMap((chapter: any) =>
    Array.isArray(chapter?.pages)
      ? chapter.pages.filter((page: any) => page?.isPreview === true || page?.isSample === true || page?.publicSample === true)
          .map((page: any) => ({ imageUrl: String(page.imageUrl || ''), pageNumber: page.pageNumber }))
          .filter((page: PublicSample) => Boolean(page.imageUrl))
      : []
  )
}

export default function MarketplacePreviewPage() {
  const router = useRouter()
  const params = useSearchParams()
  const id = params.get('id')
  const dispatch = useAppDispatch()
  const { currentComic, isLoading, error } = useAppSelector((state: any) => state.comic)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [requestFinished, setRequestFinished] = useState(false)

  useEffect(() => {
    let active = true
    setRequestFinished(false)
    setCurrentIndex(0)
    if (id) {
      void dispatch(getComicById({ id } as any)).finally(() => {
        if (active) setRequestFinished(true)
      })
    } else {
      setRequestFinished(true)
    }
    return () => { active = false }
  }, [id, dispatch])

  const match = id && (currentComic?._id === id || currentComic?.id === id)
  const comic = match ? currentComic : null
  const samples = useMemo(() => publicSamples(comic), [comic])
  const canGoBack = currentIndex > 0
  const canGoForward = currentIndex < samples.length - 1
  const detailHref = id ? `/marketplace/detail?id=${encodeURIComponent(id)}` : '/marketplace'

  return (
    <main className="mx-auto min-h-[75vh] w-full max-w-6xl px-2 pb-12 text-white sm:px-6">
      <div className="my-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => router.push(detailHref)} className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to comic</button>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm"><BookOpen className="h-4 w-4" aria-hidden="true" /> Public sample preview</div>
      </div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{comic?.title || 'Comic preview'}</h1>
        <p className="mt-2 text-sm text-white/60">Only pages explicitly released by the creator as previews are shown here. Full reading still requires the existing access check.</p>
      </header>
      {!id ? (
        <div className="rounded-2xl border border-white/10 bg-black-200 p-8 text-center">Choose a comic from the marketplace to view its public sample pages.</div>
      ) : isLoading || !requestFinished ? (
        <div role="status" className="rounded-2xl border border-white/10 bg-black-200 p-8 text-center">Loading preview…</div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-500/30 bg-black-200 p-8 text-center">Unable to load this comic. <button type="button" className="ml-2 underline" onClick={() => dispatch(getComicById({ id } as any))}>Retry</button></div>
      ) : !comic ? (
        <div role="alert" className="rounded-2xl border border-white/10 bg-black-200 p-8 text-center">Comic not found. Check the link and try again.</div>
      ) : samples.length === 0 ? (
        <div className="flex min-h-[45vh] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black-200 p-8 text-center">
          <LockKeyhole className="mb-4 h-10 w-10 text-secondary-200" aria-hidden="true" />
          <h2 className="text-xl font-semibold">No public sample pages available yet</h2>
          <p className="mt-2 max-w-lg text-sm text-white/60">The creator hasn't marked any pages as public previews. We don't reveal full comic content as a substitute.</p>
          <button type="button" onClick={() => router.push(detailHref)} className="mt-6 rounded-full bg-secondary-200 px-6 py-3 font-semibold text-black">View comic details</button>
        </div>
      ) : (
        <section aria-label="Comic sample pages" className="overflow-hidden rounded-2xl border border-white/10 bg-black-200">
          <div className="flex min-h-[50vh] items-center justify-center bg-black p-4 sm:min-h-[65vh]">
            <img src={samples[currentIndex]?.imageUrl} alt={`Public sample page ${currentIndex + 1}`} className="max-h-[75vh] w-auto max-w-full object-contain" />
          </div>
          <div className="flex items-center justify-between gap-3 p-4 sm:p-6">
            <button type="button" onClick={() => setCurrentIndex(n => Math.max(0,n-1))} disabled={!canGoBack} aria-label="Previous sample page" className="rounded-full border border-white/20 p-3 disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
            <span aria-live="polite" className="text-center text-sm text-white/80">Sample {currentIndex + 1} of {samples.length}</span>
            <button type="button" onClick={() => setCurrentIndex(n => Math.min(samples.length-1,n+1))} disabled={!canGoForward} aria-label="Next sample page" className="rounded-full border border-white/20 p-3 disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
          </div>
        </section>
      )}
    </main>
  )
}
