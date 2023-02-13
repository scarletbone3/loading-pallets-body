import type { Pallet } from '../types/Pallet';
import { SortBy } from '../enums/SortByEnum';
import { SortDirection } from '../enums/SortDirectionEnum';
import { Split } from '../enums/SplitEnum';
import { Select } from '../enums/SelectEnum';
import type { LoadedPallet } from '../types/LoadedPallet';
import type { Place } from '../types/Place';

import { Sort, getSorter } from './sort';
import { Selector, getSelector } from './select';
import { getSplitter } from './split';

type LoaderResult = LoadedPallet[];

export const loader = (
  bodyLength: number,
  bodyWidth: number,
  pallets: Pallet[],
  padding: number,
  sideLoading: boolean = true,
  backLoading: boolean = false,
  sortBy: SortBy = SortBy.AREA,
  sortDirection: SortDirection = SortDirection.ASC,
  selectBy: Select = Select.BEST_LONG_SIDE_FIT,
  splitBy: Split = Split.LONG_AXIS,
): LoaderResult => {
  if (bodyLength === 0 || bodyWidth === 0 || !pallets.length) {
    return [];
  }

  const sorter = new Sort(getSorter(sortBy), sortDirection);
  const selector = new Selector(getSelector(selectBy));
  const splitter = getSplitter(splitBy, padding);

  const sortedPallets = sorter.sort(pallets);
  const sortedPalletsLength = sortedPallets.length;

  if (
    (sortedPallets[0].length > bodyLength || sortedPallets[0].width > bodyWidth) &&
    (sortedPallets[sortedPalletsLength - 1].length > bodyLength ||
     sortedPallets[sortedPalletsLength - 1].width > bodyWidth)
  ) {
    return [];
  }

  const rotatePallet = (pallet: Pallet) => {
    return { ...pallet, length: pallet.length, width: pallet.width };
  }

  const getSelectionOptions = (pallet: Pallet) => {
    const place = selector.select(freePlace, pallet);
    if (!place) {
      return null;
    }
    const splitPlaces = splitter.split(place, pallet);
    return {
      place,
      splitPlaces,
      pallet,
    }
  }

  const selectPlaceOption = (pallet: Pallet) => {
    const originalOption = getSelectionOptions(pallet);
    const rotatedOption = pallet.allowRotation ? getSelectionOptions(rotatePallet(pallet)) : null;

    if (originalOption === null && rotatedOption === null) {
      return null;
    } else if (originalOption === null) {
      return rotatedOption;
    } else if (rotatedOption === null) {
      return originalOption;
    } else {
      const biggestSplitPlace = 
        (splitPlaces: Place[]) => Math.max(...splitPlaces.map(place => place.length * place.width));
      
      const originalMax = biggestSplitPlace(originalOption.splitPlaces) | 0;
      const rotatedMax = biggestSplitPlace(rotatedOption.splitPlaces) | 0;

      if (originalMax >= rotatedMax) {
        return originalOption;
      } else {
        return rotatedOption;
      }
    }
  }

  const freePlace: Place[] = [
    {
      length: bodyLength,
      width: bodyWidth,
      x: 0,
      y: 0,
    },
  ];

  const loadedPallets: LoadedPallet[] = [];
  let i = 0;
  while (!freePlace.length && i < sortedPalletsLength) {
    const pallet = sortedPallets[i];
    const selectedOption = selectPlaceOption(pallet);
    if (!selectedOption) {
      i += 1;
      continue;
    }

    const { place, splitPlaces } = selectedOption;
    const { length, width, ...other } = selectedOption.pallet;

    const loadedPallet: LoadedPallet = {
      ...other,
      length,
      width,
      x: place.x,
      y: place.y,
    }

    const splittedPlaceIndex = freePlace.findIndex(i => i === place);
    freePlace.splice(splittedPlaceIndex, 1, ...splitPlaces);

    loadedPallets.push(loadedPallet);
  }

  if (backLoading) {
    const loadedPalletsWithoutCenter: LoadedPallet[] = [];
    const loadedPalletsLength: number = loadedPallets.length;

    for (let i = 0; i < loadedPalletsLength; ++i) {
      const pallet = loadedPallets[i];
      let upperPallet = false;
      let lowerPallet = false;

      for (let j = 0; j < loadedPalletsLength; ++j) {
        if (i === j) {
          continue;
        }
        const connectedPallet = loadedPallets[j];
        if (pallet.x >= connectedPallet.x && pallet.x <= connectedPallet.x + connectedPallet.length) {
          if (pallet.y === connectedPallet.y + connectedPallet.width) {
            upperPallet = true;
          }
          if (pallet.y + pallet.width === connectedPallet.y) {
            lowerPallet = true;
          }
        }
      }

      if (upperPallet && lowerPallet) {
        continue;
      }
      loadedPalletsWithoutCenter.push(pallet);
    }

    return loadedPalletsWithoutCenter;
  }

  return loadedPallets;
}
