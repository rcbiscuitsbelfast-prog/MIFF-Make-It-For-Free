import { promises as fs } from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'

export type AuditResult = {
  ok: boolean
  details: string[]
}

function normalize(p: string): string {
  return path.isAbsolute(p) ? p : path.join(process.cwd(), p)
}

export async function auditHTML(htmlPath: string): Promise<AuditResult> {
  const absPath = normalize(htmlPath)
  const details: string[] = []
  try {
    const content = await fs.readFile(absPath, 'utf8')
    details.push(`Found HTML at ${htmlPath}`)

    // Basic runtime wiring checks
    const hasCanvas = /<canvas\b/i.test(content) || /id=["']?game-canvas["']?/i.test(content)
    if (hasCanvas) {
      details.push('Canvas element detected')
    } else {
      details.push('WARN: No <canvas> detected')
    }

    const scriptSrcMatch = content.match(/<script[^>]+src=["']([^"']+)["']/i)
    if (scriptSrcMatch) {
      const scriptRel = scriptSrcMatch[1]
      const scriptAbs = path.join(path.dirname(absPath), scriptRel)
      try {
        await fs.access(scriptAbs)
        details.push(`Script reference OK: ${scriptRel}`)
      } catch {
        details.push(`ERROR: Script missing: ${scriptRel}`)
        return { ok: false, details }
      }
    } else {
      details.push('WARN: No external <script src> found')
    }

    return { ok: true, details }
  } catch (err: any) {
    details.push(`ERROR: Cannot read HTML at ${htmlPath}: ${err?.message ?? String(err)}`)
    return { ok: false, details }
  }
}

export function auditCLI(cliTsPath: string, args: string[] = []): AuditResult {
  const absPath = normalize(cliTsPath)
  const details: string[] = []
  try {
    // Prefer ts-node, fall back to node -r ts-node/register
    const command = 'npx'
    const commandArgs = ['ts-node', '--compiler-options', '{"module":"commonjs"}', absPath, ...args]
    const result = spawnSync(command, commandArgs, { encoding: 'utf8', cwd: process.cwd() })
    if (result.status !== 0) {
      details.push('ERROR: CLI harness failed to run')
      if (result.stdout) details.push(`stdout:\n${result.stdout}`)
      if (result.stderr) details.push(`stderr:\n${result.stderr}`)
      return { ok: false, details }
    }
    details.push('CLI harness executed successfully')
    if (result.stdout) details.push('Captured stdout OK')
    return { ok: true, details }
  } catch (err: any) {
    details.push(`ERROR: Failed to execute CLI: ${err?.message ?? String(err)}`)
    return { ok: false, details }
  }
}

export async function checkAssets(pureModuleName: string): Promise<AuditResult> {
  const details: string[] = []
  // Try several conventional locations
  const candidates = [
    path.join('miff', 'pure', pureModuleName, 'fixtures'),
    path.join(pureModuleName, 'fixtures'),
  ].map(normalize)

  for (const dir of candidates) {
    try {
      const entries = await fs.readdir(dir)
      const hasJson = entries.some(e => e.endsWith('.json'))
      if (hasJson) {
        details.push(`Found fixtures in ${dir}`)
        return { ok: true, details }
      }
      details.push(`INFO: No JSON fixtures in ${dir}`)
    } catch {
      details.push(`INFO: No fixtures directory at ${dir}`)
    }
  }
  details.push('WARN: No fixtures detected for module')
  return { ok: false, details }
}

export function checkOrchestration(pureModuleName: string): AuditResult {
  const details: string[] = []
  // Use existing orchestration validator script if present
  const scriptPath = normalize(path.join('miff', 'scripts', 'validate-orchestration.js'))
  try {
    const result = spawnSync('node', [scriptPath], { encoding: 'utf8' })
    if (result.status !== 0) {
      details.push('ERROR: Orchestration validation failed')
      if (result.stdout) details.push(`stdout:\n${result.stdout}`)
      if (result.stderr) details.push(`stderr:\n${result.stderr}`)
      return { ok: false, details }
    }
    details.push('Orchestration validation passed')
    return { ok: true, details }
  } catch (err: any) {
    details.push(`ERROR: Failed to run orchestration validator: ${err?.message ?? String(err)}`)
    return { ok: false, details }
  }
}

