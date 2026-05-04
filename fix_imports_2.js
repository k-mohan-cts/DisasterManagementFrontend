const fs = require('fs');
const path = require('path');

const baseDir = path.join('c:', 'Users', '2478144', 'OneDrive - Cognizant', 'Documents', 'DisasterFrontend_new', 'Angular', 'src', 'app', 'components');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (file.endsWith('.ts')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk(baseDir);
const sidebarPath = path.join(baseDir, 'shared', 'sidebar', 'sidebar.component.ts'); // Note the .ts at the end so it knows it is a file

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const regex = /import\s*\{\s*SidebarComponent\s*\}\s*from\s*['"][^'"]*sidebar\.component['"];?/;
    
    if (regex.test(content)) {
        const fileDir = path.dirname(file);
        
        let relativePath = path.relative(fileDir, path.dirname(sidebarPath)).replace(/\\/g, '/');
        
        if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
        }
        
        const newImport = import { SidebarComponent } from '/sidebar.component';;
        const newContent = content.replace(regex, newImport);
        
        if (newContent !== content) {
            fs.writeFileSync(file, newContent, 'utf8');
            console.log('Fixed', file, '->', relativePath + '/sidebar.component');
        }
    }
});
