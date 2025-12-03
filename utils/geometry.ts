import { ShapeType } from '../types';
import * as THREE from 'three';

export const generateParticles = (count: number, type: ShapeType): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const i3 = i * 3;

    switch (type) {
      case ShapeType.SPHERE: {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = 2 + Math.random() * 0.2;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      case ShapeType.HEART: {
        // Heart surface approximation
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        // Need 3D volume. using rejection sampling or simplified parametric
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI; 
        // 3D Heart parametric
        const u = phi;
        const v = theta;
        const r = 0.15;
        // A simpler heart shape in 3D
        x = 16 * Math.pow(Math.sin(u), 3);
        y = 13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u);
        z = x * Math.cos(v) * 0.5; // Thickness
        // Add some random spread
        x *= r; y *= r; z *= r;
        break;
      }
      case ShapeType.FLOWER: {
        const u = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;
        const r = 2 + Math.sin(5 * u) * Math.sin(5 * v);
        x = r * Math.sin(v) * Math.cos(u);
        y = r * Math.sin(v) * Math.sin(u);
        z = r * Math.cos(v);
        break;
      }
      case ShapeType.SATURN: {
        // Mix of sphere and ring
        const isRing = Math.random() > 0.4;
        if (isRing) {
          const theta = Math.random() * Math.PI * 2;
          const r = 3 + Math.random() * 1.5;
          x = r * Math.cos(theta);
          z = r * Math.sin(theta);
          y = (Math.random() - 0.5) * 0.1;
        } else {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const r = 1.5;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        }
        break;
      }
      case ShapeType.SPIRAL: {
        const theta = Math.random() * Math.PI * 10; // More turns
        const r = 0.2 * theta;
        x = r * Math.cos(theta);
        y = (Math.random() - 0.5) * 2;
        z = r * Math.sin(theta);
        break;
      }
      case ShapeType.FIREWORK: {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = Math.random() * 4;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      case ShapeType.BUDDHA: {
        // Simplified meditative figure using stacked spheres/ellipsoids
        const r = Math.random();
        if (r < 0.3) {
          // Head
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const rad = 0.6;
          x = rad * Math.sin(phi) * Math.cos(theta);
          y = rad * Math.sin(phi) * Math.sin(theta) + 1.8;
          z = rad * Math.cos(phi);
        } else if (r < 0.8) {
          // Body
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const rad = 1.1;
          x = rad * Math.sin(phi) * Math.cos(theta) * 1.2;
          y = rad * Math.sin(phi) * Math.sin(theta);
          z = rad * Math.cos(phi) * 0.8;
        } else {
          // Legs/Base
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const rad = 1.5;
          x = rad * Math.sin(phi) * Math.cos(theta) * 1.5;
          y = rad * Math.sin(phi) * Math.sin(theta) * 0.4 - 1.2;
          z = rad * Math.cos(phi) * 1.5;
        }
        break;
      }
    }

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }
  return positions;
};
