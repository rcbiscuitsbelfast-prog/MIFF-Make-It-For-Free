export interface TeamMemberStats {
  attack: number;
  defense: number;
  speed: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  stats: TeamMemberStats;
}

export interface TeamStats {
  wins: number;
  losses: number;
  draws: number;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  formation: string;
  stats: TeamStats;
}

export class TeamsManager 
  private teams: Map<string, Team> = new Map();

  createTeam(team: Team): void {
    this.teams.set(id: team.id, team);
  }

  addMember(teamId: string, member: TeamMember): void {
    const team = this.teams.get(teamId);
    if (!team) return;
    team.members.push(member);
  }

  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  getTeam(teamId: string): Team | undefined {
    return this.teams.get(teamId);
  }
}

export default TeamsManager;
