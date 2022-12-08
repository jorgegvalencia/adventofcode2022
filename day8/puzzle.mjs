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

    const grid = []
    let index = 0
    for await (const line of fileLinesStream) {
      const gridLine = [...line].map(tree => Number(tree))
      grid[index] = [...gridLine]
      index++
    }

    // Part 1
    const hiddenTrees = getHiddenTreesList(grid)
    const totalTrees = (grid.length) * (grid.length)
    const result1 = totalTrees - hiddenTrees.length

    console.log(`The number of visible trees from outside the grid is: ${result1}`)

    // Part 2
    const result2 = getHighestScenicScore(grid)
    console.log(`The highest scenic score is: ${result2}`)
  } catch (err) {
    console.error(err)
  }
}

function getHiddenTreesList (grid) {
  const transposedGrid = transpose(grid)
  const _treesVisibility = []
  const hiddenTrees = []

  let x = 1
  while (x < grid.length - 1) {
    _treesVisibility[x] = []

    for (let y = 1; y < grid[x].length - 1; y++) {
      const treePivot = grid[x][y]

      // Scan the row
      const isVisibleFromTop = checkAllTreesOnRowAreLower(
        treePivot,
        transposedGrid[y].slice(0, x)
      )
      const isVisibleFromRight = checkAllTreesOnRowAreLower(
        treePivot,
        grid[x].slice(y + 1, grid[x].length)
      )
      const isVisiblefromBottom = checkAllTreesOnRowAreLower(
        treePivot,
        transposedGrid[y].slice(x + 1, transposedGrid[y].length)
      )
      const isVisibleFromLeft = checkAllTreesOnRowAreLower(
        treePivot,
        grid[x].slice(0, y)
      )

      const isVisible = isVisibleFromTop || isVisibleFromRight || isVisiblefromBottom || isVisibleFromLeft
      if (!isVisible) {
        hiddenTrees.push([x, y])
        _treesVisibility[x][y] = 'hidden'
        continue
      }

      _treesVisibility[x][y] = 'visible'
    }
    x++
  }

  return hiddenTrees
}

function getHighestScenicScore (grid) {
  const transposedGrid = transpose(grid)
  const _treesScenicScores = []

  let highestScenicScore = 0
  let x = 0
  while (x <= grid.length - 1) {
    _treesScenicScores[x] = []
  
    for (let y = 0; y <= grid[x].length - 1; y++) {
      const treePivot = grid[x][y]

      // Scan the row
      const scenicScoreFromTop = getDirectionScenicScore(treePivot, transposedGrid[y].slice(0, x).reverse())
      const scenicScoreFromRight = getDirectionScenicScore(treePivot, grid[x].slice(y + 1, grid[x].length))
      const scenicScorefromBottom = getDirectionScenicScore(treePivot, transposedGrid[y].slice(x + 1, transposedGrid[y].length))
      const scenicScoreFromLeft = getDirectionScenicScore(treePivot, grid[x].slice(0, y).reverse())

      const scenicScore = scenicScoreFromTop * scenicScoreFromRight * scenicScorefromBottom * scenicScoreFromLeft

      _treesScenicScores[x][y] = scenicScore

      if (highestScenicScore < scenicScore) {
        highestScenicScore = scenicScore
      }
    }
    x++
  }

  console.table(_treesScenicScores)
  return highestScenicScore
}

function checkAllTreesOnRowAreLower (treeHeight, directionRow) {
  let areAllLower = true
  for (let i = 0; i < directionRow.length && areAllLower; i++) {
    const neighboorTreeHeight = directionRow[i]
    if (neighboorTreeHeight >= treeHeight) {
      areAllLower = false
    }
  }

  return areAllLower
}

function getDirectionScenicScore (treeHeight, directionRow) {
  let stopper = false
  let score = 0
  for (let i = 0; i < directionRow.length && !stopper; i++) {
    const neighboorTreeHeight = directionRow[i]
    if (neighboorTreeHeight >= treeHeight) {
      stopper = true
    }
    score++
  }
  return score
}

function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map(row => row[i]))
}