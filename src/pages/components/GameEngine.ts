import { RefObject } from "react";
import { Car } from "./Car";
import { PhysicsEngine } from "./PhysicsEngine";

export
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
    this.car = new Car({ x: 100, y: 100 }, 0, 1.5, carDiv);
    this.running = true;
    this.carDiv = carDiv
    this.divRef = divRef
    this.innerMapDiv = innerMapDiv
    this.outerMapDiv = outerMapDiv
    this.mapDimensions = { width: 0, height: 0 }

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    this.car.render()
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
    this.renderMap(this.car)
  }

  private renderMap(car: Car) {
    if (this.outerMapDiv.current && this.innerMapDiv.current) {
      this.outerMapDiv.current!.style.position = 'absolute'
      this.outerMapDiv.current!.style.transformOrigin = 'center'
      this.outerMapDiv.current!.style.top = '50%'
      this.outerMapDiv.current!.style.left = '50%'
      // this.outerMapDiv.current!.style.width = '10px'
      // this.outerMapDiv.current!.style.height = '10px'
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
