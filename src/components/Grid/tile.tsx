import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { Label } from '@/components/Grid/Label'
import clsx from 'clsx'
import React from 'react'

type Props = {
  active?: boolean
  backgroundTheme?: 'auto' | 'white'
  imageFit?: 'cover' | 'contain'
  imagePosition?: 'center' | 'right'
  isInteractive?: boolean
  topLeftDescription?: string
  label?: {
    amount: number
    position?: 'bottom' | 'center'
    title: string
  }
  media: MediaType
}

export const GridTileImage: React.FC<Props> = ({
  active,
  backgroundTheme = 'auto',
  imageFit = 'cover',
  imagePosition = 'center',
  isInteractive = true,
  label,
  topLeftDescription,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'tile-image-accent group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border',
        {
          'bg-white dark:bg-black': backgroundTheme === 'auto',
          'bg-white': backgroundTheme === 'white',
        },
        {
          'tile-image-active border-2': active,
          'border-neutral-200 dark:border-neutral-800': !active,
          relative: label,
        },
      )}
    >
      {props.media ? (
        <Media
          className={clsx('relative h-full w-full', {
            'transition duration-300 ease-in-out group-hover:scale-105': isInteractive,
          })}
          height={80}
          imgClassName={clsx('h-full w-full', {
            'object-cover': imageFit === 'cover',
            'object-contain': imageFit === 'contain',
            'object-center': imagePosition === 'center',
            'object-right tile-image-position-right': imagePosition === 'right',
          })}
          resource={props.media}
          width={80}
        />
      ) : null}
      {topLeftDescription ? (
        <p
          className="tile-top-description absolute left-3 right-3 top-3 z-10 max-w-[58%] rounded-md bg-white/72 px-2 py-1 text-[11px] leading-[1.25] text-black backdrop-blur-sm dark:bg-black/65 dark:text-white"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            bottom: '72px',
            maxHeight: 'calc(100% - 84px)',
            wordBreak: 'break-word',
          }}
        >
          {topLeftDescription}
        </p>
      ) : null}
      {label ? <Label amount={label.amount} position={label.position} title={label.title} /> : null}
    </div>
  )
}
