import type { CollectionAfterChangeHook } from 'payload'

import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

const MEDIA_DIR = path.resolve(process.cwd(), 'public/media')
const TARGET_SIZE = 1200

const isTransparentFormat = (mimeType: string): boolean => {
  return mimeType === 'image/png' || mimeType === 'image/webp' || mimeType === 'image/avif'
}

const normalizeToBuffer = async (filePath: string, mimeType: string): Promise<Buffer> => {
  const base = sharp(filePath, { animated: false })
    .trim()
    .resize(TARGET_SIZE, TARGET_SIZE, {
      fit: 'contain',
      position: 'center',
      background: isTransparentFormat(mimeType)
        ? { r: 0, g: 0, b: 0, alpha: 0 }
        : { r: 255, g: 255, b: 255, alpha: 1 },
    })

  if (mimeType === 'image/png') return base.png({ compressionLevel: 9 }).toBuffer()
  if (mimeType === 'image/webp') return base.webp({ quality: 92 }).toBuffer()
  if (mimeType === 'image/avif') return base.avif({ quality: 88 }).toBuffer()
  return base.jpeg({ quality: 92, mozjpeg: true }).toBuffer()
}

export const normalizeMediaImage: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  req,
}) => {
  if (context?.skipMediaNormalize) return doc

  const mimeType = typeof doc.mimeType === 'string' ? doc.mimeType : ''
  const filename = typeof doc.filename === 'string' ? doc.filename : ''
  const isSupportedRaster =
    mimeType === 'image/jpeg' ||
    mimeType === 'image/jpg' ||
    mimeType === 'image/png' ||
    mimeType === 'image/webp' ||
    mimeType === 'image/avif'

  if (!filename || !isSupportedRaster) return doc
  if (operation === 'update' && !req.file) return doc

  const filePath = path.resolve(MEDIA_DIR, filename)

  try {
    const output = await normalizeToBuffer(filePath, mimeType)
    await fs.writeFile(filePath, output)

    await req.payload.update({
      collection: 'media',
      data: {
        filesize: output.length,
        height: TARGET_SIZE,
        width: TARGET_SIZE,
      },
      id: doc.id,
      req,
      context: {
        ...context,
        skipMediaNormalize: true,
      },
    })
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: `Media normalization failed for ${filename}`,
    })
  }

  return doc
}
