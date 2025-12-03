export enum ShapeType {
  SPHERE = 'Sphere',
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  BUDDHA = 'Buddha',
  SPIRAL = 'Spiral',
  FIREWORK = 'Firework'
}

export interface ParticleState {
  color: string;
  shape: ShapeType;
  tension: number; // 0.0 to 1.0 (Relaxed to Tense)
  isConnected: boolean;
}
