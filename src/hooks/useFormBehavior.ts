import { useState, useEffect, useCallback } from 'react';

const MIN_TIME_ON_FORM_MS = 10_000;

export function useFormBehavior() {
  const [mountTime] = useState(() => Date.now());
  const [hasTyped, setHasTyped] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() - mountTime >= MIN_TIME_ON_FORM_MS) {
        setTimeElapsed(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mountTime]);

  const onKeyActivity = useCallback(() => {
    if (!hasTyped) setHasTyped(true);
  }, [hasTyped]);

  return {
    isHumanLikely: timeElapsed && hasTyped,
    onKeyActivity,
  };
}
