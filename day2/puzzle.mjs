import { fileURLToPath } from 'url'
import fs from 'fs'
import path, { dirname } from 'path'

import * as readline from 'node:readline/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PLAYS_ENUM = {
  ROCK: 'ROCK',
  PAPER: 'PAPER',
  SCISSORS: 'SCISSORS',
}

const GAME_RESULTS_ENUM = {
  LOSE: 'LOSE',
  DRAW: 'DRAW',
  WIN: 'WIN'
}

const PLAY_SCORE_MAP = {
  [PLAYS_ENUM.ROCK]: 1,
  [PLAYS_ENUM.PAPER]: 2,
  [PLAYS_ENUM.SCISSORS]: 3 
}

const OPPONENT_PLAY_MAP = {
  A: PLAYS_ENUM.ROCK,
  B: PLAYS_ENUM.PAPER,
  C: PLAYS_ENUM.SCISSORS,
}

const PLAYER_PLAY_MAP = {
  X: PLAYS_ENUM.ROCK,
  Y: PLAYS_ENUM.PAPER,
  Z: PLAYS_ENUM.SCISSORS,
}

const GAME_RESULT_MAP = {
  X: GAME_RESULTS_ENUM.LOSE,
  Y: GAME_RESULTS_ENUM.DRAW,
  Z: GAME_RESULTS_ENUM.WIN,
}

const GAME_RESULT_SCORE = {
  [GAME_RESULTS_ENUM.LOSE]: 0,
  [GAME_RESULTS_ENUM.DRAW]: 3,
  [GAME_RESULTS_ENUM.WIN]: 6
}

main()

async function main () {
  try {
    const readStream = fs.createReadStream(path.resolve(__dirname, 'input.txt'), { encoding: 'utf8' })
    const fileLinesStream = readline.createInterface({ input: readStream })

    let totalScore = 0
    let totalStrategyScore = 0
    for await (const line of fileLinesStream) {
      const [opponentPlay, , action] = line
      const gamePlayerPlay = PLAYER_PLAY_MAP[action]
      const gameOpponentPlay = OPPONENT_PLAY_MAP[opponentPlay]
      const gameScore = calculateGameScore(gamePlayerPlay, gameOpponentPlay)
      totalScore += gameScore
      
      const gameTargetResult = GAME_RESULT_MAP[action]
      const ProspectPlayerPlay = calculateProspectPlay(gameOpponentPlay, gameTargetResult)
      const gameStrategyScore = calculateGameScore(ProspectPlayerPlay, gameOpponentPlay)
      totalStrategyScore += gameStrategyScore
    }
    // Part 1
    console.log('The total score with the given strategy would be:', totalScore)
  
    // Part 2
    console.log('The total score with the actual strategy would be:', totalStrategyScore)
  } catch (err) {
    console.error(err)
  }
}

function calculateGameScore (playerPlay, opponentPlay) {
  let gameScore
  switch (playerPlay) {
    case PLAYS_ENUM.ROCK: {
      if (opponentPlay === PLAYS_ENUM.PAPER) gameScore = GAME_RESULT_SCORE[GAME_RESULTS_ENUM.LOSE]
      else if (opponentPlay === PLAYS_ENUM.ROCK) gameScore = GAME_RESULT_SCORE[GAME_RESULTS_ENUM.DRAW]
      else if (opponentPlay === PLAYS_ENUM.SCISSORS) gameScore = GAME_RESULT_SCORE[GAME_RESULTS_ENUM.WIN]
    }
    break
    case PLAYS_ENUM.PAPER: {
      if (opponentPlay === PLAYS_ENUM.SCISSORS) gameScore = GAME_RESULT_SCORE[GAME_RESULTS_ENUM.LOSE]
      else if (opponentPlay === PLAYS_ENUM.PAPER) gameScore = GAME_RESULT_SCORE[GAME_RESULTS_ENUM.DRAW]
      else if (opponentPlay === PLAYS_ENUM.ROCK) gameScore = GAME_RESULT_SCORE[GAME_RESULTS_ENUM.WIN]
    }
    break
    case PLAYS_ENUM.SCISSORS: {
      if (opponentPlay === PLAYS_ENUM.ROCK) gameScore = GAME_RESULT_SCORE[GAME_RESULTS_ENUM.LOSE]
      else if (opponentPlay === PLAYS_ENUM.SCISSORS) gameScore = GAME_RESULT_SCORE[GAME_RESULTS_ENUM.DRAW]
      else if (opponentPlay === PLAYS_ENUM.PAPER) gameScore = GAME_RESULT_SCORE[GAME_RESULTS_ENUM.WIN]
    }
    break
  }
  return gameScore + PLAY_SCORE_MAP[playerPlay]
}

function calculateProspectPlay (opponentPlay, targetResult) {
  let playerPlay
  switch (targetResult) {
    case GAME_RESULTS_ENUM.LOSE: {
      if (opponentPlay === PLAYS_ENUM.PAPER) playerPlay = PLAYS_ENUM.ROCK
      else if (opponentPlay === PLAYS_ENUM.ROCK) playerPlay = PLAYS_ENUM.SCISSORS
      else if (opponentPlay === PLAYS_ENUM.SCISSORS) playerPlay = PLAYS_ENUM.PAPER
    }
    break
    case GAME_RESULTS_ENUM.DRAW: {
      if (opponentPlay === PLAYS_ENUM.PAPER) playerPlay = PLAYS_ENUM.PAPER
      else if (opponentPlay === PLAYS_ENUM.ROCK) playerPlay = PLAYS_ENUM.ROCK
      else if (opponentPlay === PLAYS_ENUM.SCISSORS) playerPlay = PLAYS_ENUM.SCISSORS
    }
    break
    case GAME_RESULTS_ENUM.WIN: {
      if (opponentPlay === PLAYS_ENUM.PAPER) playerPlay = PLAYS_ENUM.SCISSORS
      else if (opponentPlay === PLAYS_ENUM.ROCK) playerPlay = PLAYS_ENUM.PAPER
      else if (opponentPlay === PLAYS_ENUM.SCISSORS) playerPlay = PLAYS_ENUM.ROCK
    }
    break
  }

  return playerPlay
}