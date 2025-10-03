import { Badge, BadgeSystem } from '../index';
export type CreditsSection = {
    title: string;
    contributors: ContributorCredit[];
    badges: Badge[];
};
export type ContributorCredit = {
    id: string;
    name: string;
    role: string;
    contributions: string[];
    badges: Badge[];
    remixLineage: string[];
};
export type CreditsLayout = {
    sections: CreditsSection[];
    theme: 'neon' | 'forest' | 'cosmic';
    style: 'compact' | 'detailed' | 'badge-focused';
    showBadges: boolean;
    showLineage: boolean;
    showContributions: boolean;
};
export type CreditsRendererOptions = {
    theme: 'neon' | 'forest' | 'cosmic';
    style: 'compact' | 'detailed' | 'badge-focused';
    showBadges: boolean;
    showLineage: boolean;
    showContributions: boolean;
    animation: boolean;
    overlay: boolean;
};
export declare class CreditsRenderer {
    private badgeSystem;
    private badgeRenderer;
    constructor(badgeSystem: BadgeSystem);
    generateCredits(options: CreditsRendererOptions): CreditsLayout;
    private createCreditsSections;
    private createContributorCredits;
    private getContributorName;
    private getContributorRole;
    renderCreditsWithBadges(options: CreditsRendererOptions): any;
    renderCompactCredits(options: CreditsRendererOptions): any;
    renderDetailedCredits(options: CreditsRendererOptions): any;
    renderBadgeFocusedCredits(options: CreditsRendererOptions): any;
    private getTopContributors;
    private getBadgeLevelScore;
    getCLIPreview(options: CreditsRendererOptions): string;
}
//# sourceMappingURL=renderCredits.d.ts.map