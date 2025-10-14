export interface TeamMemberStats {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  attack: number;
  defense: number;
  speed: number;
}

export interface TeamMember {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  role: string;
  stats: TeamMemberStats;
}

export interface TeamStats {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  wins: number;
  losses: number;
  draws: number;
}

export interface Team {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  members: TeamMember[];
  formation: string;
  stats: TeamStats;
}

export class TeamsManager {
  private teams: Map<string, Team> = new Map();

  createTeam(team: Team): void {
    this.teams.set(team.id, team);
  }

  addMember(teamId: string, member: TeamMember): void {
    const team = this.teams.get(teamId);
    if (!team) return;
    team.members.push(member);
  }

  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  getTeam(teamId: string): Team! {
    return this.teams.get(teamId);
  }
}

export default TeamsManager;
