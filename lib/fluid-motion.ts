/**
 * Apple-style fluid motion primitives (WWDC 2018, Designing Fluid Interfaces).
 * Springs are interruptible and velocity-aware; rubber-banding resists past a bound
 * instead of freezing; projection picks a rest point from release velocity.
 */

export function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  const size = Math.max(1, dimension);
  return (overshoot * size * constant) / (size + constant * Math.abs(overshoot));
}

export function rubberbandIfOutOfBounds(
  value: number,
  min: number,
  max: number,
  constant = 0.55,
) {
  if (value < min) {
    return min + rubberband(value - min, Math.max(1, max - min), constant);
  }
  if (value > max) {
    return max + rubberband(value - max, Math.max(1, max - min), constant);
  }
  return value;
}

/** Exponential-decay projection Apple ships. `initialVelocity` is px/s. */
export function project(initialVelocity: number, decelerationRate = 0.998) {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

export function unboundedProgress(scroll: number, start: number, end: number) {
  const range = end - start;
  if (range === 0) return 0;
  return (scroll - start) / range;
}

/** Map a possibly-unbounded 0…1 progress through a rubber band at both ends. */
export function rubberbandedUnit(progress: number, rangePx: number, constant = 0.55) {
  const dimension = Math.max(1, rangePx);
  if (progress < 0) {
    return rubberband(progress * dimension, dimension, constant) / dimension;
  }
  if (progress > 1) {
    return 1 + rubberband((progress - 1) * dimension, dimension, constant) / dimension;
  }
  return progress;
}

export function edgeStretch(progress: number) {
  if (progress < 0) return progress;
  if (progress > 1) return progress - 1;
  return 0;
}

function springAccel(
  value: number,
  target: number,
  velocity: number,
  dampingRatio: number,
  response: number,
) {
  const omega = (2 * Math.PI) / Math.max(0.08, response);
  const stiffness = omega * omega;
  const damping = 2 * dampingRatio * omega;
  return (target - value) * stiffness - velocity * damping;
}

export class Spring {
  value: number;
  velocity: number;
  target: number;
  dampingRatio: number;
  response: number;

  constructor(value = 0, dampingRatio = 1, response = 0.4) {
    this.value = value;
    this.velocity = 0;
    this.target = value;
    this.dampingRatio = dampingRatio;
    this.response = response;
  }

  setImmediate(value: number) {
    this.value = value;
    this.target = value;
  }

  step(dt: number) {
    const clamped = Math.min(1 / 30, Math.max(0.001, dt));
    const accel = springAccel(
      this.value,
      this.target,
      this.velocity,
      this.dampingRatio,
      this.response,
    );
    this.velocity += accel * clamped;
    this.value += this.velocity * clamped;
  }
}

export class Spring2D {
  x: Spring;
  y: Spring;

  constructor(dampingRatio = 1, response = 0.4) {
    this.x = new Spring(0, dampingRatio, response);
    this.y = new Spring(0, dampingRatio, response);
  }

  set dampingRatio(value: number) {
    this.x.dampingRatio = value;
    this.y.dampingRatio = value;
  }

  set response(value: number) {
    this.x.response = value;
    this.y.response = value;
  }

  setImmediate(x: number, y: number) {
    this.x.setImmediate(x);
    this.y.setImmediate(y);
  }

  setTarget(x: number, y: number) {
    this.x.target = x;
    this.y.target = y;
  }

  setVelocity(vx: number, vy: number) {
    this.x.velocity = vx;
    this.y.velocity = vy;
  }

  step(dt: number) {
    this.x.step(dt);
    this.y.step(dt);
  }
}

export class VelocityTracker {
  private samples: Array<{ t: number; x: number; y: number }> = [];

  reset() {
    this.samples.length = 0;
  }

  add(x: number, y: number, time = performance.now()) {
    this.samples.push({ t: time, x, y });
    const cutoff = time - 90;
    while (this.samples.length > 1 && this.samples[0].t < cutoff) {
      this.samples.shift();
    }
  }

  velocity() {
    if (this.samples.length < 2) return { x: 0, y: 0 };
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    const dt = (last.t - first.t) / 1000;
    if (dt <= 1e-4) return { x: 0, y: 0 };
    return { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt };
  }
}

export function tickerDt(gsapTicker: { deltaRatio: (fps?: number) => number }) {
  return Math.min(1 / 30, Math.max(0.001, gsapTicker.deltaRatio(60) / 60));
}
