#!/usr/bin/env tsx

/**
 * Security Hardening CLI Tool
 * 
 * Command-line interface for security hardening, audit, and monitoring
 * for the MIFF framework.
 */

import { SecurityHardening, SecurityAudit, SecurityEvent } from './SecurityHardening.js';
import * as fs from 'fs';
import * as path from 'path';

class SecurityCLI {
  private security: SecurityHardening;

  constructor() {
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
    const command = args[0];

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
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }

  private async initializeSecurity(args: string[]): Promise<void> {
    console.log('🔒 Initializing security hardening...');
    
    await this.security.initialize();
    
    console.log('✅ Security hardening initialized');
    console.log('📋 Security features enabled:');
    console.log('  - Security headers');
    console.log('  - Rate limiting');
    console.log('  - Input validation');
    console.log('  - Password policy enforcement');
    console.log('  - Data encryption');
  }

  private async runSecurityAudit(args: string[]): Promise<void> {
    const outputFile = args[0] || 'security-audit-report.json';

    console.log('🔍 Running security audit...');
    
    const audit = await this.security.runSecurityAudit();
    
    // Save audit report
    fs.writeFileSync(outputFile, JSON.stringify(audit, null, 2));
    
    console.log('✅ Security audit completed');
    console.log(`📄 Report saved to ${outputFile}`);

    // Display audit results
    console.log('\n📊 Security Audit Results:');
    console.log(`Overall Score: ${audit.score}/100`);
    console.log(`Vulnerabilities: ${audit.vulnerabilities.length}`);
    console.log(`Recommendations: ${audit.recommendations.length}`);
    
    console.log('\n🔒 Compliance Status:');
    console.log(`GDPR: ${audit.compliance.gdpr ? '✅' : '❌'}`);
    console.log(`CCPA: ${audit.compliance.ccpa ? '✅' : '❌'}`);
    console.log(`SOX: ${audit.compliance.sox ? '✅' : '❌'}`);
    console.log(`PCI: ${audit.compliance.pci ? '✅' : '❌'}`);
    console.log(`HIPAA: ${audit.compliance.hipaa ? '✅' : '❌'}`);
    console.log(`Overall: ${audit.compliance.overall ? '✅' : '❌'}`);
    
    if (audit.vulnerabilities.length > 0) {
      console.log('\n🚨 Vulnerabilities:');
      audit.vulnerabilities.forEach(vuln => {
        const severityIcon = vuln.severity === 'critical' ? '🔴' : 
                            vuln.severity === 'high' ? '🟠' : 
                            vuln.severity === 'medium' ? '🟡' : '🟢';
        console.log(`  ${severityIcon} ${vuln.description} (${vuln.severity})`);
      });
    }
    
    if (audit.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      audit.recommendations.forEach(rec => {
        console.log(`  - ${rec}`);
      });
    }
  }

  private async showSecurityHeaders(args: string[]): Promise<void> {
    const outputFile = args[0] || 'security-headers.json';

    console.log('📋 Security Headers:');
    
    const headers = this.security.getSecurityHeaders();
    
    // Save headers
    fs.writeFileSync(outputFile, JSON.stringify(headers, null, 2));
    
    console.log('✅ Security headers generated');
    console.log(`📄 Headers saved to ${outputFile}`);

    // Display headers
    console.log('\n📋 Security Headers:');
    Object.entries(headers).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  }

  private async validateInput(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.error('Usage: validate <input> <type>');
      console.error('Types: string, number, email, url, json');
      return;
    }

    const input = args[0];
    const type = args[1] as 'string' | 'number' | 'email' | 'url' | 'json';

    console.log(`🔍 Validating input as ${type}...`);
    
    const result = this.security.validateInput(input, type);
    
    if (result.valid) {
      console.log('✅ Input is valid');
      if (result.sanitized !== undefined) {
        console.log(`Sanitized: ${JSON.stringify(result.sanitized)}`);
      }
    } else {
      console.log('❌ Input is invalid');
      console.log('Errors:');
      result.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
  }

  private async validatePassword(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('Usage: password <password>');
      return;
    }

    const password = args[0];

    console.log('🔍 Validating password...');
    
    const result = this.security.validatePassword(password);
    
