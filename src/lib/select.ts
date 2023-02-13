import type { Place } from '../types/Place';
import type { Pallet } from '../types/Pallet';
import { Select } from '../enums/SelectEnum';

export interface ISelector {
  getSortValue(place: Place, pallet: Pallet): number;
}

export class Selector {
  private selector: ISelector;
  
  constructor(selector: ISelector) {
    this.selector = selector;
  }

  public select(places: Place[], pallet: Pallet): Place | null {
    const [bestPlace] = places
      .filter(place => place.length - pallet.length >= 0 && place.width - pallet.width >= 0)
      .map(place => ({ place, sortValue: this.selector.getSortValue(place, pallet) }))
      .sort((a, b) => a.sortValue - b.sortValue);
    
    return bestPlace?.place || null;
  }
}

class BestShortSideFit implements ISelector {
  getSortValue(place: Place, pallet: Pallet): number {
    return Math.min(place.length - pallet.length, place.width - pallet.width);
  }
}

class BestLongSideFit implements ISelector {
  getSortValue(place: Place, pallet: Pallet): number {
    return Math.max(place.length - pallet.length, place.width - pallet.width);
  }
}

class BestAreaFit implements ISelector {
  getSortValue(place: Place, pallet: Pallet): number {
    return place.length * place.width;
  }
}

export const getSelector = (select: Select): ISelector => {
  switch (select) {
    case Select.BEST_SHORT_SIDE_FIT:
      return new BestShortSideFit();
    case Select.BEST_LONG_SIDE_FIT:
      return new BestLongSideFit();
    case Select.BEST_AREA_FIT:
      return new BestAreaFit();
    default:
      return new BestShortSideFit();
  }
}
