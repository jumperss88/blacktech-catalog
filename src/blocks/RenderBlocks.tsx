import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { AboutCompanyBlock } from '@/blocks/AboutCompany/Component'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { CarouselBlock } from '@/blocks/Carousel/Component'
import { ContactsHubBlock } from '@/blocks/ContactsHub/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { ServiceCenterBlock } from '@/blocks/ServiceCenter/Component'
import { ThreeItemGridBlock } from '@/blocks/ThreeItemGrid/Component'
import { HomeB2BSection } from '@/components/home/HomeB2BSection'
import { toKebabCase } from '@/utilities/toKebabCase'
import React, { Fragment } from 'react'

import type { Page } from '../payload-types'

const blockComponents = {
  aboutCompany: AboutCompanyBlock,
  archive: ArchiveBlock,
  banner: BannerBlock,
  carousel: CarouselBlock,
  contactsHub: ContactsHubBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  serviceCenter: ServiceCenterBlock,
  threeItemGrid: ThreeItemGridBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
  showHomeB2BSection?: boolean
}> = (props) => {
  const { blocks, showHomeB2BSection = false } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    let insertedHomeB2BSection = false

    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockName, blockType } = block
          const shouldRenderHomeB2BSection =
            showHomeB2BSection && blockType === 'carousel' && !insertedHomeB2BSection

          if (shouldRenderHomeB2BSection) {
            insertedHomeB2BSection = true
          }

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <Fragment key={index}>
                  <div className={index === 0 ? 'mt-0 mb-2' : 'my-2'}>
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore - weird type mismatch here */}
                    <Block id={toKebabCase(blockName!)} {...block} />
                  </div>
                  {shouldRenderHomeB2BSection ? <HomeB2BSection /> : null}
                </Fragment>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
