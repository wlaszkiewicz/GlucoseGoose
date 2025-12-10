import { useMemo } from "react";
import { LegendItem } from "../../../types/chart";
import { getLegendItems } from "../../../utils/chartUtils/legendItems";

export const useLegendData = () => {
  const legendItems = useMemo(() => getLegendItems(), []);

  return { legendItems };
};
