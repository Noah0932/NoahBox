const fs = require('fs');
const path = require('path');

// 创建目录函数（支持递归创建）
function mkdirRecursive(dirPath) {
  const dirs = dirPath.split(path.sep);
  let currentDir = '';
  
  dirs.forEach(dir => {
    currentDir = currentDir ? path.join(currentDir, dir) : dir;
    
    if (!fs.existsSync(currentDir)) {
      fs.mkdirSync(currentDir);
      console.log(`创建目录: ${currentDir}`);
    }
  });
}

// 创建项目所需目录
console.log('创建项目目录结构...');
mkdirRecursive('src/frontend');
mkdirRecursive('src/backend');
mkdirRecursive('public');

console.log('目录结构创建完成！');