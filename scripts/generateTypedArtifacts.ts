import { join } from 'node:path'
import { globby } from 'globby'

const generatedPath = join(import.meta.dir, '../test/contracts/generated.ts')
Bun.write(generatedPath, '')

const generated = Bun.file(generatedPath)
const writer = generated.writer()

const paths = await globby([
  join(import.meta.dir, '../test/contracts/out/**/*.json'),
])

await Promise.all(
  paths.map(async (path) => {
    const fileName = path.split('/').pop()?.replace('.json', '')
    const json = await Bun.file(path, { type: 'application/json' }).json()
    // If the filename starts with a number, prefix it with an underscore; makes compiler happy
    const maybePrefix = /^[0-9]$/.test(fileName.charAt(0)) ? '_' : ''
    writer.write(
      `export const ${maybePrefix}${fileName} = ${JSON.stringify(
        json,
        null,
        2,
      )} as const;\n\n`,
    )
  }),
)

writer.end()
