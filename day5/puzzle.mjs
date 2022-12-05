import { fileURLToPath } from 'url'
import fs from 'fs'
import path, { dirname } from 'path'

import * as readline from 'node:readline/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

main()

async function main () {
  try {
    const readStream = fs.createReadStream(path.resolve(__dirname, 'input.txt'), { encoding: 'utf8' })
    const fileLinesStream = readline.createInterface({ input: readStream })

    
    let result1 = ''
    let result2 = ''
    let parseMoves = false

    const separatorRegex = new RegExp(/\d+/, 'g')

    const cratesLines = []
    const createMoves = []

    for await (const line of fileLinesStream) {
      if (!parseMoves && separatorRegex.test(line.replace(new RegExp(/\s/, 'g'), ''))) {
        parseMoves = true
        continue
      }

      if (!parseMoves) {
        const crateLine = parseCrateLine(line)
        cratesLines.push(crateLine)
      } else {
        if (line.length === 0) continue
        const crateMove = parseMove(line)
        createMoves.push(crateMove)
      }

    }

    // Part 1
    const rearrangedCrateStacks9000 = rearrangeCrateStacks9000(buildCrateStacks(cratesLines), Array.from(createMoves))
    console.table(rearrangedCrateStacks9000)

    result1 = rearrangedCrateStacks9000.reduce((result, stack) => {
      result.push(stack[stack.length - 1])
      return result
    }, []).join('')

    console.log(`Arrangement with CrateMover 9000: ${result1}`)

    // Part 2
    const rearrangedCrateStacks9001 = rearrangeCrateStacks9001(buildCrateStacks(cratesLines), Array.from(createMoves))
    console.table(rearrangedCrateStacks9001)
    
    result2 = rearrangedCrateStacks9001.reduce((result, stack) => {
      result.push(stack[stack.length - 1])
      return result
    }, []).join('')

    console.log(`Arrangement with CrateMover 9001: ${result2}`)
  } catch (err) {
    console.error(err)
  }
}

function buildCrateStacks(cratesLines = []) {
  const stacks = transpose(cratesLines)

  // clear placeholders
  const crateStacks = stacks.map(crateStack => crateStack.reverse().filter(crate => Boolean(crate)))

  return crateStacks
}

function rearrangeCrateStacks9000 (crateStacks = [], crateMoves = []) {
  const stacksSnapshot = Array.from(crateStacks)
  if (crateMoves.length === 0) {
    return stacksSnapshot
  }

  const [amount, origin, target] = crateMoves[0]

  for(let i = amount; i--; i > 0) {
    stacksSnapshot[target].push(stacksSnapshot[origin].pop())
  }


  crateMoves.shift()
  return rearrangeCrateStacks9000(stacksSnapshot, crateMoves)
}

function rearrangeCrateStacks9001 (crateStacks = [], crateMoves = []) {
  const stacksSnapshot = Array.from(crateStacks)
  if (crateMoves.length === 0) {
    return stacksSnapshot
  }

  const [amount, origin, target] = crateMoves[0]

  const stack = []
  for(let i = amount; i--; i > 0) {
    stack.push(stacksSnapshot[origin].pop())
  }

  stacksSnapshot[target].push(...stack.reverse())

  crateMoves.shift()
  return rearrangeCrateStacks9001(stacksSnapshot, crateMoves)
}

function parseCrateLine (line) {
  const crateLine = Array.from(line)
  const crates = []
  let index = 0
  const separatorStep = 1
  while (index < crateLine.length) {
    const crate = crateLine.slice(index, index + 3)
      .join('')
      .trim()
      .replace(new RegExp(/\[/), '')
      .replace(new RegExp(/\]/), '')

    crates.push(crate)
    index += separatorStep + 3
  }
  return crates
}

function parseMove (line) {
  const moveLineParts = line.split(' ')
  const [, amount, , origin, , target] = moveLineParts

  return [Number(amount), Number(origin) - 1, Number(target) - 1]
}

function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map(row => row[i]))
}
