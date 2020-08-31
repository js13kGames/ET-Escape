import Event from './event'
import levels from './levels'

const player = 'P1'

const mod = (number, modulo) => (number + modulo) % modulo

export default class PuzzleCrossword {
  constructor(level = 1) {
    this.level = level

    // this.onLanding = new Event()
    this.onMove = new Event()
    this.onAnswer = new Event()
    this.onUseMove = new Event()
    this.onLevel = new Event()
    this.onModal = new Event()
    this.onEnd = new Event()

    this.resetLevel()
  }

  isPass() {
    return this.answer === this.solution
  }

  isFail() {
    return this.answer.length === this.solution.length || this.moves === 0
  }

  resetLevel() {
    this.height = levels[this.level].puzzle.length
    this.width = levels[this.level].puzzle[0].length
    this.levelMap = [...levels[this.level].puzzle.flat()]
    this.playerAt = this.levelMap.indexOf(player)
    this.moves = levels[this.level].moves
    this.answer = ''
    this.solution = levels[this.level].solution
    this.hint = levels[this.level].hint
  }

  process() {
    if (this.isPass()) {
      this.onModal.trigger({
        header: 'You made it through',
        message: 'Congratulations!!!',
        button: 'Next level',
      })
      this.level += 1
      this.resetLevel()
      this.onLevel.trigger(this)
    } else if (this.isFail()) {
      this.onModal.trigger({
        header: 'Lost in wormhole!!',
        message: 'That sucks...luckily this alien can respawn',
        button: 'Play again',
      })
      this.resetLevel()
      this.onLevel.trigger(this)
    }
  }

  updateAnswer() {
    const token = this.levelMap[this.playerAt]
    if (/^[A-Za-z]$/.test(token)) {
      this.onAnswer.trigger({
        letter: token,
        index: this.answer.length,
      })
      this.answer += token
    }
  }

  rowFromIndex(index) {
    return (Math.floor(index / this.height) + this.width) % this.width
  }

  columnFromIndex(index) {
    return ((index % this.width) + this.height) % this.height
  }

  shiftIndex([dy, dx]) {
    const row = this.rowFromIndex(this.playerAt)
    const column = this.columnFromIndex(this.playerAt)

    return mod(row + dy, this.height) * this.width + mod(column + dx, this.width)
  }

  validMove(toIndex) {
    return (
      [
        this.shiftIndex([-1, 0]),
        this.shiftIndex([+1, 0]),
        this.shiftIndex([0, -1]),
        this.shiftIndex([0, +1]),
      ].indexOf(toIndex) > -1
    )
  }

  move(toIndex) {
    if (this.validMove(toIndex)) {
      this.moves -= 1
      this.onUseMove.trigger(this.moves)
      this.onMove.trigger({ from: this.playerAt, to: toIndex })
      this.playerAt = toIndex
      this.updateAnswer()
    }
  }

  play({ index, direction }) {
    if (this.level === Object.keys(levels).length) return this.onEnd.trigger()

    this.move(index ?? this.shiftIndex(direction))
    this.process()
  }
}
