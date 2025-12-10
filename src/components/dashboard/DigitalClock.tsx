import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
      <CardContent className="p-8 text-center">
        <div className="text-5xl md:text-6xl font-semibold text-white tracking-wide" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
          {formatTime(time)}
        </div>
        <div className="text-white/70 mt-3 text-lg font-light">
          {formatDate(time)}
        </div>
      </CardContent>
    </Card>
  );
};

export default DigitalClock;