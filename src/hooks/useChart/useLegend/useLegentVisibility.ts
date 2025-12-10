import { useMemo } from "react";
import { LegendItem, VisibleEventTypes } from "../../../types/chart";
import { getEventCategory } from "../../../utils/chartUtils/chartUtils";

export const useLegendVisibility = () => {
  const getVisibleItems = useMemo(
    () =>
      (
        legendItems: LegendItem[],
        chartEvents: any[],
        visibleEventTypes: VisibleEventTypes
      ) => {
        const hasEventsInCategory = (category: string): boolean => {
          return chartEvents.some(
            (event) => getEventCategory(event) === category
          );
        };

        const visibleItems = legendItems.filter((item) => {
          // Check if any events exist for this category
          const hasEvents = hasEventsInCategory(item.category);

          // Check if this type should be visible based on settings
          const isTypeVisible =
            visibleEventTypes[item.category as keyof VisibleEventTypes] ?? true;

          return hasEvents && isTypeVisible;
        });

        return visibleItems;
      },
    []
  );

  return { getVisibleItems };
};
