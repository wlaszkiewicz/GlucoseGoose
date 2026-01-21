export interface InsulinAnalysis {
  totalBolusInsulin: number; // Only boluses (meal + correction)
  mealInsulin: number;
  correctionInsulin: number;
  basalAdjustment: number; // Positive = increased basal, Negative = decreased/suspended
  totalInsulinDelivered: number; // Boluses + basal adjustments (positive only)
  mealEvents: number;
  correctionEvents: number;
  basalEvents: number;
}

export const calculateInsulinStats = (
  insulinEvents: any[]
): InsulinAnalysis => {
  let totalBolusInsulin = 0;
  let mealInsulin = 0;
  let correctionInsulin = 0;
  let basalAdjustment = 0;
  let mealEvents = 0;
  let correctionEvents = 0;
  let basalEvents = 0;

  insulinEvents.forEach((event) => {
    const insulinAmount = event.insulin || 0;

    switch (event.eventType) {
      case "Meal Bolus":
        totalBolusInsulin += insulinAmount;
        mealInsulin += insulinAmount;
        mealEvents++;
        break;

      case "Correction Bolus":
        totalBolusInsulin += insulinAmount;
        correctionInsulin += insulinAmount;
        correctionEvents++;
        break;

      case "Temp Basal":
        if (
          event.rate !== undefined &&
          event.duration &&
          event.percent !== undefined
        ) {
          const hours = event.duration / 60;
          const baselineRate = event.rate;

          // If percent is -100, it's complete suspension
          if (event.percent === -100) {
            basalAdjustment -= baselineRate * hours;
          } else {
            const adjustedRate = baselineRate * (1 + event.percent / 100);
            const adjustment = (adjustedRate - baselineRate) * hours;
            basalAdjustment += adjustment;
          }
          basalEvents++;
        }
        break;

      case "Bolus Wizard":
        totalBolusInsulin += insulinAmount;

        if (event.bolusCalculatorResult) {
          try {
            const result = JSON.parse(event.bolusCalculatorResult);
            const carbsInsulin = result.carbsInsulin || 0;
            const glucoseInsulin = result.glucoseInsulin || 0;
            const totalInsulin = result.totalInsulin || 0;

            if (totalInsulin > 0) {
              // Scale the components to match actual delivered insulin
              const scale = insulinAmount / totalInsulin;
              mealInsulin += carbsInsulin * scale;
              correctionInsulin += glucoseInsulin * scale;
            } else {
              // Fallback if we can't parse
              mealInsulin += insulinAmount;
            }
          } catch (error) {
            mealInsulin += insulinAmount;
          }
        } else {
          mealInsulin += insulinAmount;
        }
        mealEvents++;
        break;

      default:
        totalBolusInsulin += insulinAmount;
        mealInsulin += insulinAmount;
        mealEvents++;
        break;
    }
  });

  const positiveBasalAdjustment = Math.max(0, basalAdjustment);
  const totalInsulinDelivered = totalBolusInsulin + positiveBasalAdjustment;

  return {
    totalBolusInsulin,
    mealInsulin,
    correctionInsulin,
    basalAdjustment,
    totalInsulinDelivered,
    mealEvents,
    correctionEvents,
    basalEvents,
  };
};
// Add this interface to your existing file
export interface BasalAnalysis {
  totalDuration: number; // Total minutes of basal adjustments
  averageRate: number; // Average basal rate in U/h
  maxRate: number; // Maximum basal rate in U/h
  averagePercent: number; // Average percent change
  suspensionDuration: number; // Total minutes of suspension (-100%)
  increaseEvents: number; // Number of positive adjustments
  decreaseEvents: number; // Number of negative adjustments
}

export const analyzeBasalEvents = (insulinEvents: any[]): BasalAnalysis => {
  let totalDuration = 0;
  let totalRate = 0;
  let maxRate = 0;
  let totalPercent = 0;
  let suspensionDuration = 0;
  let increaseEvents = 0;
  let decreaseEvents = 0;
  let eventCount = 0;

  insulinEvents.forEach((event) => {
    if (
      event.eventType === "Temp Basal" &&
      event.rate !== undefined &&
      event.duration &&
      event.percent !== undefined
    ) {
      totalDuration += event.duration;
      totalRate += event.rate;
      maxRate = Math.max(maxRate, event.rate);
      totalPercent += event.percent;
      eventCount++;

      if (event.percent > 0) {
        increaseEvents++;
      } else if (event.percent < 0) {
        decreaseEvents++;
      }

      if (event.percent === -100) {
        suspensionDuration += event.duration;
      }
    }
  });

  return {
    totalDuration,
    averageRate: eventCount > 0 ? totalRate / eventCount : 0,
    maxRate,
    averagePercent: eventCount > 0 ? totalPercent / eventCount : 0,
    suspensionDuration,
    increaseEvents,
    decreaseEvents,
  };
};

