#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📊 MIFF Framework Monitoring System\n');

// Monitoring configuration
const config = {
  interval: 5000, // 5 seconds
  logFile: './logs/monitor.log',
  maxLogSize: 10 * 1024 * 1024, // 10MB
  alertThresholds: {
    memoryUsage: 80, // 80%
    cpuUsage: 80, // 80%
    responseTime: 1000, // 1 second
    errorRate: 5 // 5%
  }
};

// Monitoring data
const monitoringData = {
  startTime: Date.now(),
  metrics: [],
  alerts: [],
  isRunning: false
};

// Create logs directory if it doesn't exist
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs', { recursive: true });
}

// Logging function
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  // Write to log file
  fs.appendFileSync(config.logFile, logMessage);
  
  // Rotate log file if it's too large
  const stats = fs.statSync(config.logFile);
  if (stats.size > config.maxLogSize) {
    const rotatedFile = config.logFile.replace('.log', `-${Date.now()}.log`);
    fs.renameSync(config.logFile, rotatedFile);
    fs.writeFileSync(config.logFile, '');
  }
}

// Get system metrics
function getSystemMetrics() {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    timestamp: Date.now(),
    memory: {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system,
      percentage: 0 // Would need more complex calculation for real CPU usage
    },
    uptime: process.uptime(),
    pid: process.pid
  };
}

// Check for alerts
function checkAlerts(metrics) {
  const alerts = [];
  
  if (metrics.memory.percentage > config.alertThresholds.memoryUsage) {
    alerts.push({
      type: 'MEMORY_HIGH',
      message: `Memory usage is ${metrics.memory.percentage.toFixed(2)}% (threshold: ${config.alertThresholds.memoryUsage}%)`,
      severity: 'WARNING',
      timestamp: metrics.timestamp
    });
  }
  
  if (metrics.cpu.percentage > config.alertThresholds.cpuUsage) {
    alerts.push({
      type: 'CPU_HIGH',
      message: `CPU usage is ${metrics.cpu.percentage.toFixed(2)}% (threshold: ${config.alertThresholds.cpuUsage}%)`,
      severity: 'WARNING',
      timestamp: metrics.timestamp
    });
  }
  
  return alerts;
}

// Generate monitoring report
function generateReport() {
  const now = Date.now();
  const uptime = now - monitoringData.startTime;
  const metrics = monitoringData.metrics;
  
  if (metrics.length === 0) {
    return 'No metrics available';
  }
  
  const latest = metrics[metrics.length - 1];
  const memoryAvg = metrics.reduce((sum, m) => sum + m.memory.percentage, 0) / metrics.length;
  const memoryMax = Math.max(...metrics.map(m => m.memory.percentage));
  const memoryMin = Math.min(...metrics.map(m => m.memory.percentage));
  
  return `
📊 MIFF Framework Monitoring Report
=====================================
Uptime: ${Math.floor(uptime / 1000)}s
PID: ${latest.pid}

Memory Usage:
  Current: ${latest.memory.percentage.toFixed(2)}%
  Average: ${memoryAvg.toFixed(2)}%
  Maximum: ${memoryMax.toFixed(2)}%
  Minimum: ${memoryMin.toFixed(2)}%
  Used: ${(latest.memory.used / 1024 / 1024).toFixed(2)}MB
  Total: ${(latest.memory.total / 1024 / 1024).toFixed(2)}MB

CPU Usage:
  User: ${latest.cpu.user}μs
  System: ${latest.cpu.system}μs

Alerts: ${monitoringData.alerts.length}
Recent Alerts:
${monitoringData.alerts.slice(-5).map(alert => 
  `  [${alert.timestamp}] ${alert.severity}: ${alert.message}`
).join('\n')}
  `.trim();
}

// Monitor Manager files
function monitorManagerFiles() {
  const managerFiles = [];
  function findManagerFiles(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          findManagerFiles(filePath);
        } else if (file === 'Manager.ts') {
          managerFiles.push(filePath);
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible directories
    }
  }
  
  findManagerFiles('./miff/pure');
  return managerFiles.length;
}

// Monitor test files
function monitorTestFiles() {
  const testFiles = [];
  function findTestFiles(dir) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          findTestFiles(filePath);
        } else if (file.endsWith('.test.ts')) {
          testFiles.push(filePath);
        }
      }
    } catch (error) {
      // Ignore errors for inaccessible directories
    }
  }
  
  findTestFiles('./miff/pure');
  return testFiles.length;
}

// Main monitoring loop
function startMonitoring() {
  monitoringData.isRunning = true;
  log('Monitoring started');
  
  const interval = setInterval(() => {
    if (!monitoringData.isRunning) {
      clearInterval(interval);
      return;
    }
    
    try {
      // Collect metrics
      const metrics = getSystemMetrics();
      monitoringData.metrics.push(metrics);
      
      // Keep only last 100 metrics
      if (monitoringData.metrics.length > 100) {
        monitoringData.metrics = monitoringData.metrics.slice(-100);
      }
      
      // Check for alerts
      const alerts = checkAlerts(metrics);
      monitoringData.alerts.push(...alerts);
      
      // Keep only last 50 alerts
      if (monitoringData.alerts.length > 50) {
        monitoringData.alerts = monitoringData.alerts.slice(-50);
      }
      
      // Log alerts
      alerts.forEach(alert => {
        log(`ALERT: ${alert.message}`, alert.severity);
      });
      
      // Log metrics every 10 iterations (50 seconds)
      if (monitoringData.metrics.length % 10 === 0) {
        log(`Memory: ${metrics.memory.percentage.toFixed(2)}%, CPU: ${metrics.cpu.percentage.toFixed(2)}%`);
      }
      
    } catch (error) {
      log(`Error collecting metrics: ${error.message}`, 'ERROR');
    }
  }, config.interval);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('Shutting down monitoring...');
    monitoringData.isRunning = false;
    
    // Generate final report
    console.log('\n' + generateReport());
    
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('Shutting down monitoring...');
    monitoringData.isRunning = false;
    
    // Generate final report
    console.log('\n' + generateReport());
    
    process.exit(0);
  });
}

// Start monitoring
startMonitoring();

// Log initial status
log('MIFF Framework monitoring system started');
log(`Monitoring interval: ${config.interval}ms`);
log(`Log file: ${config.logFile}`);
log(`Manager files: ${monitorManagerFiles()}`);
log(`Test files: ${monitorTestFiles()}`);

// Keep the process running
setInterval(() => {
  // This keeps the process alive
}, 1000);