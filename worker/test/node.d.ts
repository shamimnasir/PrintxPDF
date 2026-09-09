/**
 * Minimal ambient declarations for the node builtins convert.test.ts uses.
 *
 * The project deliberately types against Workers only (`types` in tsconfig.json is just
 * worker-configuration.d.ts). Pulling in @types/node would redeclare fetch/Request/Response
 * globally and clash with the Workers versions in src/, so the handful of node APIs the test
 * runner needs are declared here instead, where they cannot leak into the Worker's types.
 */

declare module 'node:child_process' {
  export function spawnSync(
    command: string,
    args?: readonly string[],
    options?: { encoding?: string },
  ): { status: number | null; stdout: string; stderr: string; error?: Error }
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string
}

declare module 'node:path' {
  export function dirname(p: string): string
  export function resolve(...paths: string[]): string
}

declare module 'node:fs' {
  export function readFileSync(path: string, encoding: string): string
}

interface ImportMeta {
  url: string
}
