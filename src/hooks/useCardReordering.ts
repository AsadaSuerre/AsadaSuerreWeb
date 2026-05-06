import { useState } from 'react';
import { DropResult } from '@hello-pangea/dnd';
import { DataService } from '../services/dataService';

interface UseCardReorderingProps {
  data: any[];
  setData: (data: any[]) => void;
  fetchFunction: () => Promise<any[]>;
  isAuthenticated: boolean;
}

export const useCardReordering = ({
  data,
  setData,
  fetchFunction,
  isAuthenticated,
}: UseCardReorderingProps) => {
  const [isReordering, setIsReordering] = useState(false);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !isAuthenticated) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    const reorderedItems = Array.from(data);
    const [reorderedItem] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(destinationIndex, 0, reorderedItem);

    setData(reorderedItems);

    const sortUpdateItems = reorderedItems.map((item: any, index: number) => ({
      id: Number(item.id),
      sort_order: index
    }));

    setIsReordering(true);
    try {
      await DataService.reorderCards(sortUpdateItems);
    } catch (error) {
      console.error('Error reordering:', error);
      const revertedData = await fetchFunction();
      setData(revertedData);
    } finally {
      setIsReordering(false);
    }
  };

  return { handleDragEnd, isReordering };
};
