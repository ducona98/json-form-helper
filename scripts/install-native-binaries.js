#!/usr/bin/env node

/**
 * Script to install native binaries for Windows if npm fails to install optional dependencies
 * This fixes the known npm bug: https://github.com/npm/cli/issues/4828
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const nativePackages = [
  {
    name: 'lightningcss-win32-x64-msvc',
    version: '1.30.2',
    checkPath: 'node_modules/lightningcss-win32-x64-msvc'
  },
  {
    name: '@tailwindcss/oxide-win32-x64-msvc',
    version: '4.1.18',
    checkPath: 'node_modules/@tailwindcss/oxide-win32-x64-msvc'
  }
];

function installPackage(pkg) {
  const fullPath = path.join(process.cwd(), pkg.checkPath);
  
  if (fs.existsSync(fullPath)) {
    console.log(`✓ ${pkg.name} already installed`);
    return;
  }

  console.log(`Installing ${pkg.name}@${pkg.version}...`);
  
  try {
    // Download and extract package
    execSync(`npm pack ${pkg.name}@${pkg.version}`, { stdio: 'inherit' });
    
    const tarball = `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`;
    const tarballPath = path.join(process.cwd(), tarball);
    
    if (!fs.existsSync(tarballPath)) {
      throw new Error(`Failed to download ${pkg.name}`);
    }
    
    // Extract to node_modules
    const targetDir = path.dirname(fullPath);
    fs.mkdirSync(targetDir, { recursive: true });
    
    execSync(`tar -xzf "${tarballPath}" -C "${targetDir}" --strip-components=1`, { stdio: 'inherit' });
    
    // Clean up tarball
    fs.unlinkSync(tarballPath);
    
    console.log(`✓ ${pkg.name} installed successfully`);
  } catch (error) {
    console.error(`✗ Failed to install ${pkg.name}:`, error.message);
    process.exit(1);
  }
}

// Only run on Windows
if (process.platform === 'win32') {
  console.log('Checking native binaries for Windows...\n');
  nativePackages.forEach(installPackage);
  console.log('\nNative binaries installation complete!');
} else {
  console.log('Skipping native binary installation (not Windows)');
}
