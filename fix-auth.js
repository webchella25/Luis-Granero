// fix-auth.js - Versión ES modules
import fs from 'fs';

const files = [
  'src/app/api/admin/blog/categories/route.js',
  'src/app/api/admin/homepage/route.js',
  'src/app/api/admin/legal/templates/[type]/route.js',
  'src/app/api/admin/projects/route.js',
  'src/app/api/admin/projects/[slug]/route.js',
  'src/app/api/admin/quick-stats/route.js',
  'src/app/api/admin/recent-activity/route.js',
  'src/app/api/admin/services/route.js',
  'src/app/api/admin/services/[id]/route.js',
  'src/app/api/admin/settings/route.js',
  'src/app/api/admin/users/route.js'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Eliminar import de authOptions y getServerSession
    content = content.replace(/import\s+{\s*authOptions\s*}\s+from\s+['"]@\/lib\/auth['"]\s*;?\s*/g, '');
    content = content.replace(/import\s+{\s*getServerSession\s*}\s+from\s+['"]next-auth['"]\s*;?\s*/g, '');
    content = content.replace(/import\s+{\s*getServerSession\s*}\s+from\s+['"]next-auth\/next['"]\s*;?\s*/g, '');
    
    // Añadir import de checkAuth
    if (!content.includes('checkAuth')) {
      const lastImportIndex = content.lastIndexOf('import');
      if (lastImportIndex !== -1) {
        const endOfLine = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLine + 1) + 
                  "import { checkAuth } from '@/lib/checkAuth'\n" +
                  content.slice(endOfLine + 1);
      }
    }
    
    // Reemplazar getServerSession por checkAuth
    content = content.replace(
      /const\s+session\s+=\s+await\s+getServerSession\s*\(\s*authOptions\s*\)/g,
      'const session = await checkAuth()'
    );
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('\n🎉 Done! All files fixed.');