import { fileURLToPath } from 'url'
import fs from 'fs'
import path, { dirname } from 'path'

import * as readline from 'node:readline/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

const X_AXIS = 0
const Y_AXIS = 1

const PART1_KNOTS = 2
const PART2_KNOTS = 10

class Rope {
  constructor (knots) {
    this.knots = Array.from({ length: knots }, () => [0, 0])
    this.headPosition = this.knots[0]
    this.tailPosition = this.knots[this.knots.length - 1]

    this.tailVisitedPositions = new Set()
    this.tailVisitedPositions.add(this.headPosition.join(','))
  }

  static ADJACENT_MAX_DISTANCE = getDistance([0, 0], [1, 1])

  get head () {
    return this.headPosition
  }

  get tail () {
    return this.tailPosition
  }

  get visitedByTail () {
    return this.tailVisitedPositions.size
  }
  
  makeMotion (direction, movements) {
    const axis = direction === 'L' || direction === 'R' ? X_AXIS : Y_AXIS
    const sign = direction === 'L' || direction === 'D' ? -1 : 1

    for (let i = movements; i > 0; i--) {
      this.head[axis] = this.head[axis] + (1 * sign)
      const [, ...adjacents] = this.knots
      this._moveAdjacents(adjacents, this.head)
    }
  }

  _moveAdjacents([knot, ...adjacents] = [], refKnot) {
    if (!knot) return
    
    const newKnotPosition = this._getKnotNewPosition(knot, refKnot)
    if (!equalPosition(newKnotPosition, knot)) {
      knot[0] = newKnotPosition[0]
      knot[1] = newKnotPosition[1]
      
      if (knot === this.tail) {
        this.tailVisitedPositions.add(newKnotPosition.join(','))
      }

      return this._moveAdjacents(adjacents, knot)
    }
  }

  _getKnotNewPosition (knotPosition, referenceKnotPosition) {
    const hasToMoveTailPosition = getDistance(referenceKnotPosition, knotPosition) > Rope.ADJACENT_MAX_DISTANCE
    if (!hasToMoveTailPosition) {
      return knotPosition
    }
    
    const prospectPositions = getIntersectingPositions(
      getSurroundingPositions(referenceKnotPosition),
      getSurroundingPositions(knotPosition)
    )
    
    // the distance between the current head position and the new tail position has to be the minimum
    const [newKnotPosition] = prospectPositions
      .map(p => [p, getDistance(referenceKnotPosition, p)])
      .sort((t1, t2) => t1[1] - t2[1])
      .map(t => t[0])
  
    return newKnotPosition
  }
}

main()

async function main () {
  try {
    const readStream = fs.createReadStream(path.resolve(__dirname, 'input.txt'), { encoding: 'utf8' })
    const fileLinesStream = readline.createInterface({ input: readStream })

    const rope1 = new Rope(PART1_KNOTS)
    const rope2 = new Rope(PART2_KNOTS)

    for await (const motion of fileLinesStream) {
      let [direction, movements] = motion.split(' ')

      rope1.makeMotion(direction, Number(movements))
      rope2.makeMotion(direction, Number(movements))
    }

    // Part 1
    console.log(`The number of visited positions with ${PART1_KNOTS} knots is ${rope1.visitedByTail}`)

    // Part 2
    console.log(`The number of visited positions with ${PART2_KNOTS} knots is ${rope2.visitedByTail}`)
  } catch (err) {
    console.error(err)
  }
}

function getSurroundingPositions(pos) {
  return [
    [pos[0] - 1, pos[1] + 1], // Top left
    [pos[0], pos[1] + 1], // Top
    [pos[0] + 1, pos[1] + 1], // Top right
    [pos[0] + 1, pos[1]], // Right
    [pos[0] + 1, pos[1] - 1], // Bottom right
    [pos[0], pos[1] - 1], // Bottom
    [pos[0] - 1, pos[1] - 1], // Bottom left
    [pos[0] - 1, pos[1]] // Left
  ]
}

function getIntersectingPositions (posArr1, posArr2) {
  const m = {}
  posArr1.concat(posArr2).forEach(pos => {
    const posString = pos.toString()
    if (m[posString]) {
      m[posString] = m[posString] + 1
    } else {
      m[posString] = 1
    }
  })

  const intersection = []
  for (let posString in m) {
    if (m[posString] > 1) {
      const [x, y] = posString.split(',')
      intersection.push([Number(x), Number(y)])
    }
  }

  return intersection
}

function getDistance (pos1, pos2) {
  return Math.sqrt(Math.pow(pos1[0] - pos2[0], 2) + Math.pow(pos1[1] - pos2[1], 2))
}

function equalPosition (posA, posB) {
  return posA[0] === posB[0] && posA[1] === posB[1]
}