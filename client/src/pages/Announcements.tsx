import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Bell, Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [loading, setLoading] = useState(true);

  const announcementsQuery = trpc.announcement.list.useQuery();
  const createMutation = trpc.announcement.create.useMutation();
  const publishMutation = trpc.announcement.publish.useMutation();

  useEffect(() => {
    if (announcementsQuery.data) {
      setAnnouncements(announcementsQuery.data);
      setLoading(false);
    }
  }, [announcementsQuery.data]);

  const handleCreateAnnouncement = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (user?.role !== "admin") {
      toast.error("Only admins can create announcements");
      return;
    }

    try {
      await createMutation.mutateAsync({ title, content, priority });
      setTitle("");
      setContent("");
      setPriority("medium");
      toast.success("Announcement created!");
      announcementsQuery.refetch();
    } catch (error) {
      toast.error("Failed to create announcement");
    }
  };

  const handlePublish = async (announcementId: number) => {
    try {
      await publishMutation.mutateAsync({ announcementId });
      toast.success("Announcement published!");
      announcementsQuery.refetch();
    } catch (error) {
      toast.error("Failed to publish announcement");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Announcements
          </h1>
          <p className="text-muted-foreground">Important updates and news</p>
        </div>
        {isAdmin && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Announcement title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    placeholder="Announcement content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-1"
                    rows={5}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreateAnnouncement}
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Announcement"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!isAdmin && (
        <Card className="p-4 border-yellow-200 bg-yellow-50">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Admin Only</p>
              <p className="text-sm text-yellow-800">Only administrators can create announcements</p>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="p-4 md:p-6 border-l-4 border-accent">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap mb-3">{announcement.content}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={getPriorityColor(announcement.priority)}>
                    {announcement.priority}
                  </Badge>
                  <Badge variant="outline">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
              {isAdmin && !announcement.published && (
                <Button
                  onClick={() => handlePublish(announcement.id)}
                  disabled={publishMutation.isPending}
                  size="sm"
                  className="w-full md:w-auto"
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Publish"
                  )}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {announcements.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No announcements yet</p>
        </Card>
      )}
    </div>
  );
}
