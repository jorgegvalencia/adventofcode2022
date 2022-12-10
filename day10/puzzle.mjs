import { fileURLToPath } from 'url'
import fs from 'fs'
import path, { dirname } from 'path'

import * as readline from 'node:readline/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

const STAGE_SIZE = 40
const STAGE_NUMBER = 6

const NOOP_CYCLES = 1
const ADDV_CYCLES = 2

const STAGES = new Map(Array.from({ length: STAGE_NUMBER }, (val, index) => [20 + (index * STAGE_SIZE), 0]))

const CRT = Array.from({ length: STAGE_SIZE * STAGE_NUMBER }, () => '.')

main()

async function main () {
  try {
    const readStream = fs.createReadStream(path.resolve(__dirname, 'input.txt'), { encoding: 'utf8' })
    const fileLinesStream = readline.createInterface({ input: readStream })

    let cycles = 0
    let registry = 1

    let currentTask

    for await (const instruction of fileLinesStream) {
      const [op, value] = instruction.split(' ')

      if (op === 'noop') {
        currentTask = scheduleTask(0, NOOP_CYCLES)
      } else if (op === 'addx') {
        currentTask = scheduleTask(Number(value), ADDV_CYCLES)
      }
  
      let taskSchedule
      do {
        if (
          (cycles % STAGE_SIZE) === registry ||
          (cycles % STAGE_SIZE) === registry - 1 ||
          (cycles % STAGE_SIZE) === registry + 1
        ) {
            CRT[cycles] = '#'
        }

        taskSchedule = currentTask.next()
        if (STAGES.has(cycles)) {
          STAGES.set(cycles, cycles * registry)
        }

        cycles++
      } while(!taskSchedule.done)
      registry += taskSchedule.value
    }

    // Part 1
    const result1 = [...STAGES.values()].reduce((r, v) => r += v)
    console.table(STAGES)
    console.log(`The sum of the signal strenghts is ${result1}`)

    // Part 2
    console.log('The CRT output is:')
    printCRT(CRT)
    /*
    ####..##..###...##....##.####...##.####.
    ...#.#..#.#..#.#..#....#.#.......#....#.
    ..#..#....###..#..#....#.###.....#...#..
    .#...#....#..#.####....#.#.......#..#...
    #....#..#.#..#.#..#.#..#.#....#..#.#....
    ####..##..###..#..#..##..#.....##..####.
    */
  } catch (err) {
    console.error(err)
  }
}

function printCRT (crt) {
  const display = []
  for (let i = 0; i < STAGE_NUMBER; i++) {
    display.push(crt.slice(i * STAGE_SIZE, (i + 1) * STAGE_SIZE))
  }

  display.forEach((r, i) => console.log(r.join('').toString()))
}

function *scheduleTask (value, cycles) {
  for (let cycle = cycles; cycle > 1; cycle--) {
    yield cycle
  }
  return value
}