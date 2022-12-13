import { fileURLToPath } from 'url'
import fs from 'fs'
import path, { dirname } from 'path'

import * as readline from 'node:readline/promises'

import Graph from './Graph.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

main()

async function main () {
  try {
    const readStream = fs.createReadStream(path.resolve(__dirname, 'input.txt'), { encoding: 'utf8' })
    const fileLinesStream = readline.createInterface({ input: readStream })

    const grid = []
    const startingArea = []
    const endingArea = []
    let index = 0
    for await (const line of fileLinesStream) {
      const areas = [...line]
      grid.push(areas)

      if (!startingArea.length) {
        const startCoord = areas.findIndex(area => area === 'S')
        if (startCoord > -1) {
          startingArea[0] = startCoord
          startingArea[1] = index
        }
      }

      if (!endingArea.length) {
        const endCoord = areas.findIndex(area => area === 'E')
        if (endCoord > -1) {
          endingArea[0] = endCoord
          endingArea[1] = index
        }
      }

      index++
    }

    console.log('Starting area', startingArea)
    console.log('End area', endingArea)

    const graph = new Graph(true)
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        let areaValue = grid[y][x]
        const areaKey = pointToKey([x, y])

        if (areaValue === 'S') { areaValue = 'a' }
        else if (areaValue === 'E') { areaValue = 'z' }
  
        if (!graph.findNode(areaKey)) {
          graph.addNode(areaKey, areaValue)
        }

        const surroundingAreas = getSurroundingPositions([x, y]).map(p => {
          const adjacentArea = grid?.[p[1]]?.[p[0]]
          let area = adjacentArea
          if (adjacentArea === 'S') { area = 'a' }
          if (adjacentArea === 'E') { area = 'z' }
          return { point: p, area }
        }).filter(adj => {
          return !!adj.area
        })

        surroundingAreas.forEach(adjArea => {
          const { point: adjAreaPoint, area: adjAreaValue } = adjArea

          if (!graph.findNode(pointToKey(adjAreaPoint))) {
            graph.addNode(pointToKey(adjAreaPoint), adjAreaValue)
          }

          const hasEdge = graph.hasEdge(areaKey, pointToKey(adjAreaPoint))

          if (!hasEdge) {
            const heightDiff = adjAreaValue.codePointAt(0) - areaValue.codePointAt(0)
            if (heightDiff <= 1) {
              graph.addEdge(areaKey, pointToKey(adjAreaPoint), 1)
            }
          }
        })
      }
    }

    const result = shortestPathBfs(graph, pointToKey(startingArea), pointToKey(endingArea))
    console.log(result)
  } catch (err) {
    console.error(err)
  }
}

function getSurroundingPositions(pos) {
  return [
    [pos[0], pos[1] - 1], // Top
    [pos[0] + 1, pos[1]], // Right
    [pos[0], pos[1] + 1], // Bottom
    [pos[0] - 1, pos[1]] // Left
  ]
}

function pointToKey (point) {
  return `${point[0]}-${point[1]}`
}

const shortestPathBfs = (graph, startNode, stopNode) => {
  const previous = new Map()
  const visited = new Set()
  const queue = []
  queue.push({ node: startNode, dist: 0 })
  visited.add(startNode)

  while (queue.length > 0) {
    const { node, dist } = queue.shift()
    if (node === stopNode) {
      return { shortestDistance: dist, previous }
    }

    const adjacencyList = graph.adjacent(node)
    for (let neighbour of adjacencyList) {
      if (!visited.has(neighbour)) {
        previous.set(neighbour, node)
        queue.push({ node: neighbour, dist: dist + 1 })
        visited.add(neighbour)
      }
    }
  }
  return { shortestDistance: -1, previous }
}