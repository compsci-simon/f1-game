import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import CarFrame, { FrontWheel, RearWheel } from "./components/CarFrame";


const Car = ({ width, steeringLock }: { width: number, steeringLock: number }) => {

  return (
    <div style={{ display: 'border-box', transform: 'scale(2)' }}>
      <FrontWheel style={{ display: 'inline-block', transform: `translate(15px, 12px) rotate(${steeringLock}deg)` }} />
      <FrontWheel style={{ display: 'inline-block', transform: `translate(62px, 12px) rotate(${steeringLock}deg)` }} />
      <CarFrame />
      <RearWheel style={{ display: 'inline-block', transform: 'translate(-15px, -10px)' }} />
      <RearWheel style={{ display: 'inline-block', transform: 'translate(75px, -10px)' }} />
    </div>
  )
}

const SPEED = 10
const STEERING_CHANGE = 3
const WHEELBASE_LENGTH = 100
const LOOP_TIME = 16

const Home: NextPage = () => {
  const divRef = useRef<HTMLDivElement>(null)
  const [left, setLeft] = useState(100)
  const [top, setTop] = useState(100)
  const keysPressed = useRef<Set<string>>(new Set())
  const [rotation, setRotation] = useState(0)
  const [steeringLock, setSteeringLock] = useState(0)

  const keydownHandler = (e: KeyboardEvent) => {
    keysPressed.current.add(e.key)
  }
  const keyupHandler = (e: KeyboardEvent) => {
    keysPressed.current.delete(e.key)
  }

  useEffect(() => {
    const handleKeyPresses = () => {
      for (let i = 0; i < SPEED; i++) {
        setSteeringLock(prevSteeringLock => {
          setRotation(prevRotation => {
            const yChange = Math.cos(prevRotation * Math.PI / 180)
            const xChange = Math.sin(prevRotation * Math.PI / 180)

            setTop(prevTop => {
              if (keysPressed.current.has('ArrowUp')) {
                return prevTop - 1 * yChange;
              } else if (keysPressed.current.has('ArrowDown')) {
                return prevTop + 1 * yChange;
              }
              return prevTop;
            });
            setLeft(prevLeft => {
              if (keysPressed.current.has('ArrowUp')) {
                return prevLeft + 1 * xChange;
              } else if (keysPressed.current.has('ArrowDown')) {
                return prevLeft - 1 * xChange;
              }
              return prevLeft
            })

            const R = WHEELBASE_LENGTH / Math.tan(prevSteeringLock * Math.PI / 180)
            let alpha = (1 - 1000 / LOOP_TIME) / R
            if (keysPressed.current.has('ArrowUp')) {
              // Do nothing
              alpha *= -1
            } else if (keysPressed.current.has('ArrowDown')) {
            } else {
              alpha = 0
            }
            if (keysPressed.current.has('ArrowLeft')) {
              return prevRotation + alpha
            } else if (keysPressed.current.has('ArrowRight')) {
              return prevRotation + alpha
            }
            return prevRotation
          })

          if (keysPressed.current.has('ArrowLeft')) {
            return Math.max(prevSteeringLock - STEERING_CHANGE, -35)
          } else if (keysPressed.current.has('ArrowRight')) {
            return Math.min(prevSteeringLock + STEERING_CHANGE, 35)
          } else if (prevSteeringLock == 0) {
            return prevSteeringLock
          } else {
            if (prevSteeringLock > 0) {
              return prevSteeringLock - Math.min(2, prevSteeringLock)
            } else {
              return prevSteeringLock + Math.min(2, 0 - prevSteeringLock)
            }
          }
        })
      }
    }

    const intervalId = setInterval(handleKeyPresses, LOOP_TIME)

    window.addEventListener('keydown', keydownHandler)
    window.addEventListener('keyup', keyupHandler)

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('keydown', keydownHandler);
      window.removeEventListener('keyup', keyupHandler);
    };
  }, [])

  return (
    <>
      <Head>
        <title>F1 game</title>
        <meta name="description" content="A fun online f1 game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div ref={divRef} style={{ position: 'absolute', width: '100vw', height: '100vh' }}>
        <div style={{ position: 'absolute', display: 'inline-block', top, left, transform: `rotate(${rotation}deg)` }}>
          <Car width={200} steeringLock={steeringLock} />
        </div>
      </div>
    </>
  )
};

export default Home;
