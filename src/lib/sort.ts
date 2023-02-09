import type { Pallet } from '../types/Pallet';
import { SortDirection } from '../enums/SortDirectionEnum';
import { SortBy } from '../enums/SortByEnum';

export interface Algorithm {
  compare(a: Pallet, b: Pallet): number;
}

export class Sort {
  private algorithm: Algorithm;
  private sortDirection: SortDirection;

  constructor(algorithm: Algorithm, sortDirection: SortDirection) {
    this.algorithm = algorithm;
    this.sortDirection = sortDirection;
  }

  public sort(pallets: Pallet[]): Pallet[] {
    const sortedPallets: Pallet[] = [...pallets].sort(this.algorithm.compare);
    return this.sortDirection === SortDirection.DESC ? sortedPallets.reverse() : sortedPallets;
  }
}

class ShortSide implements Algorithm {
  compare(a: Pallet, b: Pallet): number {
    return Math.min(a.length, a.width) - Math.min(b.length, b.width);
  }
}

class LongSide implements Algorithm {
  compare(a: Pallet, b: Pallet): number {
    return Math.max(a.length, a.width) - Math.max(b.length, b.width);
  }
}

class Perimeter implements Algorithm {
  compare(a: Pallet, b: Pallet): number {
    return (2 * a.length + 2 * a.width) - (2 * b.length + 2 * b.width);
  }
}

class Area implements Algorithm {
  compare(a: Pallet, b: Pallet): number {
    return (a.length * a.width) - (b.length * b.width);
  }
}

export const getAlgorithm = (sortBy: SortBy): Algorithm => {
  switch (sortBy) {
    case SortBy.SHORT_SIDE:
      return new ShortSide();
    case SortBy.LONG_SIDE:
      return new LongSide();
    case SortBy.PERIMETER:
      return new Perimeter();
    case SortBy.AREA:
      return new Area();
    default:
      return new Area();
  }
}
