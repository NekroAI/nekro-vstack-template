#!/usr/bin/env node
/**
 * 监听 openapi.json 文件变化，自动生成 TypeScript 类型
 *
 * 当后端 reload 时会重新生成 openapi.json，此脚本会检测到变化并自动生成类型文件
 */

import { watch } from 'fs'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = resolve(__dirname, '..')
const openapiFile = resolve(projectRoot, 'openapi.json')

console.log('👀 监听 OpenAPI 规范变化...')
console.log(`📄 文件: ${openapiFile}`)
console.log('💡 提示: 修改后端代码后，类型文件会自动更新\n')

let isGenerating = false
let lastGenerateTime = 0

function generateTypes() {
  const now = Date.now()

  // 防抖：2秒内只生成一次，避免重复触发
  if (isGenerating || now - lastGenerateTime < 2000) {
    return
  }

  isGenerating = true
  lastGenerateTime = now

  try {
    console.log('🔄 检测到 OpenAPI 规范变化，重新生成类型...')
    // 直接调用 openapi-typescript，不再重新生成 openapi.json
    execSync('openapi-typescript openapi.json -o src/frontend/core/types/generated.ts', {
      cwd: projectRoot,
      stdio: 'inherit',
    })
    console.log('✅ 类型文件已更新')
  } catch (error) {
    console.error('❌ 类型生成失败:', error.message)
  } finally {
    isGenerating = false
  }
}

// 监听文件变化
watch(openapiFile, eventType => {
  if (eventType === 'change') {
    generateTypes()
  }
})

// 保持进程运行
process.on('SIGINT', () => {
  console.log('\n👋 停止监听')
  process.exit(0)
})

console.log('✅ 监听已启动，等待 OpenAPI 规范变化...\n')
