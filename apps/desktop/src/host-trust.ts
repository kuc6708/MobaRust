export type HostKeyObservation = {
  host: string;
  port: number;
  fingerprint: string;
  algorithm: string;
  publicKey: string;
};

export async function reviewUnknownHostTrust(
  observation: HostKeyObservation,
  actions: {
    choosePath: () => Promise<string | null>;
    confirm: (message: string) => Promise<boolean>;
    persist: (request: { host: string; port: number; publicKey: string; confirmedFingerprint: string; knownHostsPath: string }) => Promise<void>;
  },
): Promise<string | null> {
  // Snapshot before either asynchronous dialog: editing the diagnostic target
  // while reviewing must not redirect the trust decision to a different host.
  const observed = { ...observation };
  const path = (await actions.choosePath())?.trim();
  if (!path) return null;
  if (!await actions.confirm(`Trust this previously unknown SSH key?\n\nHost: ${observed.host}:${observed.port}\nAlgorithm: ${observed.algorithm}\nFingerprint: ${observed.fingerprint}\nTrust file: ${path}\n\nConfirm only after comparing with your administrator through an independent channel. Conflicting keys will never be replaced.`)) return null;
  await actions.persist({ host: observed.host, port: observed.port, publicKey: observed.publicKey, confirmedFingerprint: observed.fingerprint, knownHostsPath: path });
  return path;
}
