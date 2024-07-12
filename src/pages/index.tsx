import { type NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";

const Home: NextPage = () => {
  const divRef = useRef<HTMLDivElement>(null)
  const [xPos, setXPos] = useState(0)
  const [yPos, setYPos] = useState(0)
  const [divWidth, setDivWidth] = useState(0)
  const [divHeight, setDivHeight] = useState(0)
  const keysPressed = useRef<Set<string>>(new Set())

  const keydownHandler = (e: KeyboardEvent) => {
    keysPressed.current.add(e.key)
  }
  const keyupHandler = (e: KeyboardEvent) => {
    keysPressed.current.delete(e.key)
  }

  useEffect(() => {
    const updatePosition = () => {
      setXPos(prevX => {
        if (keysPressed.current.has('ArrowLeft')) {
          return prevX - 2;
        } else if (keysPressed.current.has('ArrowRight')) {
          return prevX + 2;
        }
        return prevX;
      });
      setYPos(prevY => {
        if (keysPressed.current.has('ArrowUp')) {
          return prevY - 2;
        } else if (keysPressed.current.has('ArrowDown')) {
          return prevY + 2;
        }
        return prevY;
      });
    }

    const intervalId = setInterval(updatePosition, 16)

    window.addEventListener('keydown', keydownHandler)
    window.addEventListener('keyup', keyupHandler)

    const height = divRef.current?.getBoundingClientRect().height
    const width = divRef.current?.getBoundingClientRect().width
    setDivWidth(width ?? 0)
    setDivHeight(height ?? 0)
    setXPos((width ?? 0) / 2)
    setYPos((height ?? 0) / 2)

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
        <svg width={divWidth} height={divHeight}>
          <rect x={xPos} y={yPos} width="20" height="20" fill="black" />
        </svg>
      </div>
    </>
  )
};

export default Home;
