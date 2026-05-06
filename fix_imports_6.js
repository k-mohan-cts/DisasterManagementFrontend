const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/2478144/OneDrive - Cognizant/Documents/DisasterFrontend_new/Angular/src/app/components';
const sidebarPathExt = 'c:/Users/2478144/OneDrive - Cognizant/Documents/DisasterFrontend_new/Angular/src/app/components/shared/sidebar/sidebar.component.ts';

function findFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findFiles(fullPath));
        } else if (file.endsWith('.ts')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = findFiles(baseDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let updated = false;

    // Fix imports
    const importRegex = /import\s*\{\s*SidebarComponent\s*\}\s*from\s*['"][^'"]*sidebar\.component['"];?/;
    if (importRegex.test(content)) {
        const fileDir = path.dirname(file);
        let relPath = path.relative(fileDir, path.dirname(sidebarPathExt)).replace(/\\/g, '/');
        if (!relPath.startsWith('.')) relPath = './' + relPath;
        const newImport = `import { SidebarComponent } from '${relPath}/sidebar.component';`;
        content = content.replace(importRegex, newImport);
        updated = true;
    }

    if (updated) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed imports in', path.relative(baseDir, file));
    }
});
