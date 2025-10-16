# **🤖 MIFF AI Agent README**

**For AI agents, maintainers, and automated systems working with the MIFF framework.**

---

## **🎯 AI Agent Mission**

AI agents working with MIFF are responsible for:
- **Architectural Auditing** - Identifying hidden risks and architectural inconsistencies
- **CAPA Management** - Creating, updating, and resolving CAPA entries
- **Recovery Plan Execution** - Implementing phased recovery plan phases
- **Quality Assurance** - Enforcing architectural standards and patterns
- **Contributor Support** - Providing guidance and validation for new contributions

---

## **🛡️ CAPA System Integration**

### **CAPA Entry Management**
```bash
# List all CAPA entries
tsx miff/pure/shared/capaCLI.ts list

# Create new CAPA entry
tsx miff/pure/shared/capaCLI.ts create "Issue Title" "Description" critical "Affected Modules"

# Update CAPA entry status
tsx miff/pure/shared/capaCLI.ts update CAPA-ID status "Resolution details"

# Check CAPA impact for changes
tsx miff/pure/shared/capaCLI.ts check
```

### **CAPA Entry Categories**
- **schema_drift** - Schema inconsistencies across modules
- **stubbed_logic** - Mock implementations and stubbed functionality
- **asset_pipeline** - Asset validation and pipeline issues
- **interface_safety** - Interface standardization and consistency
- **runtime_fidelity** - Mock transport and runtime quality issues
- **migration_gaps** - Missing migration capabilities

### **CAPA Severity Levels**
- **critical** - Must be resolved immediately (blocks production)
- **high** - Should be resolved soon (affects functionality)
- **medium** - Can be resolved when convenient (quality improvement)
- **low** - Optional resolution (nice to have)

---

## **🔍 Audit Patterns and Prompts**

### **Architectural Audit Prompts**
```
// GOAL: Perform comprehensive architectural audit across MIFF modules
// CONTEXT: MIFF is a modular game development ecosystem with 157+ modules
// AUDIT TARGETS:
// 1. Schema Drift - Inconsistent schema usage across modules
// 2. Manager Method Usage - Proper manager class implementation
// 3. Test Coverage Realism - Real vs mock test implementations
// 4. CLI-to-Runtime Execution Fidelity - CLI vs actual runtime behavior
// 5. Cross-Module Dependency Loops - Circular dependencies
// 6. Contributor-Facing Interface Safety - API consistency
// 7. Asset Pipeline Integrity - Asset validation and processing
// 8. Migration Guide Gaps - Missing migration capabilities
// 9. Silent CLI Failures - Hidden error conditions
// 10. Runtime Fidelity Assumptions - Mock vs real implementations
// DELIVERABLES: Audit report, CAPA entries, risk assessment, recovery plan updates
```

### **Module Integration Audit Prompts**
```
// GOAL: Audit module integration and architectural compliance
// CONTEXT: New module [MODULE_NAME] being integrated into MIFF framework
// AUDIT CHECKLIST:
// 1. Naming Conventions - Follows MIFF naming patterns
// 2. File Structure - Required files present and properly organized
// 3. CLI Standardization - Extends BaseCLIHarness template
// 4. Capability Introspection - Implements MIFFCapable interface
// 5. Schema Compliance - Uses consolidated schema system
// 6. Error Handling - Standardized error handling patterns
// 7. No Stubbed Logic - All methods have real implementations
// 8. No Mock Transport - Real transport layers for bridge modules
// 9. Test Coverage - Comprehensive test suite
// 10. Documentation - Complete module documentation
// DELIVERABLES: Integration report, compliance score, required fixes
```

### **Performance Audit Prompts**
```
// GOAL: Analyze performance characteristics and optimization opportunities
// CONTEXT: MIFF framework performance analysis and optimization
// AUDIT AREAS:
// 1. Memory Usage - Heap usage, garbage collection, memory leaks
// 2. CPU Performance - Processing efficiency, algorithm optimization
// 3. Network Performance - Latency, bandwidth, connection pooling
// 4. Cache Performance - Hit rates, eviction policies, cache strategies
// 5. Database Performance - Query optimization, indexing, connection pooling
// 6. File I/O Performance - Read/write operations, file system access
// 7. Rendering Performance - Frame rates, draw calls, GPU usage
// 8. Startup Performance - Initialization time, module loading
// DELIVERABLES: Performance report, optimization targets, benchmarks
```

