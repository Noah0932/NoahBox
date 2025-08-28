#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('===== 下载站一键部署脚本 =====');
console.log('此脚本将帮助您部署下载站到Cloudflare Workers');

// 检查是否已安装wrangler
try {
  execSync('wrangler --version', { stdio: 'ignore' });
} catch (error) {
  console.error('错误: 未检测到wrangler。请先运行 npm install -g wrangler 安装它。');
  process.exit(1);
}

// 检查是否已登录Cloudflare
try {
  execSync('wrangler whoami', { stdio: 'ignore' });
} catch (error) {
  console.error('错误: 您尚未登录Cloudflare。请先运行 wrangler login 登录。');
  process.exit(1);
}

// 创建D1数据库
async function createDatabase() {
  console.log('\n步骤1: 创建D1数据库');
  
  try {
    const output = execSync('wrangler d1 create download_station_db').toString();
    console.log(output);
    
    // 提取database_id
    const match = output.match(/database_id\s*=\s*"([^"]+)"/);
    if (match && match[1]) {
      const databaseId = match[1];
      console.log(`数据库ID: ${databaseId}`);
      
      // 更新wrangler.toml
      let wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
      wranglerConfig = wranglerConfig.replace(/database_id\s*=\s*"[^"]*"/, `database_id = "${databaseId}"`);
      fs.writeFileSync('wrangler.toml', wranglerConfig);
      
      console.log('已自动更新wrangler.toml中的database_id');
      return true;
    } else {
      console.error('无法从输出中提取database_id');
      return false;
    }
  } catch (error) {
    console.error('创建数据库失败:', error.message);
    return false;
  }
}

// 安装依赖
function installDependencies() {
  console.log('\n步骤2: 安装依赖');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('安装依赖失败:', error.message);
    return false;
  }
}

// 构建前端
function buildFrontend() {
  console.log('\n步骤3: 构建前端');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('构建前端失败:', error.message);
    return false;
  }
}

// 部署到Cloudflare Workers
function deploy() {
  console.log('\n步骤4: 部署到Cloudflare Workers');
  
  try {
    const output = execSync('npm run deploy').toString();
    console.log(output);
    
    // 提取部署URL
    const match = output.match(/https:\/\/[^.]+\.workers\.dev/);
    if (match) {
      const deployUrl = match[0];
      console.log(`\n部署成功! 您的下载站已部署到: ${deployUrl}`);
      return deployUrl;
    } else {
      console.log('\n部署成功，但无法提取部署URL。请查看上方输出获取您的网站URL。');
      return null;
    }
  } catch (error) {
    console.error('部署失败:', error.message);
    return null;
  }
}

// 初始化数据库
function initDatabase(deployUrl) {
  if (!deployUrl) return false;
  
  console.log('\n步骤5: 初始化数据库');
  
  try {
    const response = execSync(`curl -s ${deployUrl}/api/init`).toString();
    console.log('数据库初始化响应:', response);
    
    try {
      const json = JSON.parse(response);
      if (json.success) {
        console.log('数据库初始化成功!');
        return true;
      } else {
        console.error('数据库初始化失败:', json.error || '未知错误');
        return false;
      }
    } catch (e) {
      console.error('解析响应失败:', e.message);
      return false;
    }
  } catch (error) {
    console.error('初始化数据库失败:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  console.log('\n开始部署流程...');
  
  const dbCreated = await createDatabase();
  if (!dbCreated) {
    console.error('创建数据库失败，部署终止。');
    process.exit(1);
  }
  
  const depsInstalled = installDependencies();
  if (!depsInstalled) {
    console.error('安装依赖失败，部署终止。');
    process.exit(1);
  }
  
  const buildSuccess = buildFrontend();
  if (!buildSuccess) {
    console.error('构建前端失败，部署终止。');
    process.exit(1);
  }
  
  const deployUrl = deploy();
  if (!deployUrl) {
    console.error('部署失败，部署终止。');
    process.exit(1);
  }
  
  const dbInitialized = initDatabase(deployUrl);
  if (!dbInitialized) {
    console.warn('数据库初始化失败，您可能需要手动访问 ' + deployUrl + '/api/init 来初始化数据库。');
  }
  
  console.log('\n===== 部署完成 =====');
  console.log(`
下载站前台: ${deployUrl}
管理员后台: ${deployUrl}/admin.html

感谢使用下载站一键部署脚本!
  `);
  
  rl.close();
}

main().catch(error => {
  console.error('部署过程中发生错误:', error);
  process.exit(1);
});