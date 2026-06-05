const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'img', 'weapons');
const fileUrl = 'https://raw.githubusercontent.com/OthelloRhin/MHW_Icons_SVG/master/SVG/Weapons/Charge_Blade/Charge_Blade_rank_01.svg';

async function run() {
    console.log(`Downloading charge_blade from: ${fileUrl}`);
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        const text = await response.text();
        
        const destPath = path.join(targetDir, 'charge_blade.svg');
        fs.writeFileSync(destPath, text, 'utf8');
        console.log(`✅ Saved charge_blade.svg successfully.`);
    } catch (e) {
        console.log(`❌ Failed to download charge_blade: ${e.message}`);
    }
}

run();
