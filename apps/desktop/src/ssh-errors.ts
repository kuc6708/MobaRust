/** True for authentication failures that are actionable in the session editor. */
export function isAuthenticationError(message: string): boolean {
  return /SSH authentication was rejected|No SSH agent is available|SSH agent is running but has no identities|SSH agent authentication failed|SSH private key file was not found|SSH private key file could not be read|SSH private key could not be loaded|PuTTY \.ppk private keys are not supported|Saved .* credential is unavailable/i.test(message);
}

/** Human-readable label for the auth method used by the failed attempt. */
export function authMethodLabel(method: string): string {
  switch (method) {
    case "agent":
      return "the SSH agent";
    case "privateKey":
      return "the private key";
    case "password":
      return "the saved password";
    case "keyboardInteractive":
      return "keyboard-interactive";
    case "keyboardInteractivePrompt":
      return "interactive password/OTP prompts";
    default:
      return "authentication";
  }
}
