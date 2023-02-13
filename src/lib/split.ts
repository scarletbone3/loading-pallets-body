import type { Place } from '../types/Place';
import type { Pallet } from '../types/Pallet';
import { Split } from '../enums/SplitEnum'; 

export interface ISplitter {
  split(place: Place, pallet: Pallet): Place[];
}

abstract class Slpitter implements ISplitter {
  private padding: number;

  constructor(padding: number = 0) {
    this.padding = padding;
  }

  abstract split(place: Place, pallet: Pallet): Place[];
  
  protected splitHorizontaly(place: Place, pallet: Pallet): Place[] {
    const lowerPlace: Place = {
      ...place,
      x: place.x + pallet.length + this.padding,
      length: place.length - pallet.length - this.padding,
      width: pallet.width,
    }
    const upperPlace: Place = {
      ...place,
      y: place.y + pallet.width + this.padding,
      width: place.width - pallet.width - this.padding
    }

    return [lowerPlace, upperPlace].filter(place => place.length > 0 && place.width > 0);
  }

  protected splitVerticaly(place: Place, pallet: Pallet): Place[] {
    const leftPlace: Place = {
      ...place,
      y: place.y + pallet.width + this.padding,
      length: pallet.length,
      width: place.width - pallet.width - this.padding,
    }
    const rightPlace: Place = {
      ...place,
      x: place.x + pallet.length + this.padding,
      length: place.length - pallet.length - this.padding,
    }

    return [leftPlace, rightPlace].filter(place => place.length > 0 && place.width > 0);
  }
}

class ShortAxisSplit extends Slpitter implements ISplitter {
  split(place: Place, pallet: Pallet): Place[] {
    if (place.length < place.width) {
      return this.splitHorizontaly(place, pallet);
    } else {
      return this.splitVerticaly(place, pallet);
    }
  }
}

class LongAxisSplit extends Slpitter implements ISplitter {
  split(place: Place, pallet: Pallet): Place[] {
    if (place.length >= place.width) {
      return this.splitHorizontaly(place, pallet);
    } else {
      return this.splitVerticaly(place, pallet);
    }
  }
}

class ShortLeftoverAxisSplit extends Slpitter implements ISplitter {
  split(place: Place, pallet: Pallet): Place[] {
    if (place.length - pallet.length < place.width - pallet.width) {
      return this.splitHorizontaly(place, pallet);
    } else {
      return this.splitVerticaly(place, pallet);
    }
  }
}

class LongLeftoverAxisSplit extends Slpitter implements ISplitter {
  split(place: Place, pallet: Pallet): Place[] {
    if (place.length - pallet.length >= place.width - pallet.width) {
      return this.splitHorizontaly(place, pallet);
    } else {
      return this.splitVerticaly(place, pallet)
    }
  }
}

export const getSplitter = (split: Split, padding: number): ISplitter => {
  switch (split) {
    case Split.LONG_AXIS:
      return new LongAxisSplit(padding);
    case Split.SHORT_AXIS:
      return new ShortAxisSplit(padding);
    case Split.LONG_LEFTOVER_AXIS:
      return new LongLeftoverAxisSplit(padding);
    case Split.SHORT_LEFTOVER_AXIS:
      return new ShortLeftoverAxisSplit(padding);
    default:
      return new LongAxisSplit(padding);
  }
}
