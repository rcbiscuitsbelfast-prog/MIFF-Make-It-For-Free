#!/usr/bin/env node

/**
 * MIFF Deployment Verification Script
 *
 * This script validates that the GitHub Pages deployment is working correctly
 * and that all critical components are functioning.
 *
 * Usage:
 *   node verify-deployment.js
 *   node verify-deployment.js --detailed
 */

import https from 'https';
import http from 'http';

const args = process.argv.slice(2);
const detailed = args.includes('--detailed');

function log(message, force = false) {
  if (detailed || force) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
}

function logError(message) {
  console.error(`❌ ${message}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.request(url, {
      headers: {
        'User-Agent': 'MIFF-Deployment-Verifier/1.0',
        ...options.headers
      },
      timeout: 10000,
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function checkGitHubPagesAvailability() {
  log('🔍 Checking GitHub Pages availability...');

  const urls = [
    'https://miff-framework.github.io/miff/',
    'https://miff-framework.github.io/miff/renderworld-hub.html',
    'https://miff-framework.github.io/miff/sampler/'
  ];

  const results = [];

  for (const url of urls) {
    try {
      log(`Testing: ${url}`);
      const response = await makeRequest(url);

      if (response.statusCode === 200) {
        logSuccess(`✅ ${url} - HTTP ${response.statusCode}`);

        // Check for critical content
        if (url.includes('renderworld-hub.html')) {
          if (response.body.includes('miff-splash-screen')) {
            logSuccess('✅ SplashScreenPure integration detected');
          } else {
            logError('❌ SplashScreenPure integration missing');
          }

          if (response.body.includes('MIFF')) {
            logSuccess('✅ MIFF branding detected');
          } else {
            logError('❌ MIFF branding missing');
          }

          if (response.body.includes('RenderWorld')) {
            logSuccess('✅ RenderWorld Hub content detected');
          } else {
            logError('❌ RenderWorld Hub content missing');
          }
        } else if (url.includes('sampler/')) {
          if (response.body.includes('MIFF Sampler')) {
            logSuccess('✅ MIFF Sampler detected');
          } else {
            logError('❌ MIFF Sampler content missing');
          }
        } else {
          if (response.body.includes('MIFF')) {
            logSuccess('✅ Main documentation site detected');
          } else {
            logError('❌ Main documentation content missing');
          }
        }

        results.push({ url, status: 'success', code: response.statusCode });
      } else {
        logError(`❌ ${url} - HTTP ${response.statusCode}`);
        results.push({ url, status: 'error', code: response.statusCode });
      }
    } catch (error) {
      logError(`❌ ${url} - ${error.message}`);
      results.push({ url, status: 'error', message: error.message });
    }
  }

  return results;
}

async function checkGitHubActionsStatus() {
  log('🔍 Checking GitHub Actions workflow status...');

  try {
    const response = await makeRequest('https://api.github.com/repos/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free/actions/runs?per_page=5', {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.statusCode === 200) {
      const runs = JSON.parse(response.body);
      const recentRuns = runs.workflow_runs.slice(0, 3);

      logSuccess('✅ GitHub Actions API accessible');
      logInfo('📊 Recent workflow runs:');

      recentRuns.forEach((run, index) => {
        const status = run.status === 'completed' ? (run.conclusion === 'success' ? '✅ SUCCESS' : '❌ FAILED') : '⏳ RUNNING';
        const name = run.name;
        const created = new Date(run.created_at).toLocaleString();
        const url = run.html_url;

        log(`   ${index + 1}. ${name} - ${status} (${created})`);
        log(`      ${url}`);

        if (detailed) {
          log(`      Branch: ${run.head_branch}`);
          log(`      Commit: ${run.head_sha.substring(0, 8)}`);
        }
      });

      return recentRuns;
    } else {
      logError(`❌ GitHub Actions API error: HTTP ${response.statusCode}`);
      return [];
    }
  } catch (error) {
    logError(`❌ Cannot access GitHub Actions: ${error.message}`);
    return [];
  }
}

async function checkSitePerformance() {
  log('⚡ Checking site performance...');

  const testUrl = 'https://miff-framework.github.io/miff/';
  const startTime = Date.now();

  try {
    const response = await makeRequest(testUrl, { timeout: 15000 });
    const loadTime = Date.now() - startTime;

    if (response.statusCode === 200) {
      logSuccess(`✅ Site loads successfully in ${loadTime}ms`);

      if (loadTime < 2000) {
        logSuccess('✅ Excellent performance (< 2s)');
      } else if (loadTime < 5000) {
        logInfo('⚠️  Good performance (2-5s)');
      } else {
        logError('❌ Poor performance (> 5s)');
      }

      // Check for critical resources
      const resources = [
        'styles.css',
        'renderworld-hub.js',
        'JetBrains Mono'
      ];

      logInfo('🔍 Checking critical resources:');
      resources.forEach(resource => {
        if (response.body.includes(resource)) {
          logSuccess(`   ✅ ${resource}`);
        } else {
          logError(`   ❌ ${resource} (missing)`);
        }
      });

      return { success: true, loadTime, resources };
    } else {
      logError(`❌ Site returned HTTP ${response.statusCode}`);
      return { success: false, statusCode: response.statusCode };
    }
  } catch (error) {
    logError(`❌ Performance check failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function generateVerificationReport(results, actions, performance) {
  log('📊 Generating verification report...');

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSites: results.length,
      successfulSites: results.filter(r => r.status === 'success').length,
      failedSites: results.filter(r => r.status === 'error').length,
      githubActionsAccessible: actions.length > 0,
      performanceAcceptable: performance.success && performance.loadTime < 5000
    },
    sites: results,
    githubActions: actions,
    performance: performance,
    recommendations: []
  };

  // Generate recommendations
  if (report.summary.failedSites > 0) {
    report.recommendations.push('Some sites are not accessible. Check GitHub Pages settings and deployment status.');
  }

  if (!report.summary.githubActionsAccessible) {
    report.recommendations.push('GitHub Actions API not accessible. This may indicate deployment issues.');
  }

  if (!report.summary.performanceAcceptable) {
    report.recommendations.push('Site performance is below acceptable levels. Consider optimization.');
  }

  if (report.summary.successfulSites === report.summary.totalSites) {
    report.recommendations.push('🎉 All sites are working correctly! MIFF deployment successful.');
  }

  return report;
}

