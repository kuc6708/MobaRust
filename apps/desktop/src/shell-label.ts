export type LocalShellName = "default" | "powershell" | "cmd" | "bash" | "zsh" | "fish";

export type LocalTargetLabelInput =
  | { type: "default"; shell?: LocalShellName }
  | { type: "wsl"; distribution: string };

/**
 * Human-readable surface for a local terminal. The Windows default target is
 * cmd.exe; Unix defaults are reported generically because the backend chooses
 * the user's login shell.
 */
export function localShellDisplayName(target: LocalTargetLabelInput, platform: string): string {
  if (target.type === "wsl") return `WSL · ${target.distribution}`;
  const windows = /win/i.test(platform);
  switch (target.shell ?? "default") {
    case "cmd":
      return windows ? "cmd.exe" : "cmd";
    case "powershell":
      return "PowerShell";
    case "bash":
      return "bash";
    case "zsh":
      return "zsh";
    case "fish":
      return "fish";
    default:
      return windows ? "cmd.exe" : "local shell";
  }
}
