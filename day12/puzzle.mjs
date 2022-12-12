import { fileURLToPath } from 'url'
import fs from 'fs'
import path, { dirname } from 'path'

import * as readline from 'node:readline/promises'

import Graph from './Graph.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

main()

async function main () {
  try {
    const readStream = fs.createReadStream(path.resolve(__dirname, 'example.txt'), { encoding: 'utf8' })
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

    // find the starting point
    console.log('Starting area', startingArea)

    // while
    const graph = new Graph(false)
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        const areaValue = grid[x][y]
        const areaKey = x + ',' + y
  
        if (!graph.findNode(areaKey)) {
          graph.addNode(areaKey, areaValue)
        }

        const surroundingAreas = getSurroundingPositions([x, y]).map(p => {
          const adjacentArea = grid?.[p[0]]?.[p[1]]
          return [p, adjacentArea]
        }).filter(area => {
          return !!area[1]
        })

        surroundingAreas.forEach(adjArea => {
          const [adjAreaPoint, adjAreaValue] = adjArea

          if (!graph.findNode(adjAreaPoint)) {
            graph.addNode(adjAreaPoint.toString(), adjAreaValue)
          }

          if (!graph.hasEdge(areaKey, adjAreaPoint)) {
            if (areaValue === 'S') {
              graph.addEdge(areaKey, adjArea, 1)
            } else if (adjAreaPoint === 'E' && areaValue.codePointAt(0) === 122) {
              graph.addEdge(areaKey, adjArea, 1)
            } else if (adjAreaValue.codePointAt(0) - areaValue.codePointAt(0) === 1) {
              graph.addEdge(areaKey, adjArea, 1)
            }
          }
        })
        
        console.log(surroundingAreas)
      }
    }

    // build the graph
    console.log(graph)

    // bfs
    // get the tree
    
    // find the end point
    console.log('End area', endingArea)

    
  } catch (err) {
    console.error(err)
  }
}

function getSurroundingPositions(pos) {
  return [
    [pos[0], pos[1] + 1], // Top
    [pos[0] + 1, pos[1]], // Right
    [pos[0], pos[1] - 1], // Bottom
    [pos[0] - 1, pos[1]] // Left
  ]
}
