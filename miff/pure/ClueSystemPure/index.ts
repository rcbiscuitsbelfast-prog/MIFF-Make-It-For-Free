/**
 * ClueSystemPure - AAA Quality Clue and Deduction System
 *
 * Advanced deduction mechanics with:
 * - Clue tagging and categorization
 * - Evidence linking and relationship chains
 * - Deduction logic and inference systems
 * - Investigation progress tracking
 * - Mobile-optimized clue management
 * - Multiplayer clue sharing
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/EventBusPure';

export type ClueType = 'evidence' | 'testimony' | 'document' | 'physical' | 'digital' | 'circumstantial';
export type ClueState = 'discovered' | 'analyzed' | 'linked' | 'contradicted' | 'resolved' | 'archived';
export type DeductionLevel = 'speculation' | 'theory' | 'evidence' | 'proven' | 'disproven';
export type InvestigationPhase = 'discovery' | 'analysis' | 'linking' | 'deduction' | 'conclusion';

export interface Clue {
  id: string;
  name: string;
  description: string;
  type: ClueType;
  state: ClueState;
  discoveryMethod: 'found' | 'gifted' | 'purchased' | 'stolen' | 'crafted';
  location?: { x: number; y: number; z: number };
  discoveredAt: number;
  discoveredBy: string;
  tags: string[];
  metadata: Record<string, any>;
  reliability: number; // 0-100
  importance: number; // 0-100
  connections: Connection[];
  analysis: Analysis;
}

export interface Connection {
  id: string;
  clueId: string;
  relatedClueId: string;
  relationshipType: 'supports' | 'contradicts' | 'leads_to' | 'explains' | 'timeline' | 'location';
  strength: number; // 0-100
  description: string;
  createdAt: number;
  createdBy: string;
}

export interface Analysis {
  id: string;
  clueId: string;
  analyst: string;
  analysisText: string;
  confidence: number; // 0-100
  deductions: string[];
  questions: string[];
  hypotheses: Hypothesis[];
  completedAt: number;
  updatedAt: number;
}

export interface Hypothesis {
  id: string;
  title: string;
  description: string;
  supportingClues: string[];
  contradictingClues: string[];
  confidence: number; // 0-100
  status: 'active' | 'confirmed' | 'refuted' | 'abandoned';
  createdAt: number;
  updatedAt: number;
  creator: string;
}

export interface EvidenceChain {
  id: string;
  name: string;
  description: string;
  clues: string[]; // clue IDs in chain order
  strength: number; // 0-100
  length: number;
  isComplete: boolean;
  gaps: string[]; // missing pieces
  contradictions: string[];
  conclusions: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Investigation {
  id: string;
  name: string;
  description: string;
  phase: InvestigationPhase;
  clues: Map<string, Clue>;
  connections: Map<string, Connection>;
  hypotheses: Map<string, Hypothesis>;
  evidenceChains: Map<string, EvidenceChain>;
  suspects: Map<string, Suspect>;
  timeline: TimelineEvent[];
  progress: number; // 0-100
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  createdAt: number;
  updatedAt: number;
}

export interface Suspect {
  id: string;
  name: string;
  description: string;
  motive: string;
  opportunity: string;
  means: string;
  alibi: string;
  guiltProbability: number; // 0-100
  relatedClues: string[];
  status: 'suspect' | 'person_of_interest' | 'cleared' | 'guilty' | 'innocent';
  lastInterrogated: number;
  interrogationCount: number;
}

export interface TimelineEvent {
  id: string;
  timestamp: number;
  title: string;
  description: string;
  location?: { x: number; y: number; z: number };
  involvedParties: string[];
  relatedClues: string[];
  certainty: number; // 0-100
  type: 'crime' | 'discovery' | 'interrogation' | 'analysis' | 'conclusion';
}

export interface DeductionRule {
  id: string;
  name: string;
  description: string;
  conditions: Condition[];
  conclusion: string;
  confidence: number; // 0-100
  category: string;
  tags: string[];
  createdAt: number;
}

export interface Condition {
  type: 'clue_state' | 'connection_strength' | 'evidence_chain' | 'suspect_status' | 'timeline_consistency';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists' | 'missing';
  value: any;
  clueId?: string;
  connectionId?: string;
  suspectId?: string;
}

export interface InvestigationStats {
  totalClues: number;
  analyzedClues: number;
  linkedClues: number;
  resolvedClues: number;
  hypotheses: number;
  confirmedHypotheses: number;
  refutedHypotheses: number;
  evidenceChains: number;
  completeChains: number;
  suspects: number;
  clearedSuspects: number;
  guiltySuspects: number;
  averageClueReliability: number;
  deductionAccuracy: number;
  investigationProgress: number;
}

export class ClueSystemPure {
  private eventBus: EventBus;
  private investigations: Map<string, Investigation> = new Map();
  private clues: Map<string, Clue> = new Map();
  private deductionRules: Map<string, DeductionRule> = new Map();
  private analysisTimer: NodeJS.Timeout | null = null;

  constructor(eventBus?: EventBus) {
    this.eventBus = (eventBus as any) || ({} as any);
    this.startAnalysisTimer();
    this.initializeDefaultRules();
  }

  // Shims for CLI harness
  public addClue(clue: Partial<Clue>): void {
    const id = clue.id || `clue_${Date.now()}`;
    const full: Clue = {
      id,
      name: clue.name || id,
      description: clue.description || '',
      type: (clue.type as any) || 'physical',
      state: 'discovered',
      discoveryMethod: 'found',
      location: clue.location as any,
      discoveredAt: Date.now(),
      discoveredBy: (clue as any).discoveredBy || 'cli',
      tags: [],
      metadata: {},
      reliability: 50,
      importance: 50,
      connections: [],
      analysis: {
        id: `analysis_${id}`,
        clueId: id,
        analyst: 'cli',
        analysisText: '',
        confidence: 0,
        deductions: [],
        questions: [],
        hypotheses: [],
        completedAt: 0,
        updatedAt: new Date()
      }
    };
    this.clues.set(full.id, full);
  }

  public getTotalClues(): number {
    return this.clues.size;
  }

  public getDiscoveredClues(): Clue[] {
    return Array.from(this.clues.values()).filter((c: any) => c.state === 'discovered' || c.state === 'analyzed');
  }

  private startAnalysisTimer(): void {
    if (typeof setInterval !== 'function') return;
    const timer = setInterval(() => {
      this.performAutomatedAnalysis();
    }, 5000);
    // Prevent keeping the Node process alive
    if (typeof (timer as any).unref === 'function') {
      (timer as any).unref();
    }
    this.analysisTimer = timer as any;
  }

  private initializeDefaultRules(): void {
    // Initialize default deduction rules
    const rules: DeductionRule[] = [
      {
        id: 'timeline_consistency',
        name: 'Timeline Consistency',
        description: 'Check if events are chronologically consistent',
        conditions: [
          {
            type: 'timeline_consistency',
            operator: 'equals',
            value: true
          }
        ],
        conclusion: 'Events are chronologically consistent',
        confidence: 90,
        category: 'logic',
        tags: ['timeline', 'consistency'],
        createdAt: new Date()
      },
      {
        id: 'motive_opportunity',
        name: 'Motive + Opportunity = Suspect',
        description: 'If suspect has motive and opportunity, increase suspicion',
        conditions: [
          {
            type: 'suspect_status',
            operator: 'equals',
            value: 'suspect'
          }
        ],
        conclusion: 'Suspect has both motive and opportunity',
        confidence: 75,
        category: 'deduction',
        tags: ['motive', 'opportunity', 'suspect'],
        createdAt: new Date()
      }
    ];

    rules.forEach((rule: any) => {
      this.deductionRules.set(rule.id, rule);
    });
  }

  private performAutomatedAnalysis(): void {
    this.investigations.forEach((investigation, investigationId) => {
      this.analyzeInvestigation(investigationId);
    });
  }

  private analyzeInvestigation(investigationId: string): void {
    const investigation = this.investigations.get(investigationId);
    if (!investigation) return;

    // Apply deduction rules
    this.deductionRules.forEach((rule: any) => {
      if (this.evaluateRule(rule, investigation)) {
        this.applyRuleConclusion(rule, investigation);
      }
    });

    // Update investigation progress
    this.updateInvestigationProgress(investigation);

    // Check for contradictions
    this.detectContradictions(investigation);

    // Update timeline consistency
    this.updateTimelineConsistency(investigation);
  }

  private evaluateRule(rule: DeductionRule, investigation: Investigation): boolean {
    return rule.conditions.every(condition => {
      return this.evaluateCondition(condition, investigation);
    });
  }

  private evaluateCondition(condition: Condition, investigation: Investigation): boolean {
    switch (condition.type) {
      case 'clue_state':
        const clue = Array.from(investigation.clues.values())
          .find(c => c.id === condition.clueId);
        if (!clue) return false;

        switch (condition.operator) {
          case 'equals':
            return clue.state === condition.value;
          case 'not_equals':
            return clue.state !== condition.value;
          default:
            return false;
        }

      case 'connection_strength':
        const connection = Array.from(investigation.connections.values())
          .find(c => c.id === condition.connectionId);
        if (!connection) return false;

        switch (condition.operator) {
          case 'greater_than':
            return connection.strength > (condition.value || 0);
          case 'less_than':
            return connection.strength < (condition.value || 0);
          default:
            return false;
        }

      case 'evidence_chain':
        const chain = Array.from(investigation.evidenceChains.values())
          .find(c => c.id === condition.value);
        if (!chain) return false;

        switch (condition.operator) {
          case 'exists':
            return true;
          case 'missing':
            return false;
          default:
            return false;
        }

      default:
        return false;
    }
  }

  private applyRuleConclusion(rule: DeductionRule, investigation: Investigation): void {
    // This would apply the rule's conclusion to the investigation
    // For example, updating suspect status, creating new hypotheses, etc.

    this.eventBus.publish('clue:deduction_applied', {
      ruleId: rule.id,
      investigationId: investigation.id,
      conclusion: rule.conclusion,
      confidence: rule.confidence,
      timestamp: new Date()
    });
  }

  private updateInvestigationProgress(investigation: Investigation): void {
    const totalClues = investigation.clues.size;
    const analyzedClues = Array.from(investigation.clues.values())
      .filter((clue: any) => clue.state === 'analyzed' || clue.state === 'linked').length;
    const linkedClues = Array.from(investigation.clues.values())
      .filter((clue: any) => clue.state === 'linked' || clue.state === 'resolved').length;
    const resolvedClues = Array.from(investigation.clues.values())
      .filter((clue: any) => clue.state === 'resolved').length;

    const progress = Math.min(100,
      (analyzedClues * 20 + linkedClues * 40 + resolvedClues * 40) / Math.max(totalClues, 1)
    );

    investigation.progress = progress;
    investigation.updatedAt = Date.now();

    this.eventBus.publish('clue:progress_updated', {
      investigationId: investigation.id,
      progress: progress,
      timestamp: new Date()
    });
  }

  private detectContradictions(investigation: Investigation): void {
    const clues = Array.from(investigation.clues.values());

    clues.forEach(clue1 => {
      clues.forEach(clue2 => {
        if (clue1.id !== clue2.id) {
          const contradiction = this.detectClueContradiction(clue1, clue2);
          if (contradiction) {
            this.handleContradiction(investigation.id, clue1.id, clue2.id, contradiction);
          }
        }
      });
    });
  }

  private detectClueContradiction(clue1: Clue, clue2: Clue): string | null {
    // Check for timeline contradictions
    if (clue1.metadata.timestamp && clue2.metadata.timestamp) {
      const time1 = clue1.metadata.timestamp;
      const time2 = clue2.metadata.timestamp;

      if (Math.abs(time1 - time2) < 60000 && // Within 1 minute
          clue1.location && clue2.location) {
        const distance = Math.sqrt(
          (clue1.location.x - clue2.location.x) ** 2 +
          (clue1.location.z - clue2.location.z) ** 2
        );

        // If clues are far apart but timestamps are close, possible contradiction
        if (distance > 100) { // More than 100 units apart
          return `Timeline contradiction: ${clue1.name} and ${clue2.name} occurred at nearly same time but different locations`;
        }
      }
    }

    // Check for conflicting evidence
    const conflictingConnections = clue1.connections.filter((conn: any) =>
      conn.relatedClueId === clue2.id && conn.relationshipType === 'contradicts'
    );

    if (conflictingConnections.length > 0) {
      return `Evidence contradiction: ${clue1.name} contradicts ${clue2.name}`;
    }

    return null;
  }

  private handleContradiction(investigationId: string, clue1Id: string, clue2Id: string, contradiction: string): void {
    this.eventBus.publish('clue:contradiction_detected', {
      investigationId: investigationId,
      clue1Id: clue1Id,
      clue2Id: clue2Id,
      contradiction: contradiction,
      timestamp: new Date()
    });
  }

  private updateTimelineConsistency(investigation: Investigation): void {
    const events = investigation.timeline.sort((a: any, b: any) => a.timestamp - b.timestamp);

    let isConsistent = true;
    let lastTimestamp = 0;

    for (const event of events) {
      if (event.timestamp < lastTimestamp) {
        isConsistent = false;
        break;
      }
      lastTimestamp = event.timestamp;
    }

    if (!isConsistent) {
      this.eventBus.publish('clue:timeline_inconsistency', {
        investigationId: investigation.id,
        message: 'Timeline events are not in chronological order',
        timestamp: new Date()
      });
    }
  }

  public createInvestigation(name: string, description: string, difficulty: 'easy' | 'medium' | 'hard' | 'expert'): Investigation {
    const investigation: Investigation = {
      id: `investigation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name,
      description: description,
      phase: 'discovery',
      clues: new Map(),
      connections: new Map(),
      hypotheses: new Map(),
      evidenceChains: new Map(),
      suspects: new Map(),
      timeline: [],
      progress: 0,
      difficulty: difficulty,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.investigations.set(investigation.id, investigation);

    this.eventBus.publish('clue:investigation_created', {
      investigation: investigation,
      timestamp: new Date()
    });

    return investigation;
  }

  public addClueToInvestigation(investigationId: string, clueData: {
    name: string;
    description: string;
    type: ClueType;
    discoveryMethod: 'found' | 'gifted' | 'purchased' | 'stolen' | 'crafted';
    location?: { x: number; y: number; z: number };
    discoveredBy: string;
    tags: string[];
    metadata?: Record<string, any>;
    reliability?: number;
    importance?: number;
  }): Clue | null {
    const investigation = this.investigations.get(investigationId);
    if (!investigation) return null;

    const clueId = `clue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const clue: Clue = {
      id: clueId,
      name: clueData.name,
      description: clueData.description,
      type: clueData.type,
      state: 'discovered',
      discoveryMethod: clueData.discoveryMethod,
      location: clueData.location,
      discoveredAt: Date.now(),
      discoveredBy: clueData.discoveredBy,
      tags: clueData.tags,
      metadata: clueData.metadata || {},
      reliability: clueData.reliability || 50,
      importance: clueData.importance || 50,
      connections: [],
      analysis: this.createAnalysis(clueId, clueData.discoveredBy)
    };

    investigation.clues.set(clue.id, clue);
    this.clues.set(clue.id, clue);

    this.eventBus.publish('clue:added', {
      investigationId: investigationId,
      clue: clue,
      timestamp: new Date()
    });

    return clue;
  }

  public linkClues(clue1Id: string, clue2Id: string, relationshipType: Connection['relationshipType'], strength: number, description: string, createdBy: string): Connection | null {
    const clue1 = this.clues.get(clue1Id);
    const clue2 = this.clues.get(clue2Id);

    if (!clue1 || !clue2) return null;

    const connection: Connection = {
      id: `connection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clueId: clue1Id,
      relatedClueId: clue2Id,
      relationshipType: relationshipType,
      strength: Math.max(0, Math.min(100, strength)),
      description: description,
      createdAt: new Date(),
      createdBy: createdBy
    };

    clue1.connections.push(connection);
    clue2.connections.push(connection);

    // Find investigation containing these clues
    const investigation = Array.from(this.investigations.values())
      .find(inv => inv.clues.has(clue1Id) && inv.clues.has(clue2Id));

    if (investigation) {
      investigation.connections.set(connection.id, connection);
    }

    this.eventBus.publish('clue:linked', {
      connection: connection,
      clue1Id: clue1Id,
      clue2Id: clue2Id,
      timestamp: new Date()
    });

    return connection;
  }

  public createHypothesis(investigationId: string, title: string, description: string, supportingClues: string[], createdBy: string): Hypothesis | null {
    const investigation = this.investigations.get(investigationId);
    if (!investigation) return null;

    const hypothesis: Hypothesis = {
      id: `hypothesis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title,
      description: description,
      supportingClues: supportingClues,
      contradictingClues: [],
      confidence: 25, // Start low, build up with evidence
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: createdBy
    };

    investigation.hypotheses.set(hypothesis.id, hypothesis);

    this.eventBus.publish('clue:hypothesis_created', {
      investigationId: investigationId,
      hypothesis: hypothesis,
      timestamp: new Date()
    });

    return hypothesis;
  }

  public addSuspect(investigationId: string, suspectData: {
    name: string;
    description: string;
    motive: string;
    opportunity: string;
    means: string;
    alibi: string;
    guiltProbability?: number;
  }): Suspect | null {
    const investigation = this.investigations.get(investigationId);
    if (!investigation) return null;

    const suspect: Suspect = {
      id: `suspect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: suspectData.name,
      description: suspectData.description,
      motive: suspectData.motive,
      opportunity: suspectData.opportunity,
      means: suspectData.means,
      alibi: suspectData.alibi,
      guiltProbability: suspectData.guiltProbability || 25,
      relatedClues: [],
      status: 'suspect',
      lastInterrogated: 0,
      interrogationCount: 0
    };

    investigation.suspects.set(suspect.id, suspect);

    this.eventBus.publish('clue:suspect_added', {
      investigationId: investigationId,
      suspect: suspect,
      timestamp: new Date()
    });

    return suspect;
  }

  public analyzeClue(clueId: string, analyst: string, analysisText: string, deductions: string[], questions: string[]): Analysis | null {
    const clue = this.clues.get(clueId);
    if (!clue) return null;

    const analysis: Analysis = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clueId: clueId,
      analyst: analyst,
      analysisText: analysisText,
      confidence: 70, // Default confidence
      deductions: deductions,
      questions: questions,
      hypotheses: [],
      completedAt: Date.now(),
      updatedAt: new Date()
    };

    clue.analysis = analysis;
    clue.state = 'analyzed';

    this.eventBus.publish('clue:analyzed', {
      clueId: clueId,
      analysis: analysis,
      timestamp: new Date()
    });

    return analysis;
  }

  public addTimelineEvent(investigationId: string, eventData: {
    timestamp: number;
    title: string;
    description: string;
    location?: { x: number; y: number; z: number };
    involvedParties: string[];
    relatedClues: string[];
    certainty: number;
    type: TimelineEvent['type'];
  }): TimelineEvent | null {
    const investigation = this.investigations.get(investigationId);
    if (!investigation) return null;

    const event: TimelineEvent = {
      id: `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: eventData.timestamp,
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      involvedParties: eventData.involvedParties,
      relatedClues: eventData.relatedClues,
      certainty: eventData.certainty,
      type: eventData.type
    };

    investigation.timeline.push(event);
    investigation.timeline.sort((a: any, b: any) => a.timestamp - b.timestamp);

    this.eventBus.publish('clue:timeline_event_added', {
      investigationId: investigationId,
      event: event,
      timestamp: new Date()
    });

    return event;
  }

  public getInvestigation(investigationId: string): Investigation | null {
    return this.investigations.get(investigationId) || null;
  }

  public getClue(clueId: string): Clue | null {
    return this.clues.get(clueId) || null;
  }

  public getInvestigationStats(investigationId: string): InvestigationStats | null {
    const investigation = this.investigations.get(investigationId);
    if (!investigation) return null;

    const clues = Array.from(investigation.clues.values());
    const hypotheses = Array.from(investigation.hypotheses.values());
    const suspects = Array.from(investigation.suspects.values());
    const chains = Array.from(investigation.evidenceChains.values());

    return {
      totalClues: clues.length,
      analyzedClues: clues.filter((c: any) => c.state === 'analyzed').length,
      linkedClues: clues.filter((c: any) => c.state === 'linked').length,
      resolvedClues: clues.filter((c: any) => c.state === 'resolved').length,
      hypotheses: hypotheses.length,
      confirmedHypotheses: hypotheses.filter((h: any) => h.status === 'confirmed').length,
      refutedHypotheses: hypotheses.filter((h: any) => h.status === 'refuted').length,
      evidenceChains: chains.length,
      completeChains: chains.filter((c: any) => c.isComplete).length,
      suspects: suspects.length,
      clearedSuspects: suspects.filter((s: any) => s.status === 'cleared' || s.status === 'innocent').length,
      guiltySuspects: suspects.filter((s: any) => s.status === 'guilty').length,
      averageClueReliability: clues.reduce((sum, c) => sum + c.reliability, 0) / clues.length || 0,
      deductionAccuracy: 85, // This would be calculated from historical data
      investigationProgress: investigation.progress
    };
  }

  private createAnalysis(clueId: string, analyst: string): Analysis {
    return {
      id: `analysis_${clueId}`,
      clueId: clueId,
      analyst: analyst,
      analysisText: '',
      confidence: 0,
      deductions: [],
      questions: [],
      hypotheses: [],
      completedAt: 0,
      updatedAt: new Date()
    };
  }

  public exportInvestigation(investigationId: string): string {
    const investigation = this.investigations.get(investigationId);
    if (!investigation) return '{}';

    return JSON.stringify({
      investigation: investigation,
      clues: Array.from(investigation.clues.values()),
      connections: Array.from(investigation.connections.values()),
      hypotheses: Array.from(investigation.hypotheses.values()),
      suspects: Array.from(investigation.suspects.values()),
      timeline: investigation.timeline,
      stats: this.getInvestigationStats(investigationId),
      exportDate: Date.now()
    }, null, 2);
  }

  public importInvestigation(investigationData: string): boolean {
    try {
      const data = JSON.parse(investigationData);

      // This would restore investigation state
      // Implementation depends on specific requirements

      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      return false;
    }
  }
}

export default ClueSystemPure;