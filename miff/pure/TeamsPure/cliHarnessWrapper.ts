#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for TeamsPure
 * Adds missing operation: createTeam
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { TeamsManager, Team, TeamMember } from './Manager';

const { mode, params } = parseKeyValueArgs(process.argv);
const manager = new TeamsManager();

try {
  switch (mode) {
    case 'createTeam': {
      const { teamId, name, members, formation } = params;
      
      const membersList = typeof members === 'string' ? JSON.parse(members) :
                         Array.isArray(members) ? members.map((m: any, i: number) => ({
                           id: typeof m === 'string' ? m : m.id || `member_${i}`,
                           name: typeof m === 'string' ? m : m.name || `Member ${i}`,
                           role: typeof m === 'object' && m.role ? m.role : 'player',
                           stats: { attack: 10, defense: 10, speed: 10 }
                         })) : [
                           { id: 'player', name: 'Player', role: 'captain', stats: { attack: 15, defense: 10, speed: 12 } },
                           { id: 'npc_striker', name: 'Striker', role: 'forward', stats: { attack: 18, defense: 8, speed: 14 } },
                           { id: 'npc_defender', name: 'Defender', role: 'defense', stats: { attack: 8, defense: 18, speed: 9 } }
                         ];
      
      const team: Team = {
        id: teamId || 'team_001',
        name: name || 'New Team',
        members: membersList,
        formation: formation || '4-4-2',
        stats: {
          wins: 0,
          losses: 0,
          draws: 0
        }
      };
      
      manager.createTeam(team);
      
      handleSuccess({
        team,
        memberCount: membersList.length,
        formation: formation || '4-4-2',
        created: true
      }, 'createTeam');
      break;
    }

    case 'addMember': {
      const { teamId, memberId, memberName } = params;
      const member: TeamMember = {
        id: memberId || 'new_member',
        name: memberName || 'New Member',
        role: 'player',
        stats: { attack: 10, defense: 10, speed: 10 }
      };
      manager.addMember(teamId || 'team_001', member);
      handleSuccess({ teamId, member, added: true }, 'addMember');
      break;
    }

    case 'listTeams': {
      const teams = manager.getAllTeams();
      handleSuccess({ teams, count: teams.length }, 'listTeams');
      break;
    }

    case 'getTeam': {
      const { teamId } = params;
      const team = manager.getTeam(teamId || 'team_001');
      handleSuccess({ team }, 'getTeam');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: createTeam, addMember, listTeams, getTeam`);
  }
} catch (error) {
  handleError(error);
}
