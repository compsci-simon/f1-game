import { MutableRefObject, useEffect, useRef } from "react"

const ROLLING_RESISTANCE = 10

class Car {
  position: Vector2;
  velocity: number;
  angle: number;
  steeringInput: number;
  accelerationInput: number;
  maxSteeringAngle: number;
  maxAcceleration: number;
  wheelbase: number

  constructor(position: Vector2, velocity: number, angle: number) {
    this.position = position;
    this.velocity = velocity;
    this.angle = angle;
    this.steeringInput = 0;
    this.accelerationInput = 0;
    this.maxSteeringAngle = 30;  // degrees
    this.maxAcceleration = 300;  // units per second^2
    this.wheelbase = 50
  }

  update(deltaTime: number, physicsEngine: PhysicsEngine) {
    physicsEngine.applyPhysics(this, deltaTime);
  }

  getState() {
    return {
      position: this.position,
      velocity: this.velocity,
      angle: this.angle
    };
  }
}

export class PhysicsEngine {
  applyPhysics(car: Car, deltaTime: number) {
    const steeringAngleRad = this.degreesToRadians(car.steeringInput * car.maxSteeringAngle);

    car.velocity += car.accelerationInput * car.maxAcceleration * deltaTime;
    // Wind resistance
    const deceleration = 1.225 * 1 / 2 * 0.4 * 2 * car.velocity
    car.velocity = Math.max(car.velocity - (deceleration + ROLLING_RESISTANCE) * deltaTime, 0)

    const turningRadius = car.steeringInput !== 0 ? car.wheelbase / Math.tan(steeringAngleRad) : Infinity;

    if (turningRadius !== Infinity) {
      const angularVelocity = car.velocity / turningRadius;
      car.angle += angularVelocity * deltaTime;
      car.position.x += car.velocity * Math.cos(car.angle) * deltaTime;
      car.position.y += car.velocity * Math.sin(car.angle) * deltaTime;
    } else {
      car.position.x += car.velocity * Math.cos(car.angle) * deltaTime;
      car.position.y += car.velocity * Math.sin(car.angle) * deltaTime;
    }
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
  private context: CanvasRenderingContext2D;
  private divRef: MutableRefObject<HTMLDivElement>

  constructor(context: CanvasRenderingContext2D, divRef: MutableRefObject<HTMLDivElement>) {
    this.physicsEngine = new PhysicsEngine();
    this.car = new Car(new Vector2(100, 100), 0, 0);
    this.running = true;
    this.context = context;
    this.divRef = divRef

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
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
  }

  private update(deltaTime: number) {
    this.car.update(deltaTime, this.physicsEngine)
    this.divRef.current.innerHTML = `${this.car.velocity}`
  }

  private render() {
    this.context.clearRect(0, 0, 800, 600);  // Clear the canvas
    this.renderCar(this.car)
  }

  private renderCar(car: Car) {
    this.context.save();
    this.context.translate(car.position.x, car.position.y);
    this.context.rotate(car.angle);
    this.context.fillStyle = 'blue';
    this.context.fillRect(-25, -12.5, 50, 25);  // Simple car representation
    this.context.restore();
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
        car.steeringInput = -1;
        break;
      case 'ArrowRight':
        car.steeringInput = 1;
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    gameEngine.current = new GameEngine(context, divRef);
    gameEngine.current.gameLoop();

    return () => {
      gameEngine.current?.stop();
    };
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      <canvas ref={canvasRef} width={1600} height={1200} />
      <div ref={divRef} style={{ position: 'absolute', fontSize: '20px' }}>
        test
      </div>
    </div>
  )
}