import { useState, useEffect, useRef } from "react";

interface UseLiveTimeOptions {
  format24Hour?: boolean;
}

export const useLiveTime = (options: UseLiveTimeOptions = {}) => {
  const { format24Hour = true } = options;

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !format24Hour,
    });
  };

  const [currentTime, setCurrentTime] = useState<string>(() => {
    return formatTime(new Date());
  });

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const newTime = formatTime(now);

      if (newTime !== currentTime) {
        setCurrentTime(newTime);
        setCurrentDate(now);
      }
    };

    updateTime();

    const now = new Date();
    const currentSeconds = now.getSeconds();
    const currentMilliseconds = now.getMilliseconds();
    const millisecondsUntilNextMinute =
      (60 - currentSeconds) * 1000 - currentMilliseconds;

    const timeoutId = setTimeout(() => {
      updateTime();

      intervalRef.current = setInterval(updateTime, 60000);
    }, millisecondsUntilNextMinute);

    return () => {
      clearTimeout(timeoutId);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [format24Hour]);

  const getNowTimeString = (): string => {
    return formatTime(new Date());
  };

  return {
    currentTime,
    currentDate,
    getNowTimeString,
  };
};
