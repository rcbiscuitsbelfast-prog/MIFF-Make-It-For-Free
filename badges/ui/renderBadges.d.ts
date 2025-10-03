import { Badge } from '../index';
export type BadgeIcon = {
    id: string;
    symbol: string;
    color: string;
    backgroundColor: string;
    borderColor: string;
    size: number;
};
export type BadgeTooltip = {
    title: string;
    description: string;
    criteria: string[];
    lineage: string[];
    notes?: string;
};
export type BadgeOverlay = {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    badges: Badge[];
    theme: 'neon' | 'forest' | 'cosmic';
    visible: boolean;
};
export type BadgeRendererOptions = {
    theme: 'neon' | 'forest' | 'cosmic';
    size: 'small' | 'medium' | 'large';
    showTooltips: boolean;
    showOverlay: boolean;
    animation: boolean;
};
export declare class BadgeRenderer {
    private themeStyles;
    private badgeIcons;
    constructor();
    private initializeThemeStyles;
    private initializeBadgeIcons;
    renderBadgeIcon(badge: Badge, options: BadgeRendererOptions): BadgeIcon;
    renderBadgeTooltip(badge: Badge, options: BadgeRendererOptions): BadgeTooltip;
    renderBadgeOverlay(badges: Badge[], options: BadgeRendererOptions): BadgeOverlay;
    renderContributorBadges(contributorId: string, badges: Badge[], options: BadgeRendererOptions): any;
    renderBadgeGrid(badges: Badge[], options: BadgeRendererOptions): any;
    renderCreditsOverlay(contributors: Map<string, Badge[]>, options: BadgeRendererOptions): any;
    private blendColors;
    private getBadgeScore;
    getAvailableThemes(): string[];
    getThemeStyle(theme: string): any;
    getCLIPreview(badges: Badge[], options: BadgeRendererOptions): string;
}
//# sourceMappingURL=renderBadges.d.ts.map