const { execSync } = require('child_process');
const path = require('path');

const assets = [
  'public/assets/environment/AncientTree.glb',
  'public/assets/environment/AncientTree2.glb',
  'public/assets/environment/Mountains.glb',
  'public/assets/upgrades/LargeObelisk.glb',
  'public/assets/Path.glb'
];

for (const asset of assets) {
  const output = asset.replace(/\.glb$/, '.compressed.glb');
  console.log(`Compressing ${asset} -> ${output}`);
  execSync(`gltfpack -i ${asset} -o ${output} -cc -i -tc`, { stdio: 'inherit' });
}
