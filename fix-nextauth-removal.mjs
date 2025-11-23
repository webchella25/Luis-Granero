// fix-nextauth-removal.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix 1: Eliminar imports de next-auth/react
  if (content.includes("from 'next-auth/react'")) {
    content = content.replace(
      /import\s+{\s*[^}]+\s*}\s+from\s+'next-auth\/react';?\s*\n/g,
      ''
    );
    modified = true;
  }

  // Fix 2: Cambiar import de next-auth (API routes)
  if (content.includes("from 'next-auth'") && !content.includes('next-auth/react')) {
    content = content.replace(
      /import\s+{\s*getServerSession\s*}\s+from\s+'next-auth';?/g,
      "import { checkAuth } from '@/lib/checkAuth'"
    );
    modified = true;
  }

  // Fix 3: Cambiar getServerSession() por checkAuth()
  if (content.includes('getServerSession(')) {
    content = content.replace(
      /const\s+session\s*=\s*await\s+getServerSession\([^)]*\)/g,
      'const session = await checkAuth()'
    );
    modified = true;
  }

  // Fix 4: Comentar useSession SIN romper el código
  if (content.includes('useSession')) {
    content = content.replace(
      /const\s+{\s*data:\s*session[^}]*}\s*=\s*useSession\(\)/g,
      'const session = null; const status = "unauthenticated" // TODO: Auth manual'
    );
    modified = true;
  }

  // Fix 5: Comentar SessionProvider
  if (content.includes('SessionProvider')) {
    content = content.replace(
      /<SessionProvider>/g,
      '<>{/* SessionProvider */}'
    );
    content = content.replace(
      /<\/SessionProvider>/g,
      '{/* /SessionProvider */}</>'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

console.log('🔧 Fixing ALL next-auth imports...\n');

const dirs = [
  path.join(__dirname, 'src', 'app'),
  path.join(__dirname, 'src', 'components')
];

let allFiles = [];
dirs.forEach(dir => {
  allFiles = allFiles.concat(getAllFiles(dir));
});

let fixedCount = 0;
allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('next-auth')) {
    if (fixFile(file)) {
      const relativePath = path.relative(__dirname, file);
      console.log(`✅ Fixed: ${relativePath}`);
      fixedCount++;
    }
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('\n🚀 Now run: npm run build');