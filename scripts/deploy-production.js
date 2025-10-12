#!/usr/bin/env node

/**
 * Production Deployment Script
 * Automated production deployment with comprehensive validation and monitoring
 */

const { productionDeployment } = require('../miff/pure/shared/deployment/ProductionDeployment');
const { healthCheckSystem } = require('../miff/pure/shared/health/HealthCheckSystem');
const { productionMonitor } = require('../miff/pure/shared/monitoring/ProductionMonitor');

async function main() {
  console.log('🚀 Starting Production Deployment...\n');
  
  try {
    // Initialize deployment system
    console.log('📋 Initializing deployment system...');
    await productionDeployment.initialize();
    
    // Run pre-deployment health check
    console.log('🔍 Running pre-deployment health check...');
    const healthStatus = await healthCheckSystem.getHealthStatus();
    console.log(`   Health Status: ${healthStatus.status}`);
    console.log(`   Success Rate: ${healthStatus.summary.successRate}%`);
    
    if (healthStatus.status !== 'healthy') {
      console.error('❌ Pre-deployment health check failed. Aborting deployment.');
      process.exit(1);
    }
    
    // Start monitoring
    console.log('📊 Starting production monitoring...');
    await productionMonitor.initialize();
    
    // Deploy to production
    console.log('🚀 Deploying to production...');
    const deploymentStatus = await productionDeployment.deploy();
    
    // Display deployment results
    console.log('\n📊 Deployment Results:');
    console.log(`   Status: ${deploymentStatus.status}`);
    console.log(`   Duration: ${deploymentStatus.duration}ms`);
    console.log(`   Progress: ${deploymentStatus.progress}%`);
    
    if (deploymentStatus.validation) {
      console.log(`   Validation: ${deploymentStatus.validation.passed ? 'PASSED' : 'FAILED'}`);
      console.log(`   Success Rate: ${deploymentStatus.validation.summary.successRate}%`);
    }
    
    if (deploymentStatus.rollback) {
      console.log(`   Rollback: ${deploymentStatus.rollback.enabled ? 'ENABLED' : 'DISABLED'}`);
      console.log(`   Reason: ${deploymentStatus.rollback.reason}`);
    }
    
    // Display logs
    console.log('\n📝 Deployment Logs:');
    deploymentStatus.logs.forEach(log => {
      const timestamp = log.timestamp.toISOString();
      const level = log.level.toUpperCase().padEnd(5);
      console.log(`   [${timestamp}] ${level} ${log.message}`);
    });
    
    if (deploymentStatus.status === 'completed') {
      console.log('\n✅ Production deployment completed successfully!');
      console.log('🎉 The MIFF Framework is now live in production!');
    } else if (deploymentStatus.status === 'failed') {
      console.log('\n❌ Production deployment failed!');
      process.exit(1);
    } else if (deploymentStatus.status === 'rolled_back') {
      console.log('\n🔄 Production deployment was rolled back!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Deployment failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Deployment interrupted by user');
  try {
    await productionDeployment.destroy();
    await productionMonitor.destroy();
  } catch (error) {
    console.error('Error during cleanup:', error.message);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Deployment terminated');
  try {
    await productionDeployment.destroy();
    await productionMonitor.destroy();
  } catch (error) {
    console.error('Error during cleanup:', error.message);
  }
  process.exit(0);
});

// Run the deployment
main().catch(error => {
  console.error('💥 Fatal error:', error.message);
  process.exit(1);
});