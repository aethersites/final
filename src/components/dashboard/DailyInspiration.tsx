import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const ALL_QUOTES = ["The only way to do great work is to love what you do. — Steve Jobs", "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill", "Believe you can and you're halfway there. — Theodore Roosevelt", "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt", "It does not matter how slowly you go as long as you do not stop. — Confucius", "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb", "Your limitation—it's only your imagination.", "Push yourself, because no one else is going to do it for you.", "Great things never come from comfort zones.", "Dream it. Wish it. Do it.", "Success doesn't just find you. You have to go out and get it.", "The harder you work for something, the greater you'll feel when you achieve it.", "Dream bigger. Do bigger.", "Don't stop when you're tired. Stop when you're done.", "Wake up with determination. Go to bed with satisfaction.", "Do something today that your future self will thank you for.", "Little things make big days.", "It's going to be hard, but hard does not mean impossible.", "Don't wait for opportunity. Create it.", "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", "The key to success is to focus on goals, not obstacles.", "Dream it. Believe it. Build it.", "Education is the passport to the future. — Malcolm X", "The beautiful thing about learning is that no one can take it away from you. — B.B. King", "Study hard, for the well is deep, and our brains are shallow. — Richard Baxter", "The more that you read, the more things you will know. — Dr. Seuss", "An investment in knowledge pays the best interest. — Benjamin Franklin", "Learning is not attained by chance; it must be sought for with ardor. — Abigail Adams", "The mind is not a vessel to be filled, but a fire to be kindled. — Plutarch", "Live as if you were to die tomorrow. Learn as if you were to live forever. — Mahatma Gandhi"];
const DailyInspiration = () => {
  const [quote, setQuote] = useState<string>("");
  useEffect(() => {
    // Generate consistent quote based on the current date
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

    // Use day of year as seed to pick a single quote that rotates daily
    const index = dayOfYear % ALL_QUOTES.length;
    setQuote(ALL_QUOTES[index]);
  }, []);
  return <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-xl font-light flex items-center gap-2">
          
          Daily Inspiration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-lg bg-white/5 border-l-2 border-white/30">
          <p className="text-white/90 text-base italic leading-relaxed">"{quote}"</p>
        </div>
      </CardContent>
    </Card>;
};
export default DailyInspiration;