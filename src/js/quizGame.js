/* Quiz game Script */

/* I know the code is quite confusing and spaghetti, but i tried to explain it.
 Right now the only mistake i have noticed is the high score position not changing until new game is started. */

export var game = function (name) {
  /* Global Variables */
  var scoreArr = [0] /* Score array */
  var increment = 0 /* Timer increment */
  var sumScore = 0 /* Final score of player */
  var answer /* Player answer */
  var data /* Answer into json */
  var checkPost = false /* Checking post status boolean */
  var checkWin = false /* Checking if player won boolean */
  var end = false /* Checking if game ended because of wrong answer or timer boolean */
  var time /* Total time */
  var countDown /* Countdown -1 second */
  let response /* Response */
  let question /* Question */
  let form /* Alternatives form */

  /* Creating Html elements */
  let newDiv = document.createElement('div')
  newDiv.setAttribute('id', 'mainDiv')
  document.body.insertBefore(newDiv, document.body.firstChild)
  let temp = document.querySelector('#gameTemplate')
  let div = document.querySelector('#gameDiv')
  let mainDiv = temp.content.cloneNode(true)
  div.appendChild(mainDiv)

  /* Function that takes the total time that a player had left from every question and calculates final score */
  function calculateScore () {
    for (var i = 2; i < scoreArr.length; i++) {
      sumScore += scoreArr[i]
    }
  }

  /* Function that checks if player has won the game, pretty complicated but i'll try to explain */
  function checkVictory () {
    /* I used xml status and a boolean to determine whether the player has won */
    if (xmlGet.status === 404 && checkWin === true) {
      calculateScore()
      window.localStorage.setItem(name, sumScore)
      var lsArray = []
      let temp = 0
      /* If the player has won, an array is created that takes the values from local storage.
        Even numbers in array are names, Odd numbers are scores
        I compare odd numbers, and switch them together.
        For example I compare array index positions arr[1] and arr[3], if arr[1] < arr[3], arr[0] && arr[1] switch positions with arr[2] && arr[3].
        High scores go from highest to lowest */
      for (let i = 0; i < window.localStorage.length; i += 1) {
        for (let y = 0 + temp; y < 2 + temp; y += 2) {
          lsArray[y + 1] = window.localStorage.getItem(window.localStorage.key(i))
          lsArray[y] = window.localStorage.key(i)
        }
        temp += 2
      }

      let tempArr = []
      for (let i = 1; i < lsArray.length; i += 2) {
        for (let y = 3; y < lsArray.length; y += 2) {
          if (i < lsArray.length && y < lsArray.length) {
            if (lsArray[i] < lsArray[y]) {
              tempArr[i] = lsArray[i]
              tempArr[i - 1] = lsArray[i - 1]

              lsArray[i] = lsArray[y]
              lsArray[i - 1] = lsArray[y - 1]

              lsArray[y] = tempArr[i]
              lsArray[y - 1] = tempArr[i - 1]
            }
          }
        }
      }
      /* After fixing the positions of the scores I create a high score page to be displayed at the end */
      div.textContent = ''
      let highScoreHeader = document.createElement('h1')
      highScoreHeader.textContent = 'High Scores'
      div.appendChild(highScoreHeader)
      for (let i = lsArray.length - 1; i >= 0; i -= 2) {
        if (i - 1 >= 0) {
          let hehe = document.createElement('p')
          hehe.textContent = 'Name: ' + lsArray[i - 1] + ' ' + 'Score: ' + lsArray[i]
          div.appendChild(hehe)
        }
      }
      /* I stop the timer */
      clearTimeout(time)
      end = true
      return
    }
    /* This is necessary so because the player also gets the error when he makes a mistake.
    It says checkwin to true which is the condition for the first if in the function. */
    if (xmlGet.status === 404) {
      checkWin = true
      checkVictory()
    }
  }
  /* Time function, decreases by one second */
  function timer () {
    countDown = 20
    if (end === false) {
      document.querySelector('#timer').textContent = countDown
    }
    countDown -= 1
    time = setInterval(function () {
      if (end === false) {
        document.querySelector('#timer').textContent = countDown
      }
      countDown -= 1
      if (countDown < 0) {
        clearTimeout(time)
        div.textContent = 'Time is up! Refresh to play again'
        end = true
      }
    }, 1000)
  }
  /* Xml get request */
  var xmlGet = new window.XMLHttpRequest()

  /* Get function, checks for incorrect answer, checks to see if it's the last question, gets response text, stops old timer, saves the remaining time and starts new timer */
  var getResponse = function (url, getReq) {
    xmlGet.onload = function () {
      if (checkPost === true) {
        clearTimeout(time)
        div.textContent = 'Incorrect answer! Refresh to play again'
        end = true
      } if (checkPost === false) {
        checkVictory()
      }
      if (end === false) {
        response = JSON.parse(xmlGet.responseText)
      }
      if (isNaN(countDown)) {
        countDown = 0
      }
      getReq(response)
    }
    xmlGet.open('GET', url)
    xmlGet.send()
    countDown += 1
    increment += 1
    scoreArr[increment] = countDown
    clearTimeout(time)
    timer()
  }
  /* Get function for the first question */
  getResponse('http://vhost3.lnu.se:20080/question/1', function (res) {
    response = res
    question = document.querySelector('#question')
    question.textContent = response.question
  })

  /* Post function, JSON the answer, checks status of post to see if game is over, sends post request */
  var postResponse = function (url, answer, postReq) {
    data = JSON.stringify({
      answer
    })
    var xmlPost = new window.XMLHttpRequest()
    xmlPost.onload = function () {
      if (xmlPost.status === 400) {
        checkPost = true
      }
      if (end === false) {
        response = JSON.parse(xmlPost.responseText)
      }
      postReq(response)
    }
    xmlPost.open('POST', url)
    xmlPost.setRequestHeader('Content-Type', 'application/json')
    xmlPost.send(data)
  }
  var textArea = document.querySelector('#gameText')
  var button = document.querySelector('#gameButton')

  /* On button click listener, checks to see if answers have alternatives and if they do finds checked answer, if not answer is the textfield value */
  button.addEventListener('click', function () {
    form = document.querySelector('#radioForm')
    if (response.hasOwnProperty('alternatives')) {
      for (var x = 0; x < form.length; x += 1) {
        if (form[x].checked) {
          answer = document.getElementById('alt' + (x + 1)).id
        }
      }
    } else {
      answer = textArea.value
    }

    /* Calling functions, updating question, checking if alternatives exists. If so creating new form for alternatives, otherwise deleting form if exists and creating textfield. */
    postResponse(response.nextURL, answer, function () {
      getResponse(response.nextURL, function () {
        if (end === false) {
          question = document.querySelector('#question')
        }
        question.textContent = response.question

        if (response.hasOwnProperty('alternatives')) {
          let form = document.createElement('form')
          form.setAttribute('id', 'radioForm')
          let formDiv = document.querySelector('#formDiv')
          textArea.style.display = 'none'
          for (var i in response.alternatives) {
            let radioButton = document.createElement('input')
            let label = document.createElement('label')
            radioButton.setAttribute('type', 'radio')
            radioButton.setAttribute('name', 'radio')
            label.setAttribute('id', i)
            label.textContent = response.alternatives[i]

            form.appendChild(radioButton)
            form.appendChild(label)
          }
          formDiv.appendChild(form)
        } else {
          try {
            form.remove()
            textArea.value = ''
            textArea.style.display = 'block'
          } catch (err) {
            console.log('Form does not exist so cannot be removed')
          }
        }
        try {
          form.remove()
        } catch (err) {
          console.log('Form does not exist so cannot be removed')
        }
      })
    })
  })
}
