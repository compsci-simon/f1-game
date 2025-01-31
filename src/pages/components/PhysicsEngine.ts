import { Car } from "./Car"

const ROLLING_RESISTANCE = 10

export class PhysicsEngine {
  private mapBitmap: number[][] = []

  carOnTrack(x: number, y: number) {
    const row = this.mapBitmap.at(Math.floor(y))
    const pixel = row?.at(Math.floor(x))
    return pixel ?? 0 > 0
  }

  applyPhysics(car: Car, deltaTime: number) {
    let steeringAngleRad = 0
    if (car.steeringInput != 0) {
      const newSteeringAngle = Math.max(Math.min(car.currentSteeringAngle + (car.steeringInput * car.maxSteeringAngle) * deltaTime * 1000, car.maxSteeringAngle), -car.maxSteeringAngle)
      car.currentSteeringAngle = newSteeringAngle
      steeringAngleRad = this.degreesToRadians(car.currentSteeringAngle)
    } else if (car.currentSteeringAngle != 0) {
      const change = car.currentSteeringAngle > 0 ? Math.min(-1, -car.currentSteeringAngle) : Math.max(1, car.currentSteeringAngle)
      const newSteeringAngle = car.currentSteeringAngle += change
      car.currentSteeringAngle = newSteeringAngle
      steeringAngleRad = this.degreesToRadians(car.currentSteeringAngle)
    }

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
