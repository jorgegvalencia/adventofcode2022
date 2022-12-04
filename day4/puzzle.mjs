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

    let result1 = 0
    let result2 = 0
    for await (const pairAssignments of fileLinesStream) {
      const [range1, range2] = pairAssignments.split(',')

      const [fullyOverlaps] = getRangesThatFullyOverlap(range1, range2)
      const [overlaps] = getRangesThatOverlap(range1, range2)
      if (fullyOverlaps) {
        result1++
      }
      if (overlaps || fullyOverlaps) {
        result2++
      }
    }
    // Part 1
    console.log(`The number of assignments pairs that have one range fully contained in the other is: ${result1}`)
    
    // Part 2
    console.log(`The number of assignments pairs that overlap is: ${result2}`)
    console.log(``)
  } catch (err) {
    console.error(err)
  }
}

function getRangesThatFullyOverlap (range1, range2) {
  const [interval1Start, invertal1End, interval1Length] = range(range1)
  const [interval2Start, invertal2End, interval2Length] = range(range2)

  const overlaps = interval1Length >= interval2Length
    ? [interval1Start <= interval2Start && invertal1End >= invertal2End, `${range1} <- ${range2}`]
    : [interval2Start <= interval1Start && invertal2End >= invertal1End, `${range1} -> ${range2}`]

  return overlaps
}

function getRangesThatOverlap (range1, range2) {
  const [interval1Start, invertal1End] = range(range1)
  const [interval2Start, invertal2End] = range(range2)

  if (isBetween(interval1Start, [interval2Start, invertal2End])) {
    return [true, `${range2} x ${range1}`]
  } else if (isBetween(invertal1End, [interval2Start, invertal2End])) {
    return [true, `${range1} x ${range2}`]
  } else if (isBetween(interval2Start, [interval1Start, invertal1End])) {
    return [true, `${range1} x ${range2}`]
  } else if (isBetween(invertal2End, [interval1Start, invertal1End])) {
    return [true, `${range2} x ${range1}`]
  }

  return [false, '']
}

function range (interval) {
  const [start, end] = interval.split('-')
  const length = Math.abs(eval(interval)) + 1
  return [Number(start), Number(end), length]
}

function isBetween (number, [rangeStart, rangeEnd]) {
  return rangeStart <= number && rangeEnd >= number
}