const fs = require('fs');
const path = require('path');

const baseDir = path.join('c:', 'Users', '2478144', 'OneDrive - Cognizant', 'Documents', 'DisasterFrontend_new', 'Angular', 'src', 'app', 'components');
const sidebarComponentPath = path.join(baseDir, 'shared', 'sidebar', 'sidebar.component');

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

    const importRegex = /import\s*\{\s*SidebarComponent\s*\}\s*from\s*['"][^'"]*sidebar\.component['"];?/;
    if (importRegex.test(content)) {
        const fileDir = path.dirname(file);
        let relPath = path.relative(fileDir, sidebarComponentPath).replace(/\\/g, '/');
        
        if (!relPath.startsWith('.')) {
            relPath = './' + relPath;
        }
        
        const newImport = `import { SidebarComponent } from '${relPath}';`;
        
        let newContent = content.replace(importRegex, newImport);
        if (newContent !== content) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log('Fixed ->', file, 'with', newImport);
        }
    }
});
