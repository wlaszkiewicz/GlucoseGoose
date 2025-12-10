export type EventCategory =
  | "meal"
  | "snack"
  | "activity"
  | "insulin"
  | "basal"
  | "target"
  | "device"
  | "note"
  | "other"
  | "unknown";

export interface EventPosition {
  _id: string;
  type: string;
  eventType?: string;
  created_at: string;
  svgX: number;
  chartIndex: number;
  displayTime: string;
  iconX?: number;
  iconY?: number;

  percent?: number;
  insulin?: number;
  rate?: number;
  duration?: number;
  notes?: string;
  carbs?: number;
  protein?: number;
  fat?: number;
  calories?: number;
  caloriesBurned?: number;
  distance?: number;
  intensity?: string;
  targetBottom?: number;
  targetTop?: number;
  reason?: string;
}

export interface LegendItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  category: string;
  isVisible?: boolean;
  showColorExplanation?: boolean;
  colorExplanation?: ColorExplanation;
}

export interface ColorExplanation {
  colors: string[];
  labels: string[];
  icons?: string[];
}

export interface InteractiveLegendProps {
  visibleEventTypes: VisibleEventTypes;
  chartEvents: any[];
}

export interface VisibleEventTypes {
  meals: boolean;
  activities: boolean;
  insulin: boolean;
  tempBasals: boolean;
  targets: boolean;
  deviceEvents: boolean;
  notes: boolean;
  otherEvents: boolean;
}
