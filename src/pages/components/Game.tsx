import { RefObject, useEffect, useRef } from "react"
import { trpc } from "../../utils/trpc";
import { QueryCache } from "@tanstack/react-query";

const ROLLING_RESISTANCE = 10

class Car {
  position: Vector2;
  velocity: number;
  angle: number;
  steeringInput: number;
  accelerationInput: number;
  maxSteeringAngle: number;
  maxAcceleration: number;
  wheelbase: number;

  constructor(position: Vector2, velocity: number, angle: number) {
    this.position = position;
    this.velocity = velocity;
    this.angle = angle;
    this.steeringInput = 0;
    this.accelerationInput = 0;
    this.maxSteeringAngle = 30;  // degrees
    this.maxAcceleration = 100;  // units per second^2
    this.wheelbase = 20
  }

  update(deltaTime: number, physicsEngine: PhysicsEngine) {
    physicsEngine.applyPhysics(this, deltaTime);
  }

  getState() {
    return {
      position: {
        x: Math.round(this.position.x),
        y: Math.round(this.position.y),
      },
      velocity: this.velocity.toFixed(3),
      angle: this.angle.toFixed(3)
    };
  }
}

export class PhysicsEngine {
  private mapBitmap: number[][] = []

  carOnTrack(x: number, y: number) {
    const row = this.mapBitmap.at(Math.floor(y))
    const pixel = row?.at(Math.floor(x))
    return pixel ?? 0 > 0
  }

  applyPhysics(car: Car, deltaTime: number) {
    const steeringAngleRad = this.degreesToRadians(car.steeringInput * car.maxSteeringAngle);

    const isOnTrack = this.carOnTrack(car.position.x, car.position.y)
    car.velocity += car.accelerationInput * (isOnTrack ? 1 : 0.5) * car.maxAcceleration * deltaTime;
    // Wind resistance
    const deceleration = 1.225 * 1 / 2 * 0.4 * 2 * car.velocity
    car.velocity = Math.max(car.velocity - (deceleration + ROLLING_RESISTANCE) * deltaTime, 0)

    const turningRadius = car.steeringInput !== 0 ? car.wheelbase / Math.tan(steeringAngleRad) : Infinity;

    if (turningRadius !== Infinity) {
      const angularVelocity = car.velocity / turningRadius;
      car.angle += angularVelocity * deltaTime;
      car.position.x -= car.velocity * Math.cos(car.angle) * deltaTime;
      car.position.y -= car.velocity * Math.sin(car.angle) * deltaTime;
    } else {
      car.position.x -= car.velocity * Math.cos(car.angle) * deltaTime;
      car.position.y -= car.velocity * Math.sin(car.angle) * deltaTime;
    }
  }

  setMapBitmap(mapBitmap: number[][]) {
    this.mapBitmap = mapBitmap
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

class Vector2 {
  constructor(public x: number, public y: number) { }
}

class GameEngine {
  private physicsEngine: PhysicsEngine;
  private car: Car;
  private running: boolean;
  private carDiv: RefObject<HTMLDivElement>
  private divRef: RefObject<HTMLDivElement>
  private innerMapDiv: RefObject<HTMLDivElement>
  private outerMapDiv: RefObject<HTMLDivElement>
  private mapDimensions: { width: number, height: number }

  constructor(carDiv: RefObject<HTMLDivElement>, divRef: RefObject<HTMLDivElement>, outerMapDiv: RefObject<HTMLDivElement>, innerMapDiv: RefObject<HTMLDivElement>) {
    this.physicsEngine = new PhysicsEngine();
    this.car = new Car(new Vector2(4383.153362034339, 4090.7298612824898), 0, -0.012928386286469444);
    this.car = new Car(new Vector2(100, 100), 0, 1.5);
    this.running = true;
    this.carDiv = carDiv
    this.divRef = divRef
    this.innerMapDiv = innerMapDiv
    this.outerMapDiv = outerMapDiv
    this.mapDimensions = { width: 0, height: 0 }

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  setMapDimensions(width: number, height: number) {
    this.mapDimensions.width = width
    this.mapDimensions.height = height
  }

  setBitmap(bitmap: number[][]) {
    this.physicsEngine.setMapBitmap(bitmap)
  }

  gameLoop() {
    let lastTime = performance.now();

    const loop = () => {
      if (!this.running) return;

      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000;  // convert ms to seconds
      lastTime = currentTime;

      this.update(deltaTime);
      this.render();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    setInterval(() => {
      this.divRef.current!.innerHTML = JSON.stringify({
        ...this.car.getState(),
        onTrack: this.physicsEngine.carOnTrack(this.car.position.x, this.car.position.y)
      })
    }, 100)
  }

  private update(deltaTime: number) {
    this.car.update(deltaTime, this.physicsEngine)
  }

  private render() {
    this.renderCar(this.car)
  }

  private renderCar(car: Car) {
    if (this.outerMapDiv.current && this.innerMapDiv.current) {
      this.outerMapDiv.current!.style.position = 'absolute'
      this.outerMapDiv.current!.style.transformOrigin = 'center'
      this.outerMapDiv.current!.style.top = '50%'
      this.outerMapDiv.current!.style.left = '50%'
      this.outerMapDiv.current!.style.width = '10px'
      this.outerMapDiv.current!.style.height = '10px'
      this.outerMapDiv.current!.style.transform = `rotate(${(-(car.angle - Math.PI / 2) / Math.PI * 180)}deg)`
      this.outerMapDiv.current!.style.backgroundColor = 'lightblue'
      this.innerMapDiv.current!.style.position = 'absolute'
      this.innerMapDiv.current!.style.transformOrigin = 'center'
      this.innerMapDiv.current!.style.height = `${this.mapDimensions.height}px`
      this.innerMapDiv.current!.style.width = `${this.mapDimensions.width}px`
      this.innerMapDiv.current!.style.transform = `translate(${-car.position.x}px, ${-car.position.y}px)`
      this.innerMapDiv.current!.style.border = '1px solid'
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    const car = this.car;
    switch (event.key) {
      case 'ArrowUp':
        car.accelerationInput = 1;
        break;
      case 'ArrowDown':
        car.accelerationInput = -1;
        break;
      case 'ArrowLeft':
        car.steeringInput = Math.max(-1, car.steeringInput - 0.2);
        break;
      case 'ArrowRight':
        car.steeringInput = Math.min(1, car.steeringInput + 0.2);
        break;
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    const car = this.car;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        car.accelerationInput = 0;
        break;
      case 'ArrowLeft':
        car.steeringInput = 0;
      case 'ArrowRight':
        car.steeringInput = 0;
        break;
    }
  }

  stop() {
    this.running = false;
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}

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
      const canvas = document.getElementById('canvas')
      const context = canvas.getContext('2d')
      canvas!.height = data!.height
      canvas!.width = data!.width
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