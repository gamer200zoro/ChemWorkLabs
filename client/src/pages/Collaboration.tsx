import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Users, Plus, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Collaboration() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const createSessionMutation = trpc.collaboration.createSession.useMutation();
  const joinSessionMutation = trpc.collaboration.joinSession.useMutation();

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleCreateSession = async () => {
    if (!sessionTitle.trim()) {
      toast.error("Please enter a session title");
      return;
    }

    try {
      const result = await createSessionMutation.mutateAsync({ title: sessionTitle });
      if (result.success) {
        setSessions([...sessions, { sessionCode: result.sessionCode, title: sessionTitle, activeUsers: 1 }]);
        setSessionTitle("");
        toast.success(`Session created! Code: ${result.sessionCode}`);
      }
    } catch (error) {
      toast.error("Failed to create session");
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a session code");
      return;
    }

    try {
      const result = await joinSessionMutation.mutateAsync({ sessionCode: joinCode });
      if (result.success) {
        setSessions([...sessions, result.session]);
        setJoinCode("");
        toast.success("Joined session successfully!");
      }
    } catch (error) {
      toast.error("Failed to join session");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
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

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Users className="w-8 h-8" />
            Real-time Collaboration
          </h1>
          <p className="text-muted-foreground">Work together on chemistry problems in real-time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user && (
          <Dialog>
            <DialogTrigger asChild>
              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-accent">
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <Plus className="w-8 h-8 text-accent" />
                  <h3 className="font-semibold">Create Session</h3>
                  <p className="text-sm text-muted-foreground">Start a new collaboration session</p>
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Collaboration Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Session Title</label>
                  <Input
                    placeholder="e.g., Organic Chemistry Study Group"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleCreateSession}
                  disabled={createSessionMutation.isPending}
                  className="w-full"
                >
                  {createSessionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Session"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-accent">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <Users className="w-8 h-8 text-accent" />
                <h3 className="font-semibold">Join Session</h3>
                <p className="text-sm text-muted-foreground">Join an existing collaboration</p>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Join Collaboration Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Session Code</label>
                <Input
                  placeholder="Enter 8-character code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="mt-1 font-mono"
                  maxLength={8}
                />
              </div>
              <Button
                onClick={handleJoinSession}
                disabled={joinSessionMutation.isPending}
                className="w-full"
              >
                {joinSessionMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Session"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Sessions</h2>
        {sessions.length > 0 ? (
          sessions.map((session, idx) => (
            <Card key={idx} className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{session.title}</h3>
                  <div className="flex gap-2 items-center flex-wrap">
                    <Badge variant="outline" className="font-mono">
                      {session.sessionCode}
                    </Badge>
                    <Badge variant="secondary">
                      {session.activeUsers} active
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(session.sessionCode)}
                  className="w-full md:w-auto"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No active sessions. Create or join one to get started!</p>
          </Card>
        )}
      </div>

      <Card className="p-6 bg-accent/5 border-accent/20">
        <h3 className="font-semibold mb-3">How it works</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Create a session and share the code with teammates</li>
          <li>✓ All participants see real-time updates</li>
          <li>✓ Work together on reactions and compounds</li>
          <li>✓ Chat and discuss within the session</li>
        </ul>
      </Card>
    </div>
  );
}
