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

  constructor(position: { x: number, y: number }, velocity: number, angle: number) {
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