    if (result.valid) {
      console.log('✅ Password is valid');
    } else {
      console.log('❌ Password is invalid');
      console.log('Errors:');
      result.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }
  }

  private async encryptData(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('Usage: encrypt <data>');
      return;
    }

    const data = args[0];

    console.log('🔐 Encrypting data...');
    
    const encrypted = this.security.encrypt(data);
    
    console.log('✅ Data encrypted');
    console.log(`Encrypted: ${encrypted}`);
  }

  private async decryptData(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('Usage: decrypt <encrypted_data>');
      return;
    }

    const encryptedData = args[0];

    console.log('🔓 Decrypting data...');
    
    try {
      const decrypted = this.security.decrypt(encryptedData);
      console.log('✅ Data decrypted');
      console.log(`Decrypted: ${decrypted}`);
    } catch (error) {
      console.log('❌ Decryption failed');
      console.log('Error:', error instanceof Error ? error.message : error);
    }
  }

  private async showSecurityEvents(args: string[]): Promise<void> {
    const limit = args[0] ? parseInt(args[0]) : 50;

    console.log(`📊 Security Events (last ${limit}):`);
    
    const events = this.security.getSecurityEvents(limit);
    
    if (events.length === 0) {
      console.log('No security events found');
      return;
    }

    events.forEach(event => {
      const severityIcon = event.severity === 'critical' ? '🔴' : 
                          event.severity === 'high' ? '🟠' : 
                          event.severity === 'medium' ? '🟡' : '🟢';
      console.log(`  ${severityIcon} ${event.type} (${event.severity}) - ${event.timestamp.toISOString()}`);
      console.log(`    Source: ${event.source}`);
      console.log(`    Details: ${JSON.stringify(event.details)}`);
    });
  }

  private async showSecurityStats(args: string[]): Promise<void> {
    const outputFile = args[0] || 'security-stats.json';

    console.log('📊 Security Statistics:');
    
    const stats = this.security.getSecurityStats();
    
    // Save stats
    fs.writeFileSync(outputFile, JSON.stringify(stats, null, 2));
    
    console.log('✅ Security statistics generated');
    console.log(`📄 Stats saved to ${outputFile}`);

    // Display stats
    console.log(`\n📊 Security Statistics:`);
    console.log(`Total Events: ${stats.totalEvents}`);
    console.log(`Recent Events (24h): ${stats.recentEvents}`);
    console.log(`Blocked IPs: ${stats.blockedIPs}`);
    
    console.log('\nEvents by Type:');
    for (const [type, count] of stats.eventsByType.entries()) {
      console.log(`  ${type}: ${count}`);
    }
    
    console.log('\nEvents by Severity:');
    for (const [severity, count] of stats.eventsBySeverity.entries()) {
      console.log(`  ${severity}: ${count}`);
    }
  }

  private async blockIP(args: string[]): Promise<void> {
    if (args.length < 2) {
      console.error('Usage: block <ip> <reason>');
      return;
    }

    const ip = args[0];
    const reason = args.slice(1).join(' ');

    console.log(`🚫 Blocking IP: ${ip}`);
    
    this.security.blockIP(ip, reason);
    
    console.log(`✅ IP ${ip} blocked`);
    console.log(`Reason: ${reason}`);
  }

  private async unblockIP(args: string[]): Promise<void> {
    if (args.length < 1) {
      console.error('Usage: unblock <ip>');
      return;
    }

    const ip = args[0];

    console.log(`🔓 Unblocking IP: ${ip}`);
    
    this.security.unblockIP(ip);
    
    console.log(`✅ IP ${ip} unblocked`);
  }

  private showHelp(): void {
    console.log(`
🔒 MIFF Security Hardening CLI

Usage: tsx securityCLI.ts <command> [options]

Commands:
  init                        Initialize security hardening
  audit [output]              Run security audit
  headers [output]            Show security headers
  validate <input> <type>     Validate input data
  password <password>         Validate password
  encrypt <data>              Encrypt sensitive data
  decrypt <encrypted_data>    Decrypt data
  events [limit]              Show security events
  stats [output]              Show security statistics
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
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new SecurityCLI();
  cli.run().catch(console.error);
}

export default SecurityCLI;