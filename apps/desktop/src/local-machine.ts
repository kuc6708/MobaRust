export type LocalMachineLabel = {
  name: string;
  detail: string;
};

/**
 * Describe the local machine for the session brief. The platform and
 * architecture come from the native `app_snapshot` command, so a Linux or
 * Windows host is never mislabeled as macOS hardware.
 */
export function describeLocalMachine(platform: string, architecture: string): LocalMachineLabel {
  const os = platform === "macos" || platform === "windows" ? platform : "linux";
  const name = os === "macos" ? "This Mac" : os === "windows" ? "This PC" : "This Linux host";
  const arch = architecture === "aarch64"
    ? (os === "macos" ? "Apple Silicon" : "ARM64")
    : architecture === "x86_64"
      ? (os === "macos" ? "Intel" : "x64")
      : architecture === "arm"
        ? "ARM"
        : "Local";
  return { name, detail: `${arch} · local` };
}
