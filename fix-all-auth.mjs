// fix-all-auth.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista completa de archivos a corregir
const filesToFix = [
  'src/app/api/admin/users/route.js',
  'src/app/api/admin/services/route.js',
  'src/app/api/admin/services/[id]/route.js',
  'src/app/api/admin/stats/route.js',
  'src/app/api/admin/quick-stats/route.js',
  'src/app/api/admin/recent-activity/route.js',
  'src/app/api/admin/blog/categories/route.js',
  'src/app/api/admin/blog/route.js',
  'src/app/api/admin/blog/[id]/route.js',
  'src/app/api/admin/categories/[id]/route.js',
  'src/app/api/admin/learning-paths/route.js',
  'src/app/api/admin/learning-paths/[id]/route.js',
  'src/app/api/admin/legal/route.js',
  'src/app/api/admin/legal/[id]/route.js',
  'src/app/api/admin/messages/route.js',
  'src/app/api/admin/messages/[id]/route.js',
  'src/app/api/admin/packages/route.js',
  'src/app/api/admin/pages/about/route.js',
  'src/app/api/admin/pages/homepage/route.js',
  'src/app/api/admin/portfolio/route.js',
  'src/app/api/admin/portfolio/settings/route.js',
  'src/app/api/admin/projects/route.js',
  'src/app/api/admin/addons/route.js',
  'src/app/api/courses/progress/route.js',
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  No existe: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Fix 1: Cambiar import de authOptions
  if (content.includes("from '@/lib/auth'")) {
    content = content.replace(
      /import\s+{\s*authOptions\s*}\s+from\s+'@\/lib\/auth'/g,
      "import { checkAuth } from '@/lib/checkAuth'"
    );
    modified = true;
  }

  // Fix 2: Cambiar getServerSession(authOptions) por checkAuth()
  if (content.includes('getServerSession(authOptions)')) {
    content = content.replace(
      /await\s+getServerSession\(authOptions\)/g,
      'await checkAuth()'
    );
    content = content.replace(
      /getServerSession\(authOptions\)/g,
      'checkAuth()'
    );
    modified = true;
  }

  // Fix 3: Si ya tiene getServerSession sin authOptions, dejarlo así
  // Esos archivos están correctos

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }

  console.log(`⏭️  Ya correcto: ${filePath}`);
  return false;
}

console.log('🔧 Fixing ALL auth imports...\n');

let fixedCount = 0;
filesToFix.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} of ${filesToFix.length} files`);
console.log('\n🚀 Now run: npm run build');