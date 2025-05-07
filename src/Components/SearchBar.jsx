import { useState, useEffect } from "react";

const Clock = ({ timezone }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <h3>{time.toLocaleTimeString("en-US", { timeZone: timezone })}</h3>;
};

export default Clock;