---

## **🔄 Recovery Plan Execution**

### **Phase Execution Patterns**
```
// GOAL: Execute Phase [NUMBER]: [PHASE_NAME]
// CONTEXT: MIFF framework phased recovery plan execution
// PHASE OBJECTIVES:
// 1. [Objective 1] - [Description and success criteria]
// 2. [Objective 2] - [Description and success criteria]
// 3. [Objective 3] - [Description and success criteria]
// 4. [Objective 4] - [Description and success criteria]
// DELIVERABLES:
// - [Deliverable 1] - [Description and acceptance criteria]
// - [Deliverable 2] - [Description and acceptance criteria]
// - [Deliverable 3] - [Description and acceptance criteria]
// SUCCESS METRICS:
// - [Metric 1] - [Target value and measurement method]
// - [Metric 2] - [Target value and measurement method]
// - [Metric 3] - [Target value and measurement method]
```

### **Current Phase Status**
- **Phase 1:** ✅ TypeScript Error Resolution (64 errors → 0)
- **Phase 2:** ✅ CLI Harness Standardization (12 harnesses standardized)
- **Phase 3:** ✅ Critical Architecture Fixes (Schema consolidation, migration system)
- **Phase 4:** ✅ Test Infrastructure Stabilization (Mock replacement, coverage analysis)
- **Phase 4.5:** ✅ Capability Introspection (Module capability discovery)
- **Phase 5:** ✅ Interface Standardization (API consistency, error handling)
- **Phase 6:** ✅ Runtime Fidelity (Mock replacement, transport layers, lifecycle hooks)
- **Phase 7:** ✅ Performance Optimization (Memory, CPU, network, caching)
- **Phase 8:** ✅ Documentation and Training (API docs, guides, tutorials)
- **Phase 9:** 🔄 Production Deployment (In Progress)
- **Phase 10:** ⏳ Final Integration and Testing (Pending)

---

## **🔧 CLI Tools for AI Agents**

### **Quality Assurance Tools**
```bash
# Interface Standardization
tsx miff/pure/shared/interfaceCLI.ts standardize miff/pure
tsx miff/pure/shared/interfaceCLI.ts analyze [module]
tsx miff/pure/shared/interfaceCLI.ts report

# Performance Analysis
tsx miff/pure/shared/performanceCLI.ts analyze
tsx miff/pure/shared/performanceCLI.ts targets
tsx miff/pure/shared/performanceCLI.ts optimize all

# Runtime Fidelity
tsx miff/pure/shared/fidelityCLI.ts scan miff/pure
tsx miff/pure/shared/fidelityCLI.ts replace critical
tsx miff/pure/shared/fidelityCLI.ts report

# Documentation Generation
tsx miff/pure/shared/docsCLI.ts generate
tsx miff/pure/shared/docsCLI.ts api
tsx miff/pure/shared/docsCLI.ts guides
tsx miff/pure/shared/docsCLI.ts tutorials
```

### **Capability Management Tools**
```bash
# Capability Discovery
tsx miff/pure/shared/capabilityCLI.ts discover
tsx miff/pure/shared/capabilityCLI.ts list
tsx miff/pure/shared/capabilityCLI.ts validate

# Migration Management
tsx miff/pure/shared/migrationCLI.ts migrate
tsx miff/pure/shared/migrationCLI.ts check
tsx miff/pure/shared/migrationCLI.ts stats

# Test Infrastructure
tsx miff/pure/shared/testInfrastructureCLI.ts scan
tsx miff/pure/shared/testInfrastructureCLI.ts mocks
tsx miff/pure/shared/testInfrastructureCLI.ts coverage
```

---

## **⚠️ Critical AI Agent Rules**

### **Architectural Enforcement**
1. **NEVER** allow stubbed logic, mock transport, or placeholder implementations
2. **ALWAYS** enforce capability introspection for new modules
3. **ALWAYS** require CLI standardization using BaseCLIHarness template
4. **ALWAYS** validate schema compliance and error handling patterns
5. **ALWAYS** create CAPA entries for architectural violations

