import { useEffect, useRef } from "react"
import { trpc } from "../../utils/trpc";
import { GameEngine } from "./GameEngine";

export default function Game() {
  const gameEngine = useRef<GameEngine>()
  const divRef = useRef<HTMLDivElement>(null)
  const carRef = useRef<HTMLDivElement>(null)
  const outerMapDiv = useRef<HTMLDivElement>(null)
  const innerMapDiv = useRef<HTMLDivElement>(null)
  const { data, isLoading } = trpc.track.getTrack.useQuery(undefined, {
    cacheTime: Infinity,
    staleTime: Infinity
  })

  useEffect(() => {
    gameEngine.current = new GameEngine(carRef, divRef, outerMapDiv, innerMapDiv);
    gameEngine.current.gameLoop();

    return () => {
      gameEngine.current?.stop();
    };
  }, [])

  useEffect(() => {
    if (!isLoading) {
      gameEngine.current?.setMapDimensions(data!.width, data!.height)
      gameEngine.current?.setBitmap(data!.bitmap)
      // const canvas = document.getElementById('canvas')
      // canvas!.height = data!.height
      // canvas!.width = data!.width
      // context.fillStyle = 'red'
      // data?.bitmap.forEach((row, y) => {
      //   row.forEach((point, x) => {
      //     if (point > 0) {
      //       context.fillRect(x, y, 1, 1)
      //     }
      //   })
      // })
    }
  }, [data, isLoading])

  return (
    <div style={{ display: 'flex' }}>
      <div id='car-wrapper' style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
        <div ref={carRef} id='car' style={{ zIndex: 100, position: 'absolute', left: '50%', top: '50%', width: '10px', height: '20px', backgroundColor: 'blue' }}></div>
        <div ref={outerMapDiv}>
          <div ref={innerMapDiv}>
            <img id='track-image' src='rbring.png' style={{ width: '100%', height: '100%' }} />
            <canvas id='canvas' style={{ width: '100%', height: '100%', position: 'absolute', top: 0 }} />
          </div>
        </div>
      </div>
      <div ref={divRef} style={{ position: 'absolute', fontSize: '20px' }}>
        test
      </div>
    </div>
  )
}