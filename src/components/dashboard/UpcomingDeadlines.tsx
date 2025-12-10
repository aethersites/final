import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, X, Plus, Check, Calendar, Clock } from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";

interface Deadline {
  id: string;
  name: string;
  subject: string;
  deadline: string;
}

const UpcomingDeadlines = () => {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    name: "",
    subject: "",
    deadline: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("dashboard-deadlines");
    if (saved) {
      setDeadlines(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard-deadlines", JSON.stringify(deadlines));
  }, [deadlines]);

  const addDeadline = () => {
    if (newDeadline.name && newDeadline.subject && newDeadline.deadline) {
      const deadline: Deadline = {
        id: Date.now().toString(),
        ...newDeadline,
      };
      setDeadlines([...deadlines, deadline].sort((a, b) => 
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      ));
      setNewDeadline({ name: "", subject: "", deadline: "" });
      setIsModalOpen(false);
    }
  };

  const removeDeadline = (id: string) => {
    setDeadlines(deadlines.filter((d) => d.id !== id));
  };

  const getTimeStatus = (deadlineDate: string) => {
    const date = new Date(deadlineDate);
    if (isPast(date)) {
      return { text: "Overdue", className: "text-red-400" };
    }
    return {
      text: formatDistanceToNow(date, { addSuffix: true }),
      className: "text-white/60",
    };
  };

  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-xl font-light">
          Upcoming Deadlines
        </CardTitle>
        <div className="flex gap-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 border border-white/30 text-white/70 hover:text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900/95 backdrop-blur-xl border border-white/20 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Deadline</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Assignment Name</Label>
                  <Input
                    placeholder="e.g., Final Essay"
                    value={newDeadline.name}
                    onChange={(e) =>
                      setNewDeadline({ ...newDeadline, name: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Subject</Label>
                  <Input
                    placeholder="e.g., English Literature"
                    value={newDeadline.subject}
                    onChange={(e) =>
                      setNewDeadline({ ...newDeadline, subject: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Deadline</Label>
                  <Input
                    type="datetime-local"
                    value={newDeadline.deadline}
                    onChange={(e) =>
                      setNewDeadline({ ...newDeadline, deadline: e.target.value })
                    }
                    className="bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
                <Button
                  onClick={addDeadline}
                  className="w-full bg-white/20 hover:bg-white/30 text-white"
                >
                  Add Deadline
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
            className="h-8 w-8 border border-white/30 text-white/70 hover:text-white hover:bg-white/10"
          >
            {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {deadlines.length === 0 ? (
          <p className="text-white/50 text-center py-4">
            No deadlines yet. Click + to add one!
          </p>
        ) : (
          deadlines.map((deadline) => {
            const status = getTimeStatus(deadline.deadline);
            return (
              <div
                key={deadline.id}
                className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{deadline.name}</h4>
                    <p className="text-white/60 text-sm">{deadline.subject}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-white/50">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(deadline.deadline), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1 text-white/50">
                        <Clock className="h-3 w-3" />
                        {format(new Date(deadline.deadline), "h:mm a")}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${status.className}`}>
                      {status.text}
                    </p>
                  </div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDeadline(deadline.id)}
                      className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlines;
