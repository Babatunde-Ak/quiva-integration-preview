
'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

interface FeaturedComicData {
  title: string
  author: string
  floorPrice: string
  items: string
  mintPrice: string
  countdown: string
  description?: string
  tags: string[]
  image: string
}

interface FeaturedComicProps {
  comics: FeaturedComicData[]
}

export function FeaturedComic({ comics }: FeaturedComicProps) {
  if (comics.length === 0) return null

  return (
    <section className="mb-8 mt-16">
      <h2 className="text-white text-xl font-bold mb-4">Recommended for You</h2>
      
      <div className="relative rounded-xl overflow-hidden w-full   h-[400px] md:h-[450px] lg:h-[500px]">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{
            clickable: true,
            el: '.swiper-pagination-custom',
            bulletClass: 'swiper-pagination-bullet-custom',
            bulletActiveClass: 'swiper-pagination-bullet-active-custom',
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          effect="fade"
          fadeEffect={{
            crossFade: true
          }}
          loop={comics.length > 1}
          className="h-full"
        >
          {comics.map((comic, index) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                  <img 
                    src={comic.image}
                    alt={comic.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black-400/80 via-black-400/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black-400/60 via-transparent to-black-400/30" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex items-end p-6 md:p-8 z-10">
                  <div className="w-full max-w-2xl">
                    <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
                      {comic.title}
                    </h3>
                    <p className="text-white/90 text-sm md:text-base mb-6 font-light">
                      By {comic.author}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-black/30 backdrop-blur-sm rounded-lg py-2 px-4 border border-white/10">
                      <div className=" border-r border-white/10">
                        <p className="text-white/70 text-xs uppercase tracking-wide mb-1 font-light">Floor Price</p>
                        <p className="text-white font-bold text-xs">{comic.floorPrice}</p>
                      </div>
                      <div className=" border-r border-white/10">
                        <p className="text-white/70 text-xs uppercase tracking-wide mb-1 font-light">Items</p>
                        <p className="text-white font-bold text-xs">{comic.items}</p>
                      </div>
                      <div className=" border-r border-white/10">
                        <p className="text-white/70 text-xs uppercase tracking-wide mb-1 font-light">Mint Price</p>
                        <p className="text-white font-bold text-xs">{comic.mintPrice}</p>
                      </div>
                      <div className=" ">
                        <p className="text-white/70 text-xs uppercase tracking-wide mb-1 font-light">Countdown</p>
                        <p className="text-white font-bold text-xs">{comic.countdown}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {comic.tags && comic.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {comic.tags.map((tag, tagIndex) => (
                          <Badge 
                            key={tagIndex}
                            className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 transition-colors"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        {comics.length > 1 && (
          <>
            <button className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-all duration-300 z-20 group-hover:opacity-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>
            <button className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-all duration-300 z-20 group-hover:opacity-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          </>
        )}

        {/* Custom Pagination Dots */}
        <div className="swiper-pagination-custom absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20"></div>
      </div>

    </section>
  )
}