import { Version, ComponentNode } from "./types";

// In-memory version history (server-side, resets on restart)
let versions: Version[] = [];

export function addVersion(
  componentTree: ComponentNode,
  code: string,
  explanation: string
): Version {
  const version: Version = {
    version: versions.length + 1,
    componentTree,
    code,
    explanation,
    timestamp: Date.now(),
  };
  versions.push(version);
  return version;
}

export function getVersion(versionNumber: number): Version | undefined {
  return versions.find((v) => v.version === versionNumber);
}

export function getLatestVersion(): Version | undefined {
  return versions.length > 0 ? versions[versions.length - 1] : undefined;
}

export function getAllVersions(): Version[] {
  return [...versions];
}

export function getVersionCount(): number {
  return versions.length;
}

export function clearVersions(): void {
  versions = [];
}
