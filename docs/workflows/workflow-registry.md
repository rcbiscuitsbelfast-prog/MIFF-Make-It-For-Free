# ⚙️ MIFF Workflow Registry

**Version:** 1.0  
**Last Updated:** 2025-01-08  
**Status:** Active

---

## 📋 **Workflow Overview**

This registry documents all GitHub Actions workflows in the MIFF framework, providing a comprehensive view of CI/CD automation, quality assurance, and contributor safety measures.

### **Registry Purpose**
- **Track all workflows** and their purposes
- **Monitor workflow health** and performance
- **Ensure contributor safety** through automated checks
- **Maintain architectural consistency** across the framework
- **Provide clear documentation** for workflow maintenance

---

## 🔄 **Active Workflows**

### **Core CI/CD Workflows**

| Workflow | Trigger | Purpose | CAPA Impact | Status |
|----------|---------|---------|-------------|---------|
| **audit-ci.yml** | Push/PR to master | Run audits and coverage analysis | High | ✅ Active |
| **build-deploy.yml** | Push to master | Build and deploy applications | Medium | ✅ Active |
| **ci-core.yml** | Push/PR to master/develop | Core CI pipeline with testing | High | ✅ Active |
| **coverage.yml** | Push/PR to master | Generate and upload coverage reports | High | ✅ Active |
| **test-coverage.yml** | Push/PR to master | Test coverage validation | High | ✅ Active |
| **testing.yml** | Push/PR to master | Run test suites | High | ✅ Active |

### **Quality Assurance Workflows**

| Workflow | Trigger | Purpose | CAPA Impact | Status |
|----------|---------|---------|-------------|---------|
| **capa-validation.yml** | Push/PR to master | CAPA enforcement and PR blocking | Critical | ✅ Active |
| **schema-drift-detection.yml** | Push/PR to master/develop, Weekly | Detect schema inconsistencies | High | ✅ Active |
| **cli-harness-validation.yml** | Push/PR to master/develop, Weekly | Validate CLI harness structure | High | ✅ Active |
| **lifecycle-hook-coverage.yml** | Push/PR to master/develop, Weekly | Analyze lifecycle hook implementation | Medium | ✅ Active |
| **transport-layer-fidelity.yml** | Push/PR to master/develop, Weekly | Check transport layer quality | Medium | ✅ Active |
| **test-coverage-regression.yml** | Push/PR to master/develop, Weekly | Detect test coverage regression | High | ✅ Active |

### **Security and Monitoring Workflows**

| Workflow | Trigger | Purpose | CAPA Impact | Status |
|----------|---------|---------|-------------|---------|
| **security-scan.yml** | Weekly, Push/PR to master | Security vulnerability scanning | Critical | ✅ Active |
| **security.yml** | Push/PR to master | Security checks and validation | Critical | ✅ Active |
| **monitoring.yml** | Push/PR to master/develop, Every 4 hours | Performance and health monitoring | Medium | ✅ Active |

### **Documentation and Maintenance Workflows**

| Workflow | Trigger | Purpose | CAPA Impact | Status |
|----------|---------|---------|-------------|---------|
| **lighthouse-ci.yml** | Push/PR to master | Lighthouse performance testing | Low | ✅ Active |
| **link-check.yml** | Push/PR to master | Check for broken links | Low | ✅ Active |
| **maintenance.yml** | Weekly | Repository maintenance tasks | Low | ✅ Active |
| **release.yml** | Push tags | Automated release process | Medium | ✅ Active |

---

## 🛡️ **CAPA Integration**

### **Critical CAPA Workflows**
- **capa-validation.yml**: Enforces CAPA entries and blocks PRs with critical issues
- **schema-drift-detection.yml**: Prevents schema inconsistencies (CAPA category: `schema_drift`)
- **cli-harness-validation.yml**: Ensures CLI consistency (CAPA category: `interface_safety`)

### **High Priority CAPA Workflows**
- **test-coverage-regression.yml**: Prevents test coverage degradation (CAPA category: `skipped_tests`)
- **lifecycle-hook-coverage.yml**: Ensures proper lifecycle implementation (CAPA category: `runtime_fidelity`)
- **transport-layer-fidelity.yml**: Validates transport layer quality (CAPA category: `runtime_fidelity`)

---

## 📊 **Workflow Statistics**

### **Total Workflows: 18**
- **Core CI/CD:** 6 workflows
- **Quality Assurance:** 6 workflows  
- **Security & Monitoring:** 3 workflows
- **Documentation & Maintenance:** 3 workflows

