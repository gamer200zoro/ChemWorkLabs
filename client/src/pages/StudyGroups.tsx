import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Copy } from "lucide-react";
import { studyGroupsManager } from "@/lib/studyGroups";

export default function StudyGroups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    const userGroups = studyGroupsManager.getUserGroups();
    setGroups(userGroups);
  }, []);

  const handleCreateGroup = () => {
    if (!groupName) return;
    const newGroup = studyGroupsManager.createGroup(groupName, groupDesc);
    setGroups([...groups, newGroup]);
    setGroupName("");
    setGroupDesc("");
    setShowCreate(false);
  };

  const handleJoinGroup = () => {
    if (!joinCode) return;
    const group = studyGroupsManager.joinGroup(joinCode, "Member");
    if (group) {
      setGroups(studyGroupsManager.getUserGroups());
      setJoinCode("");
    }
  };

  const copyInviteLink = (link: string) => {
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">👥 Study Groups</h1>
        <p className="text-muted-foreground">Collaborate with peers and share learning resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Group */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Group
          </h2>
          {!showCreate ? (
            <Button onClick={() => setShowCreate(true)} className="w-full">
              Create Group
            </Button>
          ) : (
            <div className="space-y-3">
              <Input
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <Textarea
                placeholder="Group description"
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateGroup} className="flex-1">
                  Create
                </Button>
                <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Join Group */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Join Group</h2>
          <div className="space-y-3">
            <Input
              placeholder="Enter invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <Button onClick={handleJoinGroup} className="w-full">
              Join Group
            </Button>
          </div>
        </Card>
      </div>

      {/* My Groups */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Groups</h2>
        {groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Card key={group.id} className="p-4">
                <h3 className="font-bold text-lg mb-2">{group.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
                <div className="space-y-2 mb-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(group.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => copyInviteLink(group.inviteLink)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Invite Link
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No groups yet. Create or join one to get started!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
