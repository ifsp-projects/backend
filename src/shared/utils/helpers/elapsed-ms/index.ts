export const elapsedMs = (started: number): number =>
  Math.round(performance.now() - started)
