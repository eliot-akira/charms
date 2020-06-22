const path = require('path')
const globby = require('globby')
const fs = require('fs-extra')

;(async () => {

  const cwd = process.cwd()
  const src = path.join(cwd, 'src')
  const dest = path.join(cwd, 'build')

  const files = await globby(path.join(src, '**/*.*scss'))

  for (const srcFile of files) {

    const relativeFile = path.relative(src, srcFile)
    const destFile = path.join(dest, relativeFile)
    const destDir = path.dirname(destFile)

    await fs.ensureDir(destDir)
    await fs.copy(srcFile, destFile)

    console.log(relativeFile)
  }
})()
