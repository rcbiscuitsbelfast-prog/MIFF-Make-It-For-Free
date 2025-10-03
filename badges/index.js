// Badge System — Contributor Recognition and Remix Lineage (Remix-Safe)
// Purpose: Recognizes contributors with badges based on their contributions and remix lineage
// Schema: Pure JSON outputs, deterministic, engine-agnostic
export class BadgeSystem {
    constructor() {
        this.state = {
            badges: new Map(),
            contributors: new Map(),
            assignments: new Map(),
            displaySettings: {
                remix: false, // Don't filter by remix by default
                debug: false, // Don't filter by debug by default
                credits: true,
                theme: 'neon',
                overlay: true,
                tooltip: true
            }
        };
    }
    // Badge Generation
    generateBadge(assignment) {
        const badgeId = `${assignment.contributorId}_${assignment.badgeType}_${Date.now()}`;
        const timestamp = new Date().toISOString();
        // Calculate badge level based on criteria
        const totalScore = this.calculateCriteriaScore(assignment.criteria);
        const badgeLevel = this.determineBadgeLevel(totalScore);
        // Generate remix lineage
        const remixLineage = this.generateRemixLineage(assignment.sourceZone);
        const badge = {
            id: badgeId,
            type: assignment.badgeType,
            contributorId: assignment.contributorId,
            timestamp,
            sourceZone: assignment.sourceZone,
            criteria: this.normalizeCriteria(assignment.criteria),
            metadata: {
                remixLineage,
                contributorNotes: assignment.notes,
                badgeLevel,
                achievementDate: timestamp
            }
        };
        return badge;
    }
    // Badge Assignment
    assignBadge(assignment) {
        const badge = this.generateBadge(assignment);
        // Store badge
        this.state.badges.set(badge.id, badge);
        // Update contributor mapping
        if (!this.state.contributors.has(assignment.contributorId)) {
            this.state.contributors.set(assignment.contributorId, []);
        }
        this.state.contributors.get(assignment.contributorId).push(badge.id);
        // Store assignment
        if (!this.state.assignments.has(assignment.contributorId)) {
            this.state.assignments.set(assignment.contributorId, []);
        }
        this.state.assignments.get(assignment.contributorId).push(assignment);
        return badge;
    }
    // Badge Display
    displayBadges(contributorId, options = {}) {
        const displayOptions = { ...this.state.displaySettings, ...options };
        let badges = [];
        if (contributorId) {
            // Display badges for specific contributor
            const contributorBadgeIds = this.state.contributors.get(contributorId) || [];
            badges = contributorBadgeIds.map(id => this.state.badges.get(id));
        }
        else {
            // Display all badges
            badges = Array.from(this.state.badges.values());
        }
        // Filter based on display options
        if (displayOptions.remix !== undefined) {
            badges = badges.filter(badge => displayOptions.remix ? badge.metadata.remixLineage.length > 0 : true);
        }
        if (displayOptions.debug !== undefined) {
            badges = badges.filter(badge => displayOptions.debug ? badge.type === 'Debug Master' : true);
        }
        return badges;
    }
    // Badge Management
    getBadge(badgeId) {
        return this.state.badges.get(badgeId);
    }
    getContributorBadges(contributorId) {
        const badgeIds = this.state.contributors.get(contributorId) || [];
        return badgeIds.map(id => this.state.badges.get(id));
    }
    getBadgesByType(badgeType) {
        return Array.from(this.state.badges.values())
            .filter(badge => badge.type === badgeType);
    }
    // Criteria Calculation
    calculateCriteriaScore(criteria) {
        let score = 0;
        score += (criteria.remixDepth || 0) * 10;
        score += (criteria.assetValidation || 0) * 5;
        score += (criteria.scenarioCreation || 0) * 8;
        score += (criteria.themeContributions || 0) * 6;
        score += (criteria.debugContributions || 0) * 4;
        return score;
    }
    determineBadgeLevel(score) {
        if (score >= 100)
            return 'Platinum';
        if (score >= 75)
            return 'Gold';
        if (score >= 50)
            return 'Silver';
        if (score >= 25)
            return 'Bronze';
        return 'Bronze';
    }
    normalizeCriteria(criteria) {
        return {
            remixDepth: criteria.remixDepth || 0,
            assetValidation: criteria.assetValidation || 0,
            scenarioCreation: criteria.scenarioCreation || 0,
            themeContributions: criteria.themeContributions || 0,
            debugContributions: criteria.debugContributions || 0
        };
    }
    generateRemixLineage(sourceZone) {
        // Generate deterministic remix lineage based on source zone
        const lineageMap = {
            'overlink_pure': ['MIFF Framework', 'OverlinkPure Zone'],
            'neon_grid': ['MIFF Framework', 'OverlinkThemes', 'NeonGrid Theme'],
            'forest_glade': ['MIFF Framework', 'OverlinkThemes', 'ForestGlade Theme'],
            'cosmic_void': ['MIFF Framework', 'OverlinkThemes', 'CosmicVoid Theme'],
            'remix_lab': ['MIFF Framework', 'RemixLineageTracker'],
            'audio_manager': ['MIFF Framework', 'AudioManager', 'Theme Audio']
        };
        return lineageMap[sourceZone] || ['MIFF Framework', sourceZone];
    }
    // Display Settings
    updateDisplaySettings(settings) {
        this.state.displaySettings = { ...this.state.displaySettings, ...settings };
    }
    getDisplaySettings() {
        return { ...this.state.displaySettings };
    }
    // State Management
    exportState() {
        return {
            badges: Array.from(this.state.badges.entries()),
            contributors: Array.from(this.state.contributors.entries()),
            assignments: Array.from(this.state.assignments.entries()),
            displaySettings: this.state.displaySettings
        };
    }
    importState(state) {
        if (state.badges)
            this.state.badges = new Map(state.badges);
        if (state.contributors)
            this.state.contributors = new Map(state.contributors);
        if (state.assignments)
            this.state.assignments = new Map(state.assignments);
        if (state.displaySettings)
            this.state.displaySettings = { ...state.displaySettings };
    }
    // Utility Functions
    getBadgeCount() {
        return this.state.badges.size;
    }
    getContributorCount() {
        return this.state.contributors.size;
    }
    getBadgeTypeCount(badgeType) {
        return this.getBadgesByType(badgeType).length;
    }
    // CLI Preview
    getCLIPreview(contributorId) {
        let output = '=== Badge System Status ===\n';
        output += `Total Badges: ${this.getBadgeCount()}\n`;
        output += `Total Contributors: ${this.getContributorCount()}\n\n`;
        if (contributorId) {
            const badges = this.getContributorBadges(contributorId);
            output += `=== Contributor: ${contributorId} ===\n`;
            output += `Badges: ${badges.length}\n`;
            badges.forEach(badge => {
                output += `  ${badge.type} (${badge.metadata.badgeLevel}) - ${badge.timestamp}\n`;
                output += `    Source: ${badge.sourceZone}\n`;
                output += `    Lineage: ${badge.metadata.remixLineage.join(' → ')}\n`;
            });
        }
        else {
            output += '=== Badge Types ===\n';
            const types = ['Remix Pioneer', 'Asset Auditor', 'Scenario Designer', 'Theme Stylist', 'Debug Master'];
            types.forEach(type => {
                output += `${type}: ${this.getBadgeTypeCount(type)}\n`;
            });
        }
        return output;
    }
}
// Re-export CreditsRenderer from UI module
export { CreditsRenderer } from './ui/renderCredits';
//# sourceMappingURL=index.js.map