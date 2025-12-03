import { ActivityType } from '../components/Journal/SportsSection';

export interface UserProfile {
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female';
}

export interface ActivityCalculation {
  activityType: ActivityType;
  duration: number;
  intensity: 'Low' | 'Medium' | 'High';
  userProfile?: UserProfile;
  weight?: number;
}

export interface CalculationResult {
  calories: number;
  estimatedDistance?: number;
  details: {
    metValue: number;
    weightUsed: number;
    formula: string;
    bmr?: number;
  };
}

const MET_VALUES: Record<ActivityType, { low: number; medium: number; high: number }> = {
  Walking: { low: 2.5, medium: 3.5, high: 4.5 },
  Running: { low: 7.0, medium: 8.5, high: 10.0 },
  Cycling: { low: 4.0, medium: 6.0, high: 8.0 },
  Swimming: { low: 5.0, medium: 7.0, high: 9.0 },
  Yoga: { low: 2.0, medium: 3.0, high: 4.0 },
  'Weight Training': { low: 3.0, medium: 5.0, high: 7.0 },
  Hiking: { low: 4.0, medium: 6.0, high: 8.0 },
  Dancing: { low: 3.5, medium: 5.5, high: 7.5 },
  'Team Sports': { low: 5.0, medium: 7.0, high: 9.0 },
  Other: { low: 3.0, medium: 4.0, high: 5.0 }
};

const SPEED_RANGES: Record<ActivityType, { low: number; medium: number; high: number }> = {
  Walking: { low: 3.0, medium: 4.5, high: 6.0 },
  Running: { low: 8.0, medium: 10.0, high: 12.0 },
  Cycling: { low: 12.0, medium: 18.0, high: 24.0 },
  Swimming: { low: 1.0, medium: 1.5, high: 2.0 },
  Yoga: { low: 0, medium: 0, high: 0 },
  'Weight Training': { low: 0, medium: 0, high: 0 },
  Hiking: { low: 2.5, medium: 3.5, high: 4.5 },
  Dancing: { low: 3.0, medium: 4.0, high: 5.0 },
  'Team Sports': { low: 4.0, medium: 6.0, high: 8.0 },
  Other: { low: 3.0, medium: 4.0, high: 5.0 }
};

export const calculateCaloriesBurned = ({
  activityType,
  duration,
  intensity,
  weight = 70,
  userProfile
}: ActivityCalculation): CalculationResult => {
  const userWeight = userProfile?.weight || weight;
  
  const metValue = MET_VALUES[activityType][intensity.toLowerCase() as 'low' | 'medium' | 'high'];
  const hours = duration / 60;
  
  const baseCalories = Math.round(metValue * userWeight * hours);
  
  let finalCalories = baseCalories;
  let bmr: number | undefined;

  if (userProfile?.age && userProfile?.gender && userProfile?.height) {
    if (userProfile.gender === 'male') {
      bmr = 10 * userWeight + 6.25 * userProfile.height - 5 * userProfile.age + 5;
    } else {
      bmr = 10 * userWeight + 6.25 * userProfile.height - 5 * userProfile.age - 161;
    }
    
    finalCalories = Math.round(baseCalories + (bmr / 24) * hours);
  }
  
  const formula = `${metValue} MET × ${userWeight}kg × ${duration}min ÷ 60`;
  
  return {
    calories: finalCalories,
    details: {
      metValue,
      weightUsed: userWeight,
      formula,
      bmr
    }
  };
};

export const estimateDistance = (
  activityType: ActivityType,
  duration: number,
  intensity: 'Low' | 'Medium' | 'High'
): number | null => {
  const speed = SPEED_RANGES[activityType][intensity.toLowerCase() as 'low' | 'medium' | 'high'];
  if (speed === 0) return null;
  
  const hours = duration / 60;
  const distance = speed * hours;
  
  return Math.round(distance * 10) / 10;
};

export const getMETValue = (activityType: ActivityType, intensity: 'Low' | 'Medium' | 'High'): number => {
  return MET_VALUES[activityType][intensity.toLowerCase() as 'low' | 'medium' | 'high'];
};

export const getIntensityDescription = (metValue: number): string => {
  if (metValue < 3) return "Light intensity";
  if (metValue < 6) return "Moderate intensity";
  return "Vigorous intensity";
};