// Add these interfaces and functions to your existing file

export interface BasalDeviationAnalysis {
  deviations: {
    hour: number;
    deviationFromBasal: number; // U/hour deviation from programmed rate
    duration: number; // minutes at this deviation
    events: number; // number of events in this hour
  }[];
  averageDeviation: number;
  maxIncrease: number;
  maxDecrease: number;
  totalDeviationTime: number; // minutes with deviation from baseline
  insight?: string;
}

export interface BasalAnalysis {
  totalDuration: number;
  averageRate: number;
  maxRate: number;
  averagePercent: number;
  suspensionDuration: number;
  increaseEvents: number;
  decreaseEvents: number;
}

export const getNighttimeBasalDeviation = (
  insulinEvents: any[],
  glucoseEntries: any[],
  selectedDate: Date
): BasalDeviationAnalysis => {
  // Define nighttime hours (e.g., 10 PM to 6 AM)
  const NIGHT_START_HOUR = 22; // 10 PM
  const NIGHT_END_HOUR = 6; // 6 AM

  const deviationsByHour: {
    [hour: number]: { sum: number; count: number; duration: number };
  } = {};

  // Initialize hours array
  for (let hour = 0; hour < 24; hour++) {
    deviationsByHour[hour] = { sum: 0, count: 0, duration: 0 };
  }

  let totalDeviation = 0;
  let totalDeviationTime = 0;
  let maxIncrease = 0;
  let maxDecrease = 0;

  insulinEvents.forEach((event) => {
    if (
      event.eventType === "Temp Basal" &&
      event.rate !== undefined &&
      event.duration &&
      event.percent !== undefined
    ) {
      const eventDate = new Date(event.created_at || event.date || event.mills);
      const hour = eventDate.getHours();

      // Calculate deviation from baseline (assuming baseline is the rate at 0% change)
      const baselineRate = event.rate / (1 + event.percent / 100);
      const deviation = event.rate - baselineRate;

      // Add to hourly tracking
      deviationsByHour[hour].sum += deviation;
      deviationsByHour[hour].count += 1;
      deviationsByHour[hour].duration += event.duration;

      // Update totals
      totalDeviation += deviation * (event.duration / 60); // Convert minutes to hours
      totalDeviationTime += event.duration;

      if (deviation > maxIncrease) maxIncrease = deviation;
      if (deviation < maxDecrease) maxDecrease = deviation;
    }
  });

  // Convert to array format and calculate hourly averages
  const deviations = [];
  for (let hour = 0; hour < 24; hour++) {
    const data = deviationsByHour[hour];
    const avgDeviation = data.count > 0 ? data.sum / data.count : 0;

    deviations.push({
      hour,
      deviationFromBasal: avgDeviation,
      duration: data.duration,
      events: data.count,
    });
  }

  const averageDeviation =
    totalDeviationTime > 0 ? totalDeviation / (totalDeviationTime / 60) : 0;

  // Generate insight based on nighttime data
  let insight = "";
  const nighttimeDeviations = deviations.filter(
    (d) => d.hour >= NIGHT_START_HOUR || d.hour < NIGHT_END_HOUR
  );

  if (nighttimeDeviations.length > 0) {
    const nightAvg =
      nighttimeDeviations.reduce((sum, d) => sum + d.deviationFromBasal, 0) /
      nighttimeDeviations.length;

    if (nightAvg > 0.1) {
      insight =
        "Nighttime basal tends to run high. Consider adjusting nighttime profile.";
    } else if (nightAvg < -0.1) {
      insight = "Nighttime basal tends to run low. Watch for overnight highs.";
    } else {
      insight = "Nighttime basal appears well-tuned.";
    }
  }

  return {
    deviations,
    averageDeviation,
    maxIncrease,
    maxDecrease,
    totalDeviationTime,
    insight,
  };
};
