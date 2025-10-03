export type BadgeType = 'Remix Pioneer' | 'Asset Auditor' | 'Scenario Designer' | 'Theme Stylist' | 'Debug Master';
export type BadgeCriteria = {
    remixDepth: number;
    assetValidation: number;
    scenarioCreation: number;
    themeContributions: number;
    debugContributions: number;
};
export type Badge = {
    id: string;
    type: BadgeType;
    contributorId: string;
    timestamp: string;
    sourceZone: string;
    criteria: BadgeCriteria;
    metadata: {
        remixLineage: string[];
        contributorNotes?: string;
        badgeLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
        achievementDate: string;
    };
};
export type BadgeAssignment = {
    contributorId: string;
    badgeType: BadgeType;
    sourceZone: string;
    criteria: Partial<BadgeCriteria>;
    notes?: string;
};
export type BadgeDisplayOptions = {
    remix?: boolean;
    debug?: boolean;
    credits?: boolean;
    theme?: 'neon' | 'forest' | 'cosmic';
    overlay?: boolean;
    tooltip?: boolean;
};
export type BadgeSystemState = {
    badges: Map<string, Badge>;
    contributors: Map<string, string[]>;
    assignments: Map<string, BadgeAssignment[]>;
    displaySettings: BadgeDisplayOptions;
};
export declare class BadgeSystem {
    private state;
    constructor();
    generateBadge(assignment: BadgeAssignment): Badge;
    assignBadge(assignment: BadgeAssignment): Badge;
    displayBadges(contributorId?: string, options?: BadgeDisplayOptions): Badge[];
    getBadge(badgeId: string): Badge | undefined;
    getContributorBadges(contributorId: string): Badge[];
    getBadgesByType(badgeType: BadgeType): Badge[];
    private calculateCriteriaScore;
    private determineBadgeLevel;
    private normalizeCriteria;
    private generateRemixLineage;
    updateDisplaySettings(settings: Partial<BadgeDisplayOptions>): void;
    getDisplaySettings(): BadgeDisplayOptions;
    exportState(): any;
    importState(state: any): void;
    getBadgeCount(): number;
    getContributorCount(): number;
    getBadgeTypeCount(badgeType: BadgeType): number;
    getCLIPreview(contributorId?: string): string;
}
export { CreditsRenderer } from './ui/renderCredits';
//# sourceMappingURL=index.d.ts.map