### **Trigger Distribution**
- **Push/PR triggered:** 15 workflows
- **Scheduled:** 8 workflows
- **Manual dispatch:** 4 workflows

### **CAPA Impact Distribution**
- **Critical:** 3 workflows
- **High:** 8 workflows
- **Medium:** 5 workflows
- **Low:** 2 workflows

---

## 🔧 **Workflow Maintenance**

### **Adding New Workflows**

When adding new workflows to MIFF:

1. **Follow Naming Convention:**
   - Use kebab-case: `workflow-name.yml`
   - Be descriptive and specific
   - Include purpose in name

2. **Include Required Sections:**
   ```yaml
   name: Workflow Name
   on: [triggers]
   permissions:
     contents: read
     actions: read
   jobs:
     job-name:
       runs-on: ubuntu-latest
       steps: [...]
   ```

3. **Add to Registry:**
   - Update this registry document
   - Include all required metadata
   - Set appropriate CAPA impact level

4. **Test Thoroughly:**
   - Test on feature branch first
   - Verify all steps execute correctly
   - Check artifact generation
   - Validate error handling

### **Workflow Health Monitoring**

Each workflow includes:
- **Comprehensive logging** for debugging
- **Artifact generation** for reports
- **Error handling** with clear messages
- **PR commenting** for feedback
- **Failure conditions** to prevent regressions

### **Performance Optimization**

- **Parallel execution** where possible
- **Caching** for dependencies
- **Conditional execution** based on file changes
- **Efficient artifact management**

---

## 🚨 **Critical Workflows**

### **PR Blocking Workflows**
These workflows can block PRs if issues are detected:

1. **capa-validation.yml** - Blocks on critical CAPA entries
2. **schema-drift-detection.yml** - Blocks on schema inconsistencies  
3. **cli-harness-validation.yml** - Blocks on CLI structure issues
4. **test-coverage-regression.yml** - Blocks on coverage regression

### **Security Workflows**
These workflows ensure security compliance:

1. **security-scan.yml** - Weekly vulnerability scanning
2. **security.yml** - Security validation on every PR

### **Quality Gates**
These workflows enforce quality standards:

1. **test-coverage-regression.yml** - Minimum 80% coverage
2. **lifecycle-hook-coverage.yml** - Minimum 80% hook coverage
3. **transport-layer-fidelity.yml** - Minimum 80% transport patterns

---

## 📈 **Workflow Metrics**

### **Success Rates**
- **Overall Success Rate:** 95%+ (target)
- **Critical Workflows:** 99%+ (target)
- **Security Workflows:** 100% (required)

### **Performance Targets**
- **Workflow Duration:** < 10 minutes (target)
- **Critical Workflows:** < 5 minutes (target)
- **Scheduled Workflows:** < 15 minutes (acceptable)

### **Coverage Targets**
- **Test Coverage:** 80%+ (enforced)
- **Schema Coverage:** 90%+ (target)
- **CLI Coverage:** 95%+ (target)

---

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Workflow Failures:**
   - Check GitHub Actions logs
   - Verify dependency installation
   - Check file permissions and paths

2. **PR Blocking:**
   - Review CAPA entries: `tsx miff/pure/shared/capaCLI.ts list --severity critical`
   - Check schema consistency: `tsx miff/pure/shared/ConsolidatedSchema.ts --validate`
   - Verify CLI structure: `tsx miff/pure/shared/interfaceCLI.ts analyze`

3. **Performance Issues:**
   - Check workflow duration in Actions tab
   - Review caching configuration
   - Optimize parallel execution

### **Getting Help**

- **Workflow Logs:** Check GitHub Actions tab
- **CAPA Issues:** Use `tsx miff/pure/shared/capaCLI.ts help`
- **Schema Issues:** Use `tsx miff/pure/shared/ConsolidatedSchema.ts --help`
- **CLI Issues:** Use `tsx miff/pure/shared/interfaceCLI.ts help`

---

## 📚 **Related Documentation**

- **[CAPA Workflow Guide](contributor-guides/capa-workflow.md)** - How to work with CAPA system
- **[Contributor Onboarding](contributors/onboarding.md)** - Getting started with MIFF
- **[Testing Guide](TESTING.md)** - How to write and run tests
- **[CLI Documentation](api/CLI.md)** - CLI harness development

---

**⚙️ This registry ensures all MIFF workflows are properly documented, maintained, and aligned with the framework's quality standards.**