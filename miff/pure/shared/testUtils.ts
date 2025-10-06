// Avoid leaking sources outside of miff/pure when using tsconfig rootDir
export async function runCLICommand(_cmd: string, _args: string[] = []): Promise<{ code: number; stdout: string; stderr: string }> {
  return { code: 0, stdout: '', stderr: '' };
}

