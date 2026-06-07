// Study groups management for collaborative learning

export interface GroupMember {
  id: string;
  name: string;
  role: "host" | "member" | "helper";
  joinedAt: number;
  isActive: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  inviteLink: string;
  createdAt: number;
  createdBy: string;
  members: GroupMember[];
  sharedReactions: string[];
  sharedNotes: string[];
  activityLog: ActivityEntry[];
  isPublic: boolean;
}

export interface ActivityEntry {
  id: string;
  timestamp: number;
  type: "member_joined" | "reaction_shared" | "note_added" | "comment";
  userId: string;
  userName: string;
  message: string;
  data?: any;
}

export interface GroupInvite {
  groupId: string;
  inviteCode: string;
  createdAt: number;
  expiresAt: number;
  maxUses?: number;
  usedCount: number;
}

const STORAGE_KEY = "dcl_study_groups";
const USER_KEY = "dcl_user_id";

export class StudyGroupsManager {
  private userId: string;

  constructor() {
    this.userId = this.getOrCreateUserId();
  }

  private getOrCreateUserId(): string {
    let userId = localStorage.getItem(USER_KEY);
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(USER_KEY, userId);
    }
    return userId;
  }

  createGroup(name: string, description: string): StudyGroup {
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const inviteCode = this.generateInviteCode();

    const group: StudyGroup = {
      id: groupId,
      name,
      description,
      inviteLink: `${window.location.origin}?join=${inviteCode}`,
      createdAt: Date.now(),
      createdBy: this.userId,
      members: [
        {
          id: this.userId,
          name: "You",
          role: "host",
          joinedAt: Date.now(),
          isActive: true,
        },
      ],
      sharedReactions: [],
      sharedNotes: [],
      activityLog: [
        {
          id: `activity_${Date.now()}`,
          timestamp: Date.now(),
          type: "member_joined",
          userId: this.userId,
          userName: "You",
          message: "Created the group",
        },
      ],
      isPublic: false,
    };

    this.saveGroup(group);
    return group;
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  joinGroup(inviteCode: string, userName: string): StudyGroup | null {
    const groups = this.getGroups();
    const group = groups.find((g) => g.inviteLink.includes(inviteCode));

    if (!group) return null;

    // Check if already a member
    if (group.members.find((m) => m.id === this.userId)) {
      return group;
    }

    // Add new member
    group.members.push({
      id: this.userId,
      name: userName,
      role: "member",
      joinedAt: Date.now(),
      isActive: true,
    });

    // Add activity log entry
    group.activityLog.push({
      id: `activity_${Date.now()}`,
      timestamp: Date.now(),
      type: "member_joined",
      userId: this.userId,
      userName,
      message: `${userName} joined the group`,
    });

    this.saveGroup(group);
    return group;
  }

  shareReaction(groupId: string, reactionId: string): boolean {
    const group = this.getGroup(groupId);
    if (!group) return false;

    if (!group.sharedReactions.includes(reactionId)) {
      group.sharedReactions.push(reactionId);
    }

    group.activityLog.push({
      id: `activity_${Date.now()}`,
      timestamp: Date.now(),
      type: "reaction_shared",
      userId: this.userId,
      userName: this.getUserName(),
      message: "Shared a reaction",
      data: { reactionId },
    });

    this.saveGroup(group);
    return true;
  }

  addNote(groupId: string, noteId: string, noteTitle: string): boolean {
    const group = this.getGroup(groupId);
    if (!group) return false;

    if (!group.sharedNotes.includes(noteId)) {
      group.sharedNotes.push(noteId);
    }

    group.activityLog.push({
      id: `activity_${Date.now()}`,
      timestamp: Date.now(),
      type: "note_added",
      userId: this.userId,
      userName: this.getUserName(),
      message: `Added note: ${noteTitle}`,
      data: { noteId },
    });

    this.saveGroup(group);
    return true;
  }

  addComment(groupId: string, comment: string): boolean {
    const group = this.getGroup(groupId);
    if (!group) return false;

    group.activityLog.push({
      id: `activity_${Date.now()}`,
      timestamp: Date.now(),
      type: "comment",
      userId: this.userId,
      userName: this.getUserName(),
      message: comment,
    });

    this.saveGroup(group);
    return true;
  }

  getGroup(groupId: string): StudyGroup | null {
    const groups = this.getGroups();
    return groups.find((g) => g.id === groupId) || null;
  }

  getGroups(): StudyGroup[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  getUserGroups(): StudyGroup[] {
    const groups = this.getGroups();
    return groups.filter((g) => g.members.some((m) => m.id === this.userId));
  }

  deleteGroup(groupId: string): boolean {
    const groups = this.getGroups();
    const index = groups.findIndex((g) => g.id === groupId);

    if (index === -1) return false;

    const group = groups[index];
    if (group.createdBy !== this.userId) return false;

    groups.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    return true;
  }

  leaveGroup(groupId: string): boolean {
    const group = this.getGroup(groupId);
    if (!group) return false;

    const memberIndex = group.members.findIndex((m) => m.id === this.userId);
    if (memberIndex === -1) return false;

    group.members.splice(memberIndex, 1);

    group.activityLog.push({
      id: `activity_${Date.now()}`,
      timestamp: Date.now(),
      type: "member_joined",
      userId: this.userId,
      userName: this.getUserName(),
      message: "Left the group",
    });

    this.saveGroup(group);
    return true;
  }

  private saveGroup(group: StudyGroup): void {
    const groups = this.getGroups();
    const index = groups.findIndex((g) => g.id === group.id);

    if (index === -1) {
      groups.push(group);
    } else {
      groups[index] = group;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }

  private getUserName(): string {
    return localStorage.getItem("dcl_user_name") || "Anonymous";
  }

  setUserName(name: string): void {
    localStorage.setItem("dcl_user_name", name);
  }
}

export const studyGroupsManager = new StudyGroupsManager();
