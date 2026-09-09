'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { getAllComics } from '@/redux/slices/comicSlice'
import { extractComicList, transformApiComicsToComics } from '@/features/comic-library/utils/transformComicData'
import { ComicCard } from '@/components/cards/ComicCard'

export default function MoreFromSection() {
  const dispatch = useAppDispatch()
  const { comics } = useAppSelector((state: any) => state.comic)

  useEffect(() => {
    dispatch(getAllComics())
  }, [dispatch])

  const transformedComics = useMemo(() => {
    return transformApiComicsToComics(extractComicList(comics))
  }, [comics])

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-base">More on Quiva</h3>
        <Link href="/marketplace" className="flex items-center gap-1 text-sm text-[#FAA31E] hover:underline">
          See all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {transformedComics.slice(0, 4).map((comic, index) => (
          <ComicCard
            key={comic.id}
            id={comic.id}
            title={comic.title}
            creator={comic.creatorUsername || ''}
            creatorUsername={comic.creatorUsername || ''}
            creatorAvatar={comic.creatorAvatar}
            currentPrice={comic.price}
            views={comic.views}
            image={comic.image}
            premium={comic.premium} 
            number={index + 1}
            isLiked={false}
            likes={comic.likes}
          />
        ))}
      </div>
    </div>
  )
}
