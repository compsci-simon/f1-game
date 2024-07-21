import { MutableRefObject, RefObject } from "react";
import { PhysicsEngine } from "./PhysicsEngine";

class Vector2 {
  constructor(public x: number, public y: number) { }
}

export class Car {
  position: Vector2;
  velocity: number;
  angle: number;
  steeringInput: number;
  accelerationInput: number;
  maxSteeringAngle: number;
  maxAcceleration: number;
  wheelbase: number;
  weight: number
  width: number
  length: number
  currentSteeringAngle: number
  divRef: RefObject<HTMLDivElement>


  constructor(position: { x: number, y: number }, velocity: number, angle: number, divRef: RefObject<HTMLDivElement>
  ) {
    this.position = position;
    this.velocity = velocity;
    this.angle = angle;
    this.steeringInput = 0;
    this.accelerationInput = 0;
    this.currentSteeringAngle = 0
    this.maxSteeringAngle = 40;  // degrees
    this.maxAcceleration = 100;  // units per second^2
    this.wheelbase = 36
    this.weight = 798
    this.width = 20
    this.length = 56.3
    this.divRef = divRef
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
      currentSteeringAngle: this.currentSteeringAngle,
      velocity: this.velocity.toFixed(3),
      angle: this.angle.toFixed(3)
    };
  }

  render() {
    this.divRef.current!.innerHTML = `
      <img src='rb19-clean.svg' />
    `
    this.divRef.current!.style.transform = 'translate(-50%, -50%) scale(0.2)'
  }
}