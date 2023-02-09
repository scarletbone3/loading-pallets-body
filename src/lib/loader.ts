import type { Pallet } from '../types/Pallet';
import { SortBy } from '../enums/SortByEnum';
import { SortDirection } from '../enums/SortDirectionEnum';
import type { LoadedPallet } from '../types/LoadedPallet';
import type { Place } from '../types/Place';

import { Sort, getAlgorithm } from './sort';

type LoaderResult = LoadedPallet[];

export const loader = (
  bodyLength: number,
  bodyWidth: number,
  pallets: Pallet[],
  sideLoading: boolean = true,
  backLoading: boolean = false,
  sortBy: SortBy = SortBy.AREA,
  sortDirection: SortDirection = SortDirection.ASC,
): LoaderResult => {
  if (bodyLength === 0 || bodyWidth === 0 || !pallets.length) {
    return [];
  }

  const sorter = new Sort(getAlgorithm(sortBy), sortDirection);
  const sortedPallets = sorter.sort(pallets);
  const sortedPalletsLength = sortedPallets.length;

  if (
    (sortedPallets[0].length > bodyLength || sortedPallets[0].width > bodyWidth) &&
    (sortedPallets[sortedPalletsLength - 1].length > bodyLength ||
     sortedPallets[sortedPalletsLength - 1].width > bodyWidth)
  ) {
    return [];
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
    
  }

  return loadedPallets;
}
