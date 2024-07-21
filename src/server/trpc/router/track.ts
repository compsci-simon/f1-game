import { publicProcedure, router } from "../trpc";
import fs from 'fs'
import jimp from 'jimp'
const cache: { width: number, height: number, bitmap: number[][] } = {
  width: 0,
  height: 0,
  bitmap: []
}

const inputPath = '/Users/simon/Developer/f1-game/public/track.png';
const readImage = async () => {
  // Read the PNG image
  return jimp.read(inputPath)
    .then(image => {
      // Get image metadata
      const metadata = {
        width: image.bitmap.width,
        height: image.bitmap.height,
        depth: image.bitmap.depth, // Bits per channel
      };
      const rawData = image.bitmap.data; // Uint8ClampedArray
      return {
        ...metadata,
        raw: Array.from(rawData)
      }
      // Example: Save raw data to a file
    })
    .catch(err => {
      console.error('Error processing image:', err);
      return [] as number[]
    });
}

export const trackRouter = router({
  getTrack: publicProcedure
    .query(async () => {
      // if (cache.bitmap.length > 0) {
      //   return cache
      // }
      const imageData = await readImage()
      cache.width = imageData.width
      cache.height = imageData.height
      const bitmap = []
      for (let y = 0; y < imageData.height; y++) {
        const row: number[] = []
        for (let x = 0; x < imageData.width; x++) {
          const index = y * imageData.width * 4 + x * 4
          const r = imageData.raw[index] ?? 0
          const g = imageData.raw[index + 1] ?? 0
          const b = imageData.raw[index + 2] ?? 0
          const a = imageData.raw[index + 3] ?? 0
          row.push(a)
        }
        bitmap.push(row)
      }
      cache.bitmap = bitmap
      return cache
    })
})
