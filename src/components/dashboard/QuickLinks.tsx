import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, X, Plus, ExternalLink, Check } from "lucide-react";

interface QuickLink {
  id: string;
  name: string;
  url: string;
}

const DEFAULT_LINKS: QuickLink[] = [
  { id: "1", name: "ChatGPT", url: "https://chat.openai.com/" },
  { id: "2", name: "Gmail", url: "https://mail.google.com/" },
  { id: "3", name: "DeepSeek", url: "https://deepseek.ai" },
  { id: "4", name: "Notice", url: "https://noticeself.lovable.app/" },
];

const QuickLinks = () => {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newLink, setNewLink] = useState({ name: "", url: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dashboard-quick-links");
    if (saved) {
      setLinks(JSON.parse(saved));
    } else {
      setLinks(DEFAULT_LINKS);
    }
  }, []);

  useEffect(() => {
    if (links.length > 0) {
      localStorage.setItem("dashboard-quick-links", JSON.stringify(links));
    }
  }, [links]);

  const addLink = () => {
    if (newLink.name && newLink.url && links.length < 10) {
      const link: QuickLink = {
        id: Date.now().toString(),
        name: newLink.name,
        url: newLink.url.startsWith("http") ? newLink.url : `https://${newLink.url}`,
      };
      setLinks([...links, link]);
      setNewLink({ name: "", url: "" });
      setShowAddForm(false);
    }
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-white text-xl font-light">Quick Links</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(!isEditing)}
          className="h-8 w-8 border border-white/30 text-white/70 hover:text-white hover:bg-white/10"
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/90 hover:text-white flex-1"
            >
              <ExternalLink className="h-4 w-4 opacity-50" />
              <span>{link.name}</span>
            </a>
            {isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeLink(link.id)}
                className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}

        {isEditing && links.length < 10 && (
          <>
            {showAddForm ? (
              <div className="space-y-2 p-3 rounded-lg bg-white/5">
                <Input
                  placeholder="Name"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Input
                  placeholder="URL"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={addLink}
                    size="sm"
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white"
                  >
                    Add
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    size="sm"
                    variant="ghost"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowAddForm(true)}
                variant="ghost"
                className="w-full border border-dashed border-white/30 text-white/70 hover:text-white hover:bg-white/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link ({links.length}/10)
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickLinks;