### **Quality Assurance**
1. **ALWAYS** run interface standardization before accepting changes
2. **ALWAYS** validate performance impact of new features
3. **ALWAYS** ensure runtime fidelity for all implementations
4. **ALWAYS** require comprehensive test coverage
5. **ALWAYS** validate documentation completeness

### **CAPA Management**
1. **ALWAYS** create CAPA entries for discovered issues
2. **ALWAYS** update CAPA status when issues are resolved
3. **ALWAYS** include CAPA impact statements in PRs
4. **ALWAYS** check CAPA registry before making changes
5. **ALWAYS** escalate critical CAPA entries immediately

---

## **📊 AI Agent Success Metrics**

### **Audit Effectiveness**
- **Issues Discovered:** Number of hidden issues surfaced
- **CAPA Entries Created:** Number of CAPA entries generated
- **Architectural Violations:** Number of violations prevented
- **Quality Improvements:** Number of quality improvements implemented

### **Recovery Plan Progress**
- **Phases Completed:** Number of phases successfully completed
- **Objectives Met:** Percentage of phase objectives achieved
- **Deliverables Created:** Number of deliverables produced
- **Success Metrics:** Achievement of success criteria

### **Contributor Support**
- **Guidance Provided:** Number of contributors assisted
- **Issues Prevented:** Number of architectural issues prevented
- **Standards Enforced:** Number of standards violations caught
- **Documentation Generated:** Amount of documentation created

---

## **🚀 AI Agent Workflow**

### **Daily Operations**
1. **Check CAPA Registry** - Review active CAPA entries
2. **Run Quality Checks** - Execute interface and performance analysis
3. **Monitor Recovery Progress** - Track phase completion status
4. **Audit New Contributions** - Validate new modules and changes
5. **Update Documentation** - Generate and update documentation

### **Weekly Operations**
1. **Comprehensive Audit** - Full architectural audit across all modules
2. **Performance Analysis** - Deep performance analysis and optimization
3. **CAPA Review** - Review and update all CAPA entries
4. **Recovery Plan Update** - Update recovery plan based on progress
5. **Documentation Review** - Review and update all documentation

### **Monthly Operations**
1. **Strategic Assessment** - High-level architectural assessment
2. **Risk Analysis** - Identify and assess new risks
3. **Recovery Plan Revision** - Revise recovery plan based on learnings
4. **Contributor Training** - Update contributor guidelines and training
5. **System Optimization** - Optimize AI agent tools and processes

---

## **📚 AI Agent Resources**

### **Documentation**
- **CAPA Registry:** `miff/pure/shared/data/capa/entries.json`
- **Recovery Plan:** `docs/reports/2025-01-08-remaining-phases-report.md`
- **Architecture Audit:** `docs/reports/2025-01-08-comprehensive-architectural-audit.md`
- **Interface Standards:** `miff/pure/shared/InterfaceStandardizer.ts`
- **Performance Metrics:** `miff/pure/shared/PerformanceOptimizer.ts`

### **CLI Tools**
- **CAPA Management:** `miff/pure/shared/capaCLI.ts`
- **Interface Standardization:** `miff/pure/shared/interfaceCLI.ts`
- **Performance Optimization:** `miff/pure/shared/performanceCLI.ts`
- **Runtime Fidelity:** `miff/pure/shared/fidelityCLI.ts`
- **Documentation Generation:** `miff/pure/shared/docsCLI.ts`

### **Templates**
- **CAPA Entry Template:** `miff/pure/shared/templates/capa-entry.json`
- **Module Template:** `miff/pure/shared/templates/module-template/`
- **CLI Harness Template:** `miff/pure/shared/cliHarnessTemplate.ts`
- **Capability Template:** `miff/pure/shared/templates/capability-template.ts`

---

## **🎯 AI Agent Mission Statement**

**"To ensure MIFF framework architectural integrity, quality excellence, and contributor success through systematic auditing, CAPA management, and recovery plan execution."**

**Core Values:**
- **Architectural Integrity** - Maintain consistent, high-quality architecture
- **Quality Excellence** - Ensure all implementations meet high standards
- **Contributor Success** - Enable contributors to succeed with clear guidance
- **Continuous Improvement** - Continuously improve processes and outcomes
- **Risk Mitigation** - Proactively identify and mitigate risks

---

*This AI README provides comprehensive guidance for AI agents working with the MIFF framework. For human contributors, see the main README.md file.*