#!/usr/bin/env tsx

/**
 * Security Hardening CLI Tool
 * 
 * Command-line interface for security hardening, audit, and monitoring
 * for the MIFF framework.
 */

import { SecurityHardening } from './SecurityHardening.js';
import * as fs from 'fs';
import * as path from 'path';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class SecurityCLI {
  
  private security: SecurityHardening;

  constructor(...args: any[]) {
    
    this.security = new SecurityHardening({
      enableSSL: false, // Set to true for production
      enableSecurityHeaders: true,
      enableRateLimiting: true,
      enableInputValidation: true,
      enableCSRFProtection: true,
      enableXSSProtection: true,
      enableSQLInjectionProtection: true,
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      sessionTimeout: 1800, // 30 minutes
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        preventReuse: 5
      }
    });
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0!];

    try {
      switch (command) {
        case 'init':
          await this.initializeSecurity(args.slice(1));
          break;
        case 'audit':
          await this.runSecurityAudit(args.slice(1));
          break;
        case 'headers':
          await this.showSecurityHeaders(args.slice(1));
          break;
        case 'validate':
          await this.validateInput(args.slice(1));
          break;
        case 'password':
          await this.validatePassword(args.slice(1));
          break;
        case 'encrypt':
          await this.encryptData(args.slice(1));
          break;
        case 'decrypt':
          await this.decryptData(args.slice(1));
          break;
        case 'events':
          await this.showSecurityEvents(args.slice(1));
          break;
        case 'stats':
          await this.showSecurityStats(args.slice(1));
          break;
        case 'block':
          await this.blockIP(args.slice(1));
          break;
        case 'unblock':
          await this.unblockIP(args.slice(1));
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async initializeSecurity(args: string[]): Promise<void> {
    console.info('🔒 Initializing security hardening...');
    
    await this.security.initialize();
    
    console.info('✅ Security hardening initialized');
    console.info('📋 Security features enabled:');
    console.info('  - Security headers');
    console.info('  - Rate limiting');
    console.info('  - Input validation');
    console.info('  - Password policy enforcement');
    console.info('  - Data encryption');
  }

  private async runSecurityAudit(args: string[]): Promise<void> {
    const outputFile = args[0!] || 'security-audit-report.json';

    console.info('🔍 Running security audit...');
    
    const audit = await this.security.runSecurityAudit();
    
    // Save audit report
    fs.writeFileSync(outputFile, JSON.stringify(audit, null, 2));
    
    console.info('✅ Security audit completed');
    console.info(`📄 Report saved to ${outputFile}`);

    // Display audit results
    console.info('\n📊 Security Audit Results:');
    console.info(`Overall Score: ${audit.score}/100`);
    console.info(`Vulnerabilities: ${audit.vulnerabilities.length}`);
    console.info(`Recommendations: ${audit.recommendations.length}`);
    
    console.info('\n🔒 Compliance Status:');
    console.info(`GDPR: ${audit.compliance.gdpr ? '✅' : '❌'}`);
    console.info(`CCPA: ${audit.compliance.ccpa ? '✅' : '❌'}`);
    console.info(`SOX: ${audit.compliance.sox ? '✅' : '❌'}`);
    console.info(`PCI: ${audit.compliance.pci ? '✅' : '❌'}`);
    console.info(`HIPAA: ${audit.compliance.hipaa ? '✅' : '❌'}`);
    console.info(`Overall: ${audit.compliance.overall ? '✅' : '❌'}`);
    
    if (audit.vulnerabilities.length > 0) {
      console.info('\n🚨 Vulnerabilities:');
      audit.vulnerabilities.forEach((vuln: any) => {
        const severityIcon = vuln.severity === 'critical' ? '🔴' : 
                            vuln.severity === 'high' ? '🟠' : 
                            vuln.severity === 'medium' ? '🟡' : '🟢';
        console.info(`  ${severityIcon} ${vuln.description} (${vuln.severity})`);
      });
    }
    
    if (audit.recommendations.length > 0) {
      console.info('\n💡 Recommendations:');
      audit.recommendations.forEach((rec: any) => {
        console.info(`  - ${rec}`);
      });
    }
  }

  private async showSecurityHeaders(args: string[]): Promise<void> {
    const outputFile = args[0!] || 'security-headers.json';

    console.info('📋 Security Headers:');
    
    const headers = this.security.getSecurityHeaders();
    
    // Save headers
    fs.writeFileSync(outputFile, JSON.stringify(headers, null, 2));
    
    console.info('✅ Security headers generated');
    console.info(`📄 Headers saved to ${outputFile}`);

    // Display headers
    console.info('\n📋 Security Headers:');
    Object.entries(headers).forEach(([key, value]) => {
      console.info(`  ${key}: ${value}`);
    });
  }

  private async validateInput(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.error('Usage: validate <input> <type>');
      console.error('Types: string, number, email, url, json');
      return;
    }

    const input = args[0!];
    const type = args[1!] as 'string' | 'number' | 'email' | 'url' | 'json';

    console.info(`🔍 Validating input as ${type}...`);
    
    const result = this.security.validateInput(input, type);
    
    if (result.valid) {
      console.info('✅ Input is valid');
      if (result.sanitized !== undefined) {
        console.info(`Sanitized: ${JSON.stringify(result.sanitized)}`);
      }
    } else {
      console.info('❌ Input is invalid');
      console.info('Errors:');
      result.errors?.forEach((error: any) => {
        console.info(`  - ${error}`);
      });
    }
  }

  private async validatePassword(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('Usage: password <password>');
      return;
    }

    const password = args[0!];

    console.info('🔍 Validating password...');
    
    const result = this.security.validatePassword(password);
    
    if (result.valid) {
      console.info('✅ Password is valid');
    } else {
      console.info('❌ Password is invalid');
      console.info('Errors:');
      result.errors?.forEach((error: any) => {
        console.info(`  - ${error}`);
      });
    }
  }

  private async encryptData(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('Usage: encrypt <data>');
      return;
    }

    const data = args[0!];

    console.info('🔐 Encrypting data...');
    
    const encrypted = this.security.encrypt(data);
    
    console.info('✅ Data encrypted');
    console.info(`Encrypted: ${encrypted}`);
  }

  private async decryptData(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('Usage: decrypt <encrypted_data>');
      return;
    }

    const encryptedData = args[0!];

    console.info('🔓 Decrypting data...');
    
    try {
      const decrypted = this.security.decrypt(encryptedData);
      console.info('✅ Data decrypted');
      console.info(`Decrypted: ${decrypted}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.info('❌ Decryption failed');
      console.info('Error:', error instanceof Error ? error.message : error);
    }
  }

  private async showSecurityEvents(args: string[]): Promise<void> {
    const limit = args[0!] ? parseInt(args[0!]) : 50;

    console.info(`📊 Security Events (last ${limit}):`);
    
    const events = this.security.getSecurityEvents(limit);
    
    if (events.length === 0) {
      console.info('No security events found');
      return;
    }

    events.forEach((event: any) => {
      const severityIcon = event.severity === 'critical' ? '🔴' : 
                          event.severity === 'high' ? '🟠' : 
                          event.severity === 'medium' ? '🟡' : '🟢';
      console.info(`  ${severityIcon} ${event.type} (${event.severity}) - ${event.timestamp.toISOString()}`);
      console.info(`    Source: ${event.source}`);
      console.info(`    Details: ${JSON.stringify(event.details)}`);
    });
  }

  private async showSecurityStats(args: string[]): Promise<void> {
    const outputFile = args[0!] || 'security-stats.json';

    console.info('📊 Security Statistics:');
    
    const stats = this.security.getSecurityStats();
    
    // Save stats
    fs.writeFileSync(outputFile, JSON.stringify(stats, null, 2));
    
    console.info('✅ Security statistics generated');
    console.info(`📄 Stats saved to ${outputFile}`);

    // Display stats
    console.info(`\n📊 Security Statistics:`);
    console.info(`Total Events: ${stats.totalEvents}`);
    console.info(`Recent Events (24h): ${stats.recentEvents}`);
    console.info(`Blocked IPs: ${stats.blockedIPs}`);
    
    console.info('\nEvents by Type:');
    for (const [type, count] of stats.eventsByType.entries()) {
      console.info(`  ${type}: ${count}`);
    }
    
    console.info('\nEvents by Severity:');
    for (const [severity, count] of stats.eventsBySeverity.entries()) {
      console.info(`  ${severity}: ${count}`);
    }
  }

  private async blockIP(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.error('Usage: block <ip> <reason>');
      return;
    }

    const ip = args[0!];
    const reason = args.slice(1).join(' ');

    console.info(`🚫 Blocking IP: ${ip}`);
    
    this.security.blockIP(ip, reason);
    
    console.info(`✅ IP ${ip} blocked`);
    console.info(`Reason: ${reason}`);
  }

  private async unblockIP(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('Usage: unblock <ip>');
      return;
    }

    const ip = args[0!];

    console.info(`🔓 Unblocking IP: ${ip}`);
    
    this.security.unblockIP(ip);
    
    console.info(`✅ IP ${ip} unblocked`);
  }

  private showHelp(): void {
    console.info(`
🔒 MIFF Security Hardening CLI

Usage: tsx securityCLI.ts <command> [options!]

Commands:
  init                        Initialize security hardening
  audit [output!]              Run security audit
  headers [output!]            Show security headers
  validate <input> <type>     Validate input data
  password <password>         Validate password
  encrypt <data>              Encrypt sensitive data
  decrypt <encrypted_data>    Decrypt data
  events [limit!]              Show security events
  stats [output!]              Show security statistics
  block <ip> <reason>         Block IP address
  unblock <ip>                Unblock IP address
  help                        Show this help

Input Types:
  string                      String validation
  number                      Number validation
  email                       Email validation
  url                         URL validation
  json                        JSON validation

Examples:
  tsx securityCLI.ts init
  tsx securityCLI.ts audit
  tsx securityCLI.ts audit security-report.json
  tsx securityCLI.ts headers
  tsx securityCLI.ts validate "test@example.com" email
  tsx securityCLI.ts password "MySecure123!"
  tsx securityCLI.ts encrypt "sensitive data"
  tsx securityCLI.ts decrypt "encrypted_data"
  tsx securityCLI.ts events 100
  tsx securityCLI.ts stats
  tsx securityCLI.ts block 192.168.1.100 "Suspicious activity"
  tsx securityCLI.ts unblock 192.168.1.100

Security Features:
  - SSL/TLS configuration
  - Security headers
  - Rate limiting
  - Input validation
  - Password policy enforcement
  - Data encryption
  - IP blocking
  - Security event logging
  - Compliance auditing
`);
  }
}

// Run the CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1!]}`) {
  const cli = new SecurityCLI();
  cli.run().catch(console.error);
}

export default SecurityCLI;