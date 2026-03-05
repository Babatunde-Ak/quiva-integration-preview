'use client'
import { Rocket } from 'lucide-react'
import { useRef, useEffect } from 'react'
import { CreatorCard } from '@/components/cards/CreatorCard'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { getAllCollaborators } from '@/redux/slices/authSlice'

export function CreatorsSection() {
  const dispatch = useAppDispatch()
  const { collaborators } = useAppSelector((state: any) => state.auth)

  useEffect(() => {
    dispatch(getAllCollaborators())
  }, [dispatch])

  const creators = (collaborators?.data || []).slice(0, 10).map((collab: any) => ({
    id: collab._id || collab.id,
    name: collab.username ||
      (collab.walletAddress
        ? `${collab.walletAddress.slice(0, 6)}...${collab.walletAddress.slice(-4)}`
        : 'Unknown Creator'),
    avatar: collab.avatar || '/dev_images/avatar-2.png',
    totalComics: collab.totalComics || collab.comics?.length || 0,
  }))

  return (
    <section className="my-8 mt-12 w-full overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-white text-xl font-bold">Top Creators</h2>
          <p className="text-white/50 text-sm font-light">
            Checkout Top Rated Comic Creators/Artist on the Comic Marketplace
          </p>
        </div>

        <button className='border-2 border-secondary-200 rounded-2xl px-8 py-3 flex items-center hover:bg-black-50 transition-colors'>
          <Rocket size={16} className='text-secondary-200' />
          <span className="ml-2 text-xs font-medium text-white">View Rankings</span>
        </button>
      </div>

      {/* Loading State */}
      {collaborators?.isLoading && (
        <div className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Creators Grid */}
      {!collaborators?.isLoading && creators.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {creators.map((creator: any, index: number) => (
            <CreatorCard
              rank={index + 1}
              key={creator.id}
              avatar={creator.avatar}
              name={creator.name}
              totalComics={creator.totalComics}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!collaborators?.isLoading && creators.length === 0 && (
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-white/50 text-sm">No creators found</p>
        </div>
      )}
    </section>
  )
}
