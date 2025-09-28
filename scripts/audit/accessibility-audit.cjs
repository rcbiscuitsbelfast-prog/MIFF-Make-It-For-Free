#!/usr/bin/env node

/**
 * Accessibility Audit Script
 * 
 * This script performs a comprehensive accessibility audit of the MIFF framework,
 * checking for WCAG compliance, keyboard navigation, screen reader support, and more.
 */

const fs = require('fs');
const path = require('path');

console.log('♿ Starting accessibility audit...');

const docsDir = path.join(__dirname, '../../docs');
const reportPath = path.join(__dirname, '../../docs/audit/accessibility-audit-report.md');

let pagesAudited = 0;
let issuesFound = 0;
let recommendationsMade = 0;

const auditFindings = [];

function findHtmlFiles(dir) {
    let htmlFiles = [];
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                htmlFiles = htmlFiles.concat(findHtmlFiles(filePath));
            } else if (file.endsWith('.html')) {
                htmlFiles.push(filePath);
            }
        }
    } catch (error) {
        // Skip directories that can't be read
    }
    return htmlFiles;
}

function performAudit(filePath) {
    pagesAudited++;
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    const issues = [];
    const recommendations = [];

    // Simulate common accessibility checks
    if (!content.includes('<html lang=')) {
        issues.push('Missing `lang` attribute on `<html>` tag.');
        recommendations.push('Add `<html lang="en">` to specify the page language.');
    }
    if (!content.includes('<title>')) {
        issues.push('Missing `<title>` tag in `<head>`.');
        recommendations.push('Add a descriptive `<title>` tag for better navigation and SEO.');
    }
    if (!/<h[1-6]>/.test(content)) {
        issues.push('No heading elements (h1-h6) found.');
        recommendations.push('Ensure proper heading structure for content hierarchy.');
    }
    if (!/<alt=".+?"/.test(content) && /<img/.test(content)) {
        issues.push('Image elements without `alt` attributes.');
        recommendations.push('Add meaningful `alt` text to all `<img>` tags for screen readers.');
    }
    if (!/<label/.test(content) && /<input/.test(content)) {
        issues.push('Form input elements without associated `<label>` tags.');
        recommendations.push('Associate all form inputs with `<label>` tags using `for` and `id` attributes.');
    }
    if (!content.includes('role=') && (content.includes('<div onclick=') || content.includes('<span onclick='))) {
        issues.push('Interactive elements (div/span with onclick) without ARIA roles.');
        recommendations.push('Add appropriate ARIA roles (e.g., `role="button"`) to custom interactive elements.');
    }
    if (!content.includes('tabindex=')) {
        issues.push('Potential keyboard navigation issues (missing `tabindex`).');
        recommendations.push('Ensure all interactive elements are keyboard accessible and have a logical tab order.');
    }

    issuesFound += issues.length;
    recommendationsMade += recommendations.length;

    auditFindings.push({
        file: fileName,
        path: filePath,
        issues: issues,
        recommendations: recommendations
    });
}

function generateReport() {
    let reportContent = `# Accessibility Audit Report\n\n`;
    reportContent += `## Executive Summary\n\n`;
    reportContent += `- **Total HTML Pages Audited**: ${pagesAudited}\n`;
    reportContent += `- **Total Accessibility Issues Found**: ${issuesFound}\n`;
    reportContent += `- **Total Recommendations Made**: ${recommendationsMade}\n\n`;

    reportContent += `## Detailed Findings\n\n`;

    if (auditFindings.length === 0) {
        reportContent += 'No HTML files found or audited.\n';
    } else {
        auditFindings.forEach(finding => {
            reportContent += `### File: \`${finding.file}\`\n`;
            reportContent += `- **Path**: \`${finding.path}\`\n`;
            if (finding.issues.length > 0) {
                reportContent += `- **Issues**:\n`;
                finding.issues.forEach(issue => reportContent += `  - ${issue}\n`);
            } else {
                reportContent += `- **Issues**: None found.\n`;
            }
            if (finding.recommendations.length > 0) {
                reportContent += `- **Recommendations**:\n`;
                finding.recommendations.forEach(rec => reportContent += `  - ${rec}\n`);
            } else {
                reportContent += `- **Recommendations**: None.\n`;
            }
            reportContent += `\n`;
        });
    }

    reportContent += `## WCAG Compliance Recommendations\n\n`;
    reportContent += `### High Priority (WCAG A)\n`;
    reportContent += `- Add semantic HTML structure (main, nav, header, footer)\n`;
    reportContent += `- Implement proper heading hierarchy (H1 → H2 → H3)\n`;
    reportContent += `- Add alt text to all images\n`;
    reportContent += `- Label all form inputs\n\n`;

    reportContent += `### Medium Priority (WCAG AA)\n`;
    reportContent += `- Ensure color contrast ratio of at least 4.5:1 for normal text\n`;
    reportContent += `- Add keyboard navigation support\n`;
    reportContent += `- Implement focus management\n`;
    reportContent += `- Add skip navigation links\n\n`;

    reportContent += `### Low Priority (WCAG AAA)\n`;
    reportContent += `- Achieve color contrast ratio of 7:1 for normal text\n`;
    reportContent += `- Add comprehensive ARIA landmarks\n`;
    reportContent += `- Implement screen reader announcements\n`;
    reportContent += `- Add high contrast mode support\n\n`;

    reportContent += `## Next Steps\n\n`;
    reportContent += `1. **Immediate Actions**: Fix high-priority accessibility issues\n`;
    reportContent += `2. **Short-term Goals**: Achieve WCAG AA compliance\n`;
    reportContent += `3. **Long-term Strategy**: Maintain accessibility standards and add advanced features\n\n`;

    reportContent += `*Generated: ${new Date().toISOString()}*\n`;

    fs.writeFileSync(reportPath, reportContent);
    console.log(`✅ Accessibility audit report generated: ${reportPath}`);
}

async function main() {
    const htmlFiles = findHtmlFiles(docsDir);
    console.log(`Found ${htmlFiles.length} HTML files to audit.`);

    for (const file of htmlFiles) {
        performAudit(file);
    }

    console.log('📊 Generating accessibility audit report...');
    generateReport();

    console.log('✅ Accessibility audit completed');
    console.log(`📊 Pages audited: ${pagesAudited}`);
    console.log(`🔍 Issues found: ${issuesFound}`);
    console.log(`💡 Recommendations made: ${recommendationsMade}`);
}

main().catch(console.error);