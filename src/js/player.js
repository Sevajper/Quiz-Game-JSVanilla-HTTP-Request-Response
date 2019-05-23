/* Player name script */

import { game } from './quizGame.js'

export var player = function () {
  let temp = document.querySelector('#playerTemplate')
  let div = document.querySelector('#playerDiv')
  let mainDiv = temp.content.cloneNode(true)
  div.appendChild(mainDiv)

  let textField = document.querySelector('#playerText')
  let playerButton = document.querySelector('#playerButton')

  /* On button click listener, take textfield name and send to quizGame script, if empty name = Noob */
  playerButton.addEventListener('click', function () {
    let name = ''
    if (textField.value === '') {
      textField.value = 'Noob'
      name = textField.value
    } else {
      name = textField.value
    }
    div.remove()
    game(name)
  })
}
