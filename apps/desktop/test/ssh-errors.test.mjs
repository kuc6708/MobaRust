import assert from "node:assert/strict";
import { authMethodLabel, isAuthenticationError } from "../src/ssh-errors.ts";

for (const message of [
  "SSH authentication was rejected; verify the username, key/agent, or password",
  "No SSH agent is available: Pageant is unavailable",
  "SSH agent is running but has no identities; add a key with ssh-add",
  "SSH agent authentication failed",
  "SSH private key file was not found: C:\\Users\\shood\\.ssh\\id_ed25519",
  "SSH private key file could not be read: /home/shood/.ssh/id_ed25519",
  "SSH private key could not be loaded",
  "PuTTY .ppk private keys are not supported; convert the key to OpenSSH format",
  "Saved password credential is unavailable; store it in the vault",
]) {
  assert.equal(isAuthenticationError(message), true, message);
}

for (const message of [
  "Unknown SSH host key for example.com:22",
  "SSH host key CHANGED for example.com:22",
  "SSH connection timed out",
  "SSH network connection failed",
  "SSH authentication was cancelled",
]) {
  assert.equal(isAuthenticationError(message), false, message);
}

assert.equal(authMethodLabel("agent"), "the SSH agent");
assert.equal(authMethodLabel("privateKey"), "the private key");
assert.equal(authMethodLabel("password"), "the saved password");
assert.equal(authMethodLabel("keyboardInteractivePrompt"), "interactive password/OTP prompts");
assert.equal(authMethodLabel("other"), "authentication");
