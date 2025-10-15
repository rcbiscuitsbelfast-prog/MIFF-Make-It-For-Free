#!/usr/bin/env node

/**
 * Security Scan Script
 * Comprehensive security analysis and vulnerability scanning
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

console.log('🔒 Starting Security Scan...\n');

const scanResults = {
  timestamp: new Date().toISOString(),
  vulnerabilities: [],
  warnings: [],
  recommendations: [],
  score: 100,
  status: 'PASS'
};

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const icon = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${icon} [${timestamp}] ${message}`);
}

function addVulnerability(severity, category, message, file = null, line = null) {
  scanResults.vulnerabilities.push({
    severity,
    category,
    message,
    file,
    line,
    timestamp: new Date().toISOString()
  });
  
  // Adjust score based on severity
  switch (severity) {
    case 'critical': scanResults.score -= 20; break;
    case 'high': scanResults.score -= 15; break;
    case 'medium': scanResults.score -= 10; break;
    case 'low': scanResults.score -= 5; break;
  }
}

function addWarning(category, message, file = null) {
  scanResults.warnings.push({
    category,
    message,
    file,
    timestamp: new Date().toISOString()
  });
  scanResults.score -= 2;
}

function addRecommendation(category, message, priority = 'medium') {
  scanResults.recommendations.push({
    category,
    message,
    priority,
    timestamp: new Date().toISOString()
  });
}

async function scanDependencies() {
  log('Scanning dependencies for vulnerabilities...');
  
  try {
    const auditResult = execSync('npm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(auditResult);
    
    if (audit.vulnerabilities) {
      Object.entries(audit.vulnerabilities).forEach(([name, vuln]) => {
        addVulnerability(
          vuln.severity,
          'dependency',
          `${name}: ${vuln.title}`,
          'package.json'
        );
      });
    }
    
    log('✅ Dependency scan completed', 'success');
  } catch (error) {
    log('⚠️ Dependency scan failed, but continuing...', 'warn');
  }
}

async function scanCodeSecurity() {
  log('Scanning code for security issues...');
  
  const securityPatterns = [
    {
      pattern: /eval\s*\(/g,
      severity: 'critical',
      message: 'Use of eval() function detected - potential code injection vulnerability'
    },
    {
      pattern: /new\s+Function\s*\(/g,
      severity: 'high',
      message: 'Use of Function constructor detected - potential code injection vulnerability'
    },
    {
      pattern: /innerHTML\s*=/g,
      severity: 'medium',
      message: 'Direct innerHTML assignment detected - potential XSS vulnerability'
    },
    {
      pattern: /document\.write\s*\(/g,
      severity: 'medium',
      message: 'Use of document.write() detected - potential XSS vulnerability'
    },
    {
      pattern: /setTimeout\s*\(\s*["'`][^"'`]*["'`]/g,
      severity: 'high',
      message: 'String-based setTimeout detected - potential code injection vulnerability'
    },
    {
      pattern: /setInterval\s*\(\s*["'`][^"'`]*["'`]/g,
      severity: 'high',
      message: 'String-based setInterval detected - potential code injection vulnerability'
    },
    {
      pattern: /process\.env\.\w+/g,
      severity: 'low',
      message: 'Direct process.env access detected - consider using environment validation'
    },
    {
      pattern: /console\.(log|debug|info|warn|error)/g,
      severity: 'low',
      message: 'Console logging detected - remove in production builds'
    },
    {
      pattern: /password\s*:\s*["'`][^"'`]*["'`]/gi,
      severity: 'critical',
      message: 'Hardcoded password detected - use environment variables'
    },
    {
      pattern: /secret\s*:\s*["'`][^"'`]*["'`]/gi,
      severity: 'critical',
      message: 'Hardcoded secret detected - use environment variables'
    },
    {
      pattern: /api[_-]?key\s*:\s*["'`][^"'`]*["'`]/gi,
      severity: 'critical',
      message: 'Hardcoded API key detected - use environment variables'
    },
    {
      pattern: /token\s*:\s*["'`][^"'`]*["'`]/gi,
      severity: 'critical',
      message: 'Hardcoded token detected - use environment variables'
    }
  ];

  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        securityPatterns.forEach(({ pattern, severity, message }) => {
          const matches = line.match(pattern);
          if (matches) {
            addVulnerability(severity, 'code', message, filePath, index + 1);
          }
        });
      });
    } catch (error) {
      addWarning('file_access', `Could not read file: ${filePath}`);
    }
  }

  function scanDirectory(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
          scanFile(filePath);
        }
      });
    } catch (error) {
      addWarning('directory_access', `Could not scan directory: ${dirPath}`);
    }
  }

  // Scan source files
  scanDirectory('miff/pure');
  
  log('✅ Code security scan completed', 'success');
}

async function scanEnvironmentSecurity() {
  log('Scanning environment configuration...');
  
  const envFiles = ['.env', '.env.production', '.env.staging', '.env.local'];
  
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      try {
        const content = fs.readFileSync(envFile, 'utf8');
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          // Check for weak secrets
          if (line.includes('SECRET') || line.includes('KEY') || line.includes('PASSWORD')) {
            const value = line.split('=')[1];
            if (value && value.length < 32) {
              addVulnerability('medium', 'environment', `Weak secret detected in ${envFile}`, envFile, index + 1);
            }
          }
          
          // Check for default values
          if (line.includes('=default') || line.includes('=password') || line.includes('=secret')) {
            addVulnerability('high', 'environment', `Default value detected in ${envFile}`, envFile, index + 1);
          }
          
          // Check for commented secrets
          if (line.startsWith('#') && (line.includes('SECRET') || line.includes('KEY') || line.includes('PASSWORD'))) {
            addWarning('environment', `Commented secret in ${envFile}`, envFile);
          }
        });
        
        log(`✅ Environment file scanned: ${envFile}`, 'success');
      } catch (error) {
        addWarning('environment', `Could not read environment file: ${envFile}`);
      }
    }
  });
}

async function scanFilePermissions() {
  log('Checking file permissions...');
  
  const sensitiveFiles = [
    '.env',
    '.env.production',
    '.env.staging',
    'package.json',
    'package-lock.json'
  ];
  
  sensitiveFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const stats = fs.statSync(file);
        const mode = stats.mode & parseInt('777', 8);
        
        // Check if file is world-readable
        if (mode & 0o004) {
          addVulnerability('medium', 'permissions', `File ${file} is world-readable`, file);
        }
        
        // Check if file is world-writable
        if (mode & 0o002) {
          addVulnerability('high', 'permissions', `File ${file} is world-writable`, file);
        }
      } catch (error) {
        addWarning('permissions', `Could not check permissions for: ${file}`);
      }
    }
  });
}

async function scanNetworkSecurity() {
  log('Checking network security configuration...');
  
  // Check for hardcoded URLs
  const urlPattern = /https?:\/\/[^\s'"]+/g;
  const files = ['package.json', 'tsconfig.json', 'webpack.config.js'];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const urls = content.match(urlPattern);
        
        if (urls) {
          urls.forEach(url => {
            if (url.includes('localhost') || url.includes('127.0.0.1')) {
              addWarning('network', `Hardcoded localhost URL detected: ${url}`, file);
            }
          });
        }
      } catch (error) {
        addWarning('network', `Could not scan file for URLs: ${file}`);
      }
    }
  });
}

async function generateSecurityReport() {
  log('Generating security report...');
  
  // Determine overall status
  if (scanResults.vulnerabilities.some(v => v.severity === 'critical')) {
    scanResults.status = 'CRITICAL';
  } else if (scanResults.vulnerabilities.some(v => v.severity === 'high')) {
    scanResults.status = 'HIGH';
  } else if (scanResults.vulnerabilities.some(v => v.severity === 'medium')) {
    scanResults.status = 'MEDIUM';
  } else if (scanResults.warnings.length > 0) {
    scanResults.status = 'LOW';
  } else {
    scanResults.status = 'PASS';
  }
  
  // Generate recommendations
  if (scanResults.vulnerabilities.length > 0) {
    addRecommendation('security', 'Address all security vulnerabilities before production deployment', 'high');
  }
  
  if (scanResults.warnings.length > 0) {
    addRecommendation('security', 'Review and address security warnings', 'medium');
  }
  
  addRecommendation('security', 'Implement automated security scanning in CI/CD pipeline', 'medium');
  addRecommendation('security', 'Regular security audits and dependency updates', 'medium');
  addRecommendation('security', 'Implement Content Security Policy (CSP) headers', 'medium');
  addRecommendation('security', 'Use HTTPS in production with proper SSL/TLS configuration', 'high');
  addRecommendation('security', 'Implement rate limiting and DDoS protection', 'medium');
  
  // Save report
  const reportPath = path.join(process.cwd(), 'security-scan-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(scanResults, null, 2));
  
  log(`✅ Security report saved: ${reportPath}`, 'success');
}

async function main() {
  try {
    await scanDependencies();
    await scanCodeSecurity();
    await scanEnvironmentSecurity();
    await scanFilePermissions();
    await scanNetworkSecurity();
    await generateSecurityReport();
    
    // Display summary
    console.log('\n📊 Security Scan Summary:');
    console.log(`   Status: ${scanResults.status}`);
    console.log(`   Score: ${scanResults.score}/100`);
    console.log(`   Vulnerabilities: ${scanResults.vulnerabilities.length}`);
    console.log(`   Warnings: ${scanResults.warnings.length}`);
    console.log(`   Recommendations: ${scanResults.recommendations.length}`);
    
    if (scanResults.vulnerabilities.length > 0) {
      console.log('\n🚨 Vulnerabilities Found:');
      scanResults.vulnerabilities.forEach(vuln => {
        console.log(`   ${vuln.severity.toUpperCase()}: ${vuln.message}`);
        if (vuln.file) {
          console.log(`      File: ${vuln.file}${vuln.line ? `:${vuln.line}` : ''}`);
        }
      });
    }
    
    if (scanResults.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      scanResults.warnings.forEach(warning => {
        console.log(`   ${warning.category}: ${warning.message}`);
        if (warning.file) {
          console.log(`      File: ${warning.file}`);
        }
      });
    }
    
    if (scanResults.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      scanResults.recommendations.forEach(rec => {
        console.log(`   [${rec.priority.toUpperCase()}] ${rec.message}`);
      });
    }
    
    if (scanResults.status === 'PASS') {
      console.log('\n🎉 Security scan passed! No critical issues found.');
      process.exit(0);
    } else {
      console.log(`\n⚠️  Security scan completed with ${scanResults.status.toLowerCase()} issues.`);
      process.exit(1);
    }
    
  } catch (error) {
    log(`💥 Security scan failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the security scan
main().catch(error => {
  log(`💥 Fatal error: ${error.message}`, 'error');
  process.exit(1);
});