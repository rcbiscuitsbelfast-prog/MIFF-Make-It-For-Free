#!/usr/bin/env node

/**
 * Performance Monitor Script
 * Real-time performance monitoring and analysis
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const os = require('os');

console.log('📊 Starting Performance Monitor...\n');

const monitorConfig = {
  interval: 5000, // 5 seconds
  duration: 60000, // 1 minute
  outputFile: 'performance-monitor-report.json'
};

const metrics = {
  startTime: new Date(),
  endTime: null,
  duration: 0,
  samples: [],
  summary: {
    cpu: { min: 0, max: 0, avg: 0, samples: 0 },
    memory: { min: 0, max: 0, avg: 0, samples: 0 },
    heap: { min: 0, max: 0, avg: 0, samples: 0 },
    responseTime: { min: 0, max: 0, avg: 0, samples: 0 }
  },
  alerts: [],
  recommendations: []
};

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const icon = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${icon} [${timestamp}] ${message}`);
}

function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  
  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  
  return {
    usage: 100 - (100 * totalIdle / totalTick),
    load: os.loadavg(),
    cores: cpus.length
  };
}

function getMemoryUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  
  return {
    total,
    free,
    used,
    usage: (used / total) * 100
  };
}

function getHeapUsage() {
  const usage = process.memoryUsage();
  return {
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed,
    external: usage.external,
    arrayBuffers: usage.arrayBuffers
  };
}

function getResponseTime() {
  // Mock response time - in real scenario, this would measure actual API response times
  return Math.random() * 1000;
}

function collectMetrics() {
  const timestamp = new Date();
  const cpu = getCpuUsage();
  const memory = getMemoryUsage();
  const heap = getHeapUsage();
  const responseTime = getResponseTime();
  
  const sample = {
    timestamp,
    cpu,
    memory,
    heap,
    responseTime,
    uptime: process.uptime()
  };
  
  metrics.samples.push(sample);
  
  // Update summary
  updateSummary('cpu', cpu.usage);
  updateSummary('memory', memory.usage);
  updateSummary('heap', heap.heapUsed);
  updateSummary('responseTime', responseTime);
  
  // Check for alerts
  checkAlerts(sample);
  
  return sample;
}

function updateSummary(metric, value) {
  const summary = metrics.summary[metric];
  
  if (summary.samples === 0) {
    summary.min = value;
    summary.max = value;
    summary.avg = value;
  } else {
    summary.min = Math.min(summary.min, value);
    summary.max = Math.max(summary.max, value);
    summary.avg = (summary.avg * summary.samples + value) / (summary.samples + 1);
  }
  
  summary.samples++;
}

function checkAlerts(sample) {
  // CPU alerts
  if (sample.cpu.usage > 90) {
    addAlert('critical', 'cpu', `High CPU usage: ${sample.cpu.usage.toFixed(2)}%`);
  } else if (sample.cpu.usage > 80) {
    addAlert('warning', 'cpu', `Elevated CPU usage: ${sample.cpu.usage.toFixed(2)}%`);
  }
  
  // Memory alerts
  if (sample.memory.usage > 95) {
    addAlert('critical', 'memory', `Critical memory usage: ${sample.memory.usage.toFixed(2)}%`);
  } else if (sample.memory.usage > 85) {
    addAlert('warning', 'memory', `High memory usage: ${sample.memory.usage.toFixed(2)}%`);
  }
  
  // Heap alerts
  const heapUsageMB = sample.heap.heapUsed / 1024 / 1024;
  if (heapUsageMB > 1000) {
    addAlert('warning', 'heap', `Large heap usage: ${heapUsageMB.toFixed(2)} MB`);
  }
  
  // Response time alerts
  if (sample.responseTime > 5000) {
    addAlert('critical', 'performance', `Slow response time: ${sample.responseTime.toFixed(2)}ms`);
  } else if (sample.responseTime > 2000) {
    addAlert('warning', 'performance', `Elevated response time: ${sample.responseTime.toFixed(2)}ms`);
  }
}

function addAlert(severity, category, message) {
  const alert = {
    timestamp: new Date(),
    severity,
    category,
    message
  };
  
  metrics.alerts.push(alert);
  log(`🚨 ${severity.toUpperCase()} ALERT: ${message}`, 'warn');
}

function generateRecommendations() {
  const recommendations = [];
  
  // CPU recommendations
  if (metrics.summary.cpu.avg > 70) {
    recommendations.push({
      category: 'cpu',
      priority: 'high',
      message: 'Consider optimizing CPU-intensive operations or scaling horizontally'
    });
  }
  
  // Memory recommendations
  if (metrics.summary.memory.avg > 80) {
    recommendations.push({
      category: 'memory',
      priority: 'high',
      message: 'Consider optimizing memory usage or increasing available memory'
    });
  }
  
  // Heap recommendations
  if (metrics.summary.heap.avg > 500 * 1024 * 1024) { // 500MB
    recommendations.push({
      category: 'heap',
      priority: 'medium',
      message: 'Consider optimizing heap usage and implementing garbage collection tuning'
    });
  }
  
  // Response time recommendations
  if (metrics.summary.responseTime.avg > 1000) {
    recommendations.push({
      category: 'performance',
      priority: 'high',
      message: 'Consider optimizing response times through caching, database optimization, or code refactoring'
    });
  }
  
  // General recommendations
  recommendations.push({
    category: 'monitoring',
    priority: 'medium',
    message: 'Implement continuous performance monitoring in production'
  });
  
  recommendations.push({
    category: 'scaling',
    priority: 'low',
    message: 'Consider implementing auto-scaling based on performance metrics'
  });
  
  metrics.recommendations = recommendations;
}

function generateReport() {
  metrics.endTime = new Date();
  metrics.duration = metrics.endTime.getTime() - metrics.startTime.getTime();
  
  generateRecommendations();
  
  const report = {
    ...metrics,
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      totalMemory: os.totalmem(),
      cpuCores: os.cpus().length
    },
    thresholds: {
      cpu: { warning: 80, critical: 90 },
      memory: { warning: 85, critical: 95 },
      responseTime: { warning: 2000, critical: 5000 }
    }
  };
  
  // Save report
  const reportPath = path.join(process.cwd(), monitorConfig.outputFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`✅ Performance report saved: ${reportPath}`, 'success');
  
  return report;
}

function displaySummary(report) {
  console.log('\n📊 Performance Monitor Summary:');
  console.log(`   Duration: ${(report.duration / 1000).toFixed(2)}s`);
  console.log(`   Samples: ${report.samples.length}`);
  console.log(`   Alerts: ${report.alerts.length}`);
  console.log(`   Recommendations: ${report.recommendations.length}`);
  
  console.log('\n📈 Performance Metrics:');
  console.log(`   CPU Usage: ${report.summary.cpu.avg.toFixed(2)}% (min: ${report.summary.cpu.min.toFixed(2)}%, max: ${report.summary.cpu.max.toFixed(2)}%)`);
  console.log(`   Memory Usage: ${report.summary.memory.avg.toFixed(2)}% (min: ${report.summary.memory.avg.toFixed(2)}%, max: ${report.summary.memory.max.toFixed(2)}%)`);
  console.log(`   Heap Usage: ${(report.summary.heap.avg / 1024 / 1024).toFixed(2)} MB (min: ${(report.summary.heap.min / 1024 / 1024).toFixed(2)} MB, max: ${(report.summary.heap.max / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`   Response Time: ${report.summary.responseTime.avg.toFixed(2)}ms (min: ${report.summary.responseTime.min.toFixed(2)}ms, max: ${report.summary.responseTime.max.toFixed(2)}ms)`);
  
  if (report.alerts.length > 0) {
    console.log('\n🚨 Alerts:');
    report.alerts.forEach(alert => {
      console.log(`   [${alert.severity.toUpperCase()}] ${alert.message}`);
    });
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`   [${rec.priority.toUpperCase()}] ${rec.message}`);
    });
  }
}

async function main() {
  try {
    log('Starting performance monitoring...');
    log(`Monitoring interval: ${monitorConfig.interval}ms`);
    log(`Monitoring duration: ${monitorConfig.duration}ms`);
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const sample = collectMetrics();
      log(`Sample collected - CPU: ${sample.cpu.usage.toFixed(2)}%, Memory: ${sample.memory.usage.toFixed(2)}%, Response: ${sample.responseTime.toFixed(2)}ms`);
      
      if (Date.now() - startTime >= monitorConfig.duration) {
        clearInterval(interval);
        const report = generateReport();
        displaySummary(report);
        log('Performance monitoring completed', 'success');
        process.exit(0);
      }
    }, monitorConfig.interval);
    
    // Handle process termination
    process.on('SIGINT', () => {
      log('Performance monitoring interrupted by user', 'warn');
      clearInterval(interval);
      const report = generateReport();
      displaySummary(report);
      process.exit(0);
    });
    
  } catch (error) {
    log(`Performance monitoring failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the performance monitor
main().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});