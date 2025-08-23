import fs from 'fs';
import path from 'path';
import { LicenseAuditManager, LicenseType } from './Manager';

type Cmd = 
  | { op: 'auditModule'; moduleId: string; moduleName: string; licenseType: LicenseType; dependencies?: string[]; licenseFiles?: string[] }
  | { op: 'getLicense'; moduleId: string }
  | { op: 'listLicenses'; licenseType?: LicenseType }
  | { op: 'getRemixSafe' }
  | { op: 'getAuditStats' }
  | { op: 'removeAudit'; moduleId: string };

function main() {
  const configPath = process.argv[2] || '';
  const cmdsPath = process.argv[3] || '';
  
  const mgr = new LicenseAuditManager();
  
  // Load config if provided
  if (configPath && fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(path.resolve(configPath), 'utf-8'));
    mgr.setConfig(config);
  }
  
  // Load commands
  const commands: Cmd[] = cmdsPath && fs.existsSync(cmdsPath) 
    ? JSON.parse(fs.readFileSync(path.resolve(cmdsPath), 'utf-8'))
    : [{ op: 'getAuditStats' }];
  
  const outputs: any[] = [];
  
  for (const cmd of commands) {
    switch (cmd.op) {
      case 'auditModule':
        outputs.push(mgr.auditModule(
          cmd.moduleId, 
          cmd.moduleName, 
          cmd.licenseType, 
          cmd.dependencies || [], 
          cmd.licenseFiles || []
        ));
        break;
        
      case 'getLicense':
        const license = mgr.getModuleLicense(cmd.moduleId);
        outputs.push({
          op: 'getLicense',
          status: license ? 'ok' : 'not_found',
          moduleId: cmd.moduleId,
          license: license
        });
        break;
        
      case 'listLicenses':
        const licenses = cmd.licenseType ? mgr.getLicensesByType(cmd.licenseType) : mgr.getAllLicenses();
        outputs.push({
          op: 'listLicenses',
          status: 'ok',
          licenseType: cmd.licenseType || 'all',
          count: licenses.length,
          licenses: licenses
        });
        break;
        
      case 'getRemixSafe':
        const remixSafe = mgr.getRemixSafeModules();
        outputs.push({
          op: 'getRemixSafe',
          status: 'ok',
          count: remixSafe.length,
          modules: remixSafe
        });
        break;
        
      case 'getAuditStats':
        outputs.push({
          op: 'getAuditStats',
          status: 'ok',
          stats: mgr.getAuditStats()
        });
        break;
        
      case 'removeAudit':
        const removed = mgr.removeAudit(cmd.moduleId);
        outputs.push({
          op: 'removeAudit',
          status: removed ? 'ok' : 'not_found',
          moduleId: cmd.moduleId,
          removed: removed
        });
        break;
        
      default:
        outputs.push({
          op: 'unknown',
          status: 'error',
          message: `Unknown operation: ${(cmd as any).op}`
        });
    }
  }
  
  console.log(JSON.stringify({ outputs }, null, 2));
}

if (require.main === module) main();