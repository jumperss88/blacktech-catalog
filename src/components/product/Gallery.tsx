'use client'

import type { Media as MediaType, Product } from '@/payload-types'

import { Media } from '@/components/Media'
import { GridTileImage } from '@/components/Grid/tile'
import React from 'react'

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

type Props = {
  gallery: NonNullable<Product['gallery']>
}

export const Gallery: React.FC<Props> = ({ gallery }) => {
  const [current, setCurrent] = React.useState(0)
  const [api, setApi] = React.useState<CarouselApi>()

  const galleryMedia = gallery.filter(
    (item): item is MediaType => typeof item === 'object' && item !== null,
  )
  const showThumbArrows = galleryMedia.length >= 6

  React.useEffect(() => {
    if (!api) return
    if (current < 0 || current >= galleryMedia.length) return

    api.scrollTo(current)
  }, [api, current, galleryMedia.length])

  React.useEffect(() => {
    if (current < galleryMedia.length) return
    setCurrent(0)
  }, [current, galleryMedia.length])

  const handleThumbsWheel = React.useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!api) return

      const absX = Math.abs(event.deltaX)
      const absY = Math.abs(event.deltaY)
      const dominantDelta = absX > absY ? event.deltaX : event.deltaY

      if (Math.abs(dominantDelta) < 8) return

      if (dominantDelta > 0) {
        if (api.canScrollNext()) {
          event.preventDefault()
          api.scrollNext()
        }
        return
      }

      if (api.canScrollPrev()) {
        event.preventDefault()
        api.scrollPrev()
      }
    },
    [api],
  )

  const goToPrevImage = React.useCallback(() => {
    if (!galleryMedia.length) return
    setCurrent((prev) => Math.max(0, prev - 1))
  }, [galleryMedia.length])

  const goToNextImage = React.useCallback(() => {
    if (!galleryMedia.length) return
    setCurrent((prev) => Math.min(galleryMedia.length - 1, prev + 1))
  }, [galleryMedia.length])

  const handleGalleryKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPrevImage()
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNextImage()
      }
    },
    [goToNextImage, goToPrevImage],
  )

  return (
    <div
      onKeyDown={handleGalleryKeyDown}
      tabIndex={0}
      className="outline-none focus:outline-none focus-visible:outline-none"
    >
      <div className="relative mb-8 w-full overflow-hidden">
        <Media
          resource={galleryMedia[current]}
          className="mx-auto w-full max-w-[82%]"
          imgClassName="w-full rounded-lg"
        />
      </div>

      <Carousel
        setApi={setApi}
        className={`w-full ${showThumbArrows ? 'px-10' : 'px-0'}`}
        opts={{ align: 'start', dragFree: true, loop: false }}
        onWheel={handleThumbsWheel}
      >
        {showThumbArrows ? (
          <CarouselPrevious className="left-0 top-1/2 h-8 w-8 -translate-y-1/2 border-neutral-300 bg-white" />
        ) : null}
        {showThumbArrows ? (
          <CarouselNext className="right-0 top-1/2 h-8 w-8 -translate-y-1/2 border-neutral-300 bg-white" />
        ) : null}
        <CarouselContent>
          {galleryMedia.map((item, i) => {
            if (!item) return null

            return (
              <CarouselItem
                className="basis-1/3 sm:basis-1/4 lg:basis-1/5"
                key={`${item.id}-${i}`}
                onClick={() => {
                  setCurrent(i)
                }}
              >
                <GridTileImage active={i === current} media={item} />
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
