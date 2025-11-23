// fix-auth-imports.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminApiDir = path.join(__dirname, 'src', 'app', 'api', 'admin');
const coursesApiDir = path.join(__dirname, 'src', 'app', 'api', 'courses');
const studentApiDir = path.join(__dirname, 'src', 'app', 'api', 'student');

function getAllJsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsFiles(filePath));
    } else if (file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  
  return results;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let changes = [];
  
  // Fix 1: Cambiar import estático de authOptions
  if (content.includes("from '@/lib/auth'")) {
    content = content.replace(/import\s+{\s*authOptions\s*}\s+from\s+'@\/lib\/auth'/g, 
                              "import { checkAuth } from '@/lib/checkAuth'");
    modified = true;
    changes.push('import estático');
  }
  
  // Fix 2: Cambiar dynamic import de authOptions
  if (content.includes("await import('@/lib/auth')")) {
    content = content.replace(/const\s+{\s*authOptions\s*}\s*=\s*await\s+import\('@\/lib\/auth'\)/g,
                              "// REMOVED: const { authOptions } = await import('@/lib/auth')");
    modified = true;
    changes.push('dynamic import');
  }
  
  // Fix 3: Cambiar getServerSession(authOptions) por checkAuth()
  if (content.includes('getServerSession(authOptions)')) {
    content = content.replace(/await\s+getServerSession\(authOptions\)/g, 
                              'await checkAuth()');
    content = content.replace(/getServerSession\(authOptions\)/g, 
                              'checkAuth()');
    modified = true;
    changes.push('getServerSession calls');
  }
  
  // Fix 4: Asegurar que checkAuth está importado
  if (modified && !content.includes("from '@/lib/checkAuth'")) {
    // Buscar el último import y agregar checkAuth después
    const lastImportMatch = content.match(/import[^;]+;/g);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      content = content.replace(lastImport, lastImport + "\nimport { checkAuth } from '@/lib/checkAuth';");
      changes.push('added checkAuth import');
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.relative(__dirname, filePath)}`);
    console.log(`   Changes: ${changes.join(', ')}\n`);
    return true;
  }
  
  return false;
}

console.log('🔧 Fixing auth imports in all API routes...\n');

const dirs = [adminApiDir, coursesApiDir, studentApiDir];
let allFiles = [];

dirs.forEach(dir => {
  allFiles = allFiles.concat(getAllJsFiles(dir));
});

let fixedCount = 0;

allFiles.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} of ${allFiles.length} files`);
console.log('\n🚀 Now run: npm run build');