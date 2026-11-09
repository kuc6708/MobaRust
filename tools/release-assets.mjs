import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const config = JSON.parse(readFileSync('apps/desktop/src-tauri/tauri.conf.json', 'utf8'));
if (process.argv[2] === 'check-version') {
  const tag = process.env.GITHUB_REF_NAME;
  const frontend = JSON.parse(readFileSync('apps/desktop/package.json', 'utf8'));
  const cargo = readFileSync('Cargo.toml', 'utf8').match(/\[workspace.package\]\s+version = "([^"]+)"/)[1];
  if (tag !== `v${config.version}` || frontend.version !== config.version || cargo !== config.version) {
    throw new Error('Tag, Tauri, Cargo, and frontend versions must match');
  }
} else if (process.argv[2] === 'collect') {
  const platform = process.argv[3];
  if (!['windows-x64', 'windows-arm64', 'linux-x64', 'linux-arm64', 'macos-arm64', 'macos-x64'].includes(platform)) throw new Error('Unknown platform');
  const helperDir = 'apps/desktop/src-tauri/helpers';
  const helperPath = join(helperDir, `mobarust-vnc-helper${platform.startsWith('windows') ? '.exe' : ''}`);
  let helperStat;
  try {
    helperStat = lstatSync(helperPath);
  } catch {
    throw new Error('Invalid helper staging');
  }
  if (!helperStat.isFile() || readdirSync(helperDir).some(name => name.includes('rdp'))) throw new Error('Invalid helper staging');
  const extensions = platform.startsWith('windows') ? ['.exe'] : platform.startsWith('linux') ? ['.deb', '.AppImage', '.rpm'] : ['.dmg'];
  const isInstaller = path => extensions.some(ext => path.endsWith(ext));
  function walk(dir) {
    const found = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      const stat = lstatSync(path);
      if (stat.isSymbolicLink()) {
        // Intermediate staging entries such as an AppImage `.AppDir/.DirIcon`
        // are not deliverables. A symlinked installer, however, could redirect
        // the collected bytes, so refuse it explicitly.
        if (isInstaller(path)) throw new Error(`Installer must be a regular file, not a symlink: ${path}`);
        continue;
      }
      if (stat.isDirectory()) found.push(...walk(path));
      else if (stat.isFile()) found.push(path);
      else throw new Error(`Unsupported bundle entry: ${path}`);
    }
    return found;
  }
  const files = walk(process.argv[4] ?? 'target/release/bundle').filter(isInstaller);
  if (extensions.some(ext => files.filter(path => path.endsWith(ext)).length !== 1)) {
    throw new Error(`Expected exactly one installer per format: ${extensions.join(', ')}`);
  }
  const stem = `${config.productName}_${config.version}`;
  const expectedNames = platform.startsWith('windows') ? [`${stem}_${platform.endsWith('arm64') ? 'arm64' : 'x64'}-setup.exe`]
    : platform.startsWith('linux') ? [`${stem}_${platform.endsWith('arm64') ? 'arm64' : 'amd64'}.deb`, `${stem}_${platform.endsWith('arm64') ? 'aarch64' : 'amd64'}.AppImage`, `${config.productName}-${config.version}-1.${platform.endsWith('arm64') ? 'aarch64' : 'x86_64'}.rpm`]
      : [`${stem}_${platform === 'macos-arm64' ? 'aarch64' : 'x64'}.dmg`];
  for (const path of files) {
    if (!expectedNames.includes(basename(path))) {
      throw new Error(`Installer name does not match ${platform} product, version or architecture: ${basename(path)}`);
    }
  }
  const out = process.argv[5] ?? 'target/release-assets';
  if (existsSync(out)) {
    const stale = readdirSync(out).find(name => name.startsWith('MobaRust-') && !name.startsWith(`MobaRust-${config.version}-`));
    if (stale) throw new Error(`Release output contains a different version: ${stale}`);
  }
  mkdirSync(out, { recursive: true });
  const checksums = files.map(path => {
    const name = `MobaRust-${config.version}-${platform}${extensions.find(ext => path.endsWith(ext))}`;
    copyFileSync(path, join(out, name));
    return `${createHash('sha256').update(readFileSync(path)).digest('hex')}  ${basename(name)}`;
  });
  writeFileSync(join(out, `SHA256SUMS-${platform}.txt`), `${checksums.join('\n')}\n`);
} else {
  throw new Error('Use check-version or collect <platform>');
}
