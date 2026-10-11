import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { parse, compileScript } from '@vue/compiler-sfc'

const hash = value => createHash('sha256').update(value).digest('hex')
const fingerprints = JSON.parse(readFileSync(new URL('./preserved-content.json', import.meta.url)))

// Baseline: repository 07642f1. Treat content changes as a deliberate decision.
for (const [path, expected] of Object.entries(fingerprints)) {
  test(`preserves original content: ${path}`, () => {
    const file = readFileSync(new URL(`../${path}`, import.meta.url))
    if (expected.file) return assert.equal(hash(file), expected.file)
    const { descriptor } = parse(file.toString('utf8'))
    if (expected.template) assert.equal(hash(descriptor.template.content), expected.template)
    const ast = compileScript(descriptor, { id: path }).scriptSetupAst
    const actual = {}
    for (const node of ast) {
      if (node.type !== 'VariableDeclaration') continue
      for (const declaration of node.declarations) {
        if (declaration.init) {
          actual[declaration.id.name] = hash(descriptor.scriptSetup.content.slice(declaration.init.start, declaration.init.end))
        }
      }
    }
    for (const [name, fingerprint] of Object.entries(expected.declarations)) {
      const actualHash = name === 'SYSTEM_PROMPT'
        ? hash(readFileSync(new URL('../server/system-prompt.txt', import.meta.url)))
        : actual[name]
      assert.equal(actualHash, fingerprint, `${path}: ${name} changed`)
    }
  })
}
