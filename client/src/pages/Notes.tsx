import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

export default function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreateNote = () => {
    if (!title || !content) return;
    const newNote = {
      id: `note_${Date.now()}`,
      title,
      content,
      createdAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setTitle("");
    setContent("");
    setShowCreate(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">📝 Notes</h1>
        <p className="text-muted-foreground">Create and organize your chemistry notes</p>
      </div>

      {/* Create Note */}
      <Card className="p-6">
        {!showCreate ? (
          <Button onClick={() => setShowCreate(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        ) : (
          <div className="space-y-3">
            <Input
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Note content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateNote} className="flex-1">
                Save Note
              </Button>
              <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length > 0 ? (
          notes.map((note) => (
            <Card key={note.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{note.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No notes yet. Create your first note!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