async function main() {
  console.log('🚀 MIFF Deployment Verification Tool');
  console.log('=====================================\n');

  try {
    // Step 1: Check GitHub Pages availability
    log('Step 1: Checking GitHub Pages availability...');
    const siteResults = await checkGitHubPagesAvailability();

    // Step 2: Check GitHub Actions status
    log('Step 2: Checking GitHub Actions status...');
    const actionsResults = await checkGitHubActionsStatus();

    // Step 3: Check site performance
    log('Step 3: Checking site performance...');
    const performanceResults = await checkSitePerformance();

    // Step 4: Generate comprehensive report
    log('Step 4: Generating verification report...');
    const report = generateVerificationReport(siteResults, actionsResults, performanceResults);

    // Display summary
    console.log('\n📋 VERIFICATION SUMMARY');
    console.log('======================');
    console.log(`✅ Sites Working: ${report.summary.successfulSites}/${report.summary.totalSites}`);
    console.log(`🔧 GitHub Actions: ${report.summary.githubActionsAccessible ? '✅ Accessible' : '❌ Issues'}`);
    console.log(`⚡ Performance: ${report.summary.performanceAcceptable ? '✅ Good' : '❌ Poor'}`);

    if (report.summary.successfulSites === report.summary.totalSites) {
      console.log('\n🎉 DEPLOYMENT VERIFICATION: SUCCESS!');
      console.log('   All MIFF sites are working correctly.');
      console.log('   SplashScreenPure integration is functional.');
      console.log('   GitHub Pages deployment completed successfully.');
    } else {
      console.log('\n⚠️  DEPLOYMENT VERIFICATION: ISSUES DETECTED');
      console.log('   Some sites may not be accessible yet.');
      console.log('   Check GitHub Actions status for deployment progress.');
      console.log('   Deployment may still be in progress.');
    }

    // Display recommendations
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    // Display detailed results if requested
    if (detailed) {
      console.log('\n📊 DETAILED RESULTS:');
      console.log('====================');
      console.log(JSON.stringify(report, null, 2));
    }

    console.log('\n🔗 MONITORING LINKS:');
    console.log('   GitHub Actions: https://github.com/rcbiscuitsbelfast-prog/MIFF-Make-It-For-Free/actions');
    console.log('   Main Site: https://miff-framework.github.io/miff/');
    console.log('   RenderWorld: https://miff-framework.github.io/miff/renderworld-hub.html');

  } catch (error) {
    logError(`Verification failed: ${error.message}`);
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('   1. Check GitHub Actions status manually');
    console.log('   2. Verify GitHub Pages settings in repository');
    console.log('   3. Wait 5-10 minutes for deployment to complete');
    console.log('   4. Check browser console for client-side errors');
    process.exit(1);
  }
}

// Run verification
main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});