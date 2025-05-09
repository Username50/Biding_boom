/*
@title: Infinite Platformer
@author: EnterpriseGoose
@tags: ['platformer', 'endless']
@addedOn: 2024-11-25
*/

// Core Game Constants
const fps = 20
const gameSpeed = .8

let gameStart = Date.now()
let prevFrame = Date.now()
let nextPlatform = 0
let gameRunning = false
let gameStarted = false

const black = "b"
const red = "r"

setLegend(
  [black, bitmap`
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000
0000000000000000`], 
  [red, bitmap`
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333`]
)

setSolids([black])

const levels = [
  map`
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................
................................................................................................................................................................`
]

let platforms = []
let player = { old: [], r: 2, x: 0, y: 10, vx: 0, vy: 0 }
let doubleJumped = false

setMap(levels[0])


onInput("w", () => {
  if (checkLanded() && gameRunning) {
    player.vy = 5
    gameClock(false)
  } else if (!doubleJumped && gameRunning && player.vy < 2) {
    player.vy = 5
    gameClock(false)
    doubleJumped = true
  }
})
onInput("a", () => {
  if (gameRunning) {
    player.vx = -5
    gameClock(false)
  }
})
onInput("d", () => {
  if (gameRunning) {
    player.vx = 5
    gameClock(false)
  }
})

afterInput(() => {
  if (!gameStarted) {
    platforms = []
    player = { old: [], r: 2, x: 0, y: 10, vx: 0, vy: 0 }
    clearText()
    platforms.push({ old: [], x: 0, y: 0, len: 50, angle: 0 })
    moveEntity(platforms[0], getPlatform(0, 0, 50, 0), 0, 0)
    gameStart = Date.now()
    prevFrame = Date.now()
    nextPlatform = Date.now() + 1500
    gameClock(true)

    gameStarted = true
  }
})



addText("Infinite Platformer", {y:1})
addText("Use (a) and (d) to", {y:3})
addText("move left and right", {y:4})
addText("Use (w) to jump", {y:6})
addText("You can double jump", {y:7})
addText("Try to last as", {y:9})
addText("long as you can.", {y:10})
addText("Good luck!", {y:11})
addText("(Press any key", {y:13})
addText("to start)", {y:14})



function gameClock(recursive) {
  let dt = ((Date.now() - prevFrame) * fps) / 1000
  let speed = dt * gameSpeed
  prevFrame = Date.now()
  if (Date.now() - gameStart > 2000) {
    gameRunning = true
    platforms.forEach(platform => {
      moveEntity(platform, getPlatform(platform.x, -platform.y, platform.len, platform.angle), -speed, 0)
    })
    if (platforms.length > 0 && platforms[0].x + platforms[0].len * Math.cos(platforms[0].angle) < -width()) {
      platforms.splice(0, 1)
    }
  }

  if (Date.now() > nextPlatform) {
    let prevPlatform = platforms[platforms.length - 1]
    let newY = prevPlatform.y + Math.sin(prevPlatform.angle) * prevPlatform.len
    if (newY == 0) newY = 0.001
    let newAngle = randInRange((-60 - newY) / 20 < -1 ? -.6 : Math.max(-.6, Math.asin((-60 - newY) / 20)), (60 - newY) / 20 > 1 ? .6 : Math.min(.6, Math.asin((60 - newY) / 20)))
    platforms.push({ old: [], x: 80, y: newY, len: 20, angle: newAngle })
    nextPlatform = Date.now() + 2000 + Math.random() * 1000 + (1500 * (Date.now() - gameStart)) / (Date.now() - gameStart + 100000)
  }


  if (player.x <= -80 && player.vx < 0) {
    player.vx = 0
  }
  if (player.x >= 80 && player.vx > 0) {
    player.vx = 0
  }
  if (player.y <= -64) {
    gameRunning = false
    getAll(black).forEach((sprite) => {sprite.remove()})
    addText("Game Over", {y:1})
    addText("Score:", {y:3})
    let totalPts = Math.round((Date.now() - gameStart) / 100) * 100
    displayScore(0, totalPts, 4)
    return
  }
  if (player.y >= 64 && player.vy > 0) {
    player.vy = 0
  }
  landOnGround()
  moveEntity(player, transform(getCircle(player.r, true), width() / 2 + player.x, height() / 2 - player.y), player.vx * speed + (Date.now() - gameStart > 2000 ? -speed : 0), player.vy * speed)
  player.vy -= .5 * speed
  player.vx *= .05 * speed

  if (checkLanded()) doubleJumped = false


  if (recursive) setTimeout(() => { gameClock(true) }, 1000 / fps)
}


function moveEntity(entity, newEntity, dx, dy) {
  entity.x += dx
  entity.y += dy
  let changedPixels = getEntityMovement(entity.old, newEntity)
  changedPixels[1].forEach(([px, py]) => {
    if (px >= 0 && py >= 0 && px <= width() && py <= height()) clearTile(px, py)
  })
  changedPixels[0].forEach(([px, py]) => {
    if (px >= 0 && py >= 0 && px < width() && py < height()) {
      addSprite(px, py, black)
    }
  })
  entity.old = newEntity
}

function checkLanded() {
  let checkPlatforms = platforms.filter(platform => player.x >= platform.x - 10 && player.x <= platform.x + 10 + platform.len * Math.cos(platform.angle))
  for (let i = 0; i < checkPlatforms.length; i++) {
    let plat = checkPlatforms[i]
    let dis = dPtoLine(player.x, player.y, plat.x, plat.y, plat.x + plat.len * Math.cos(plat.angle), plat.y + plat.len * Math.sin(plat.angle))
    if (dis - 2.5 - player.r <= 0.5) {
      return true;
    }
  }
  return false;
}

function landOnGround() {
  let checkPlatforms = platforms.filter(platform => player.x >= platform.x - 10 && player.x <= platform.x + 10 + platform.len * Math.cos(platform.angle))
  for (let i = 0; i < checkPlatforms.length; i++) {
    let plat = checkPlatforms[i]
    let dis = dPtoLine(player.x, player.y, plat.x, plat.y, plat.x + plat.len * Math.cos(plat.angle), plat.y + plat.len * Math.sin(plat.angle))
    if (dis - 2.5 - player.r < 0) {
      player.y = plat.y + 2.5 + player.r + ((player.x - plat.x) / plat.len) * (Math.sin(plat.angle) * plat.len)
      if (player.vy < 0) player.vy = 0
      return;
    }
    if (dis - 2.5 - player.r < -player.vy) {
      player.vy = -dis + 2.5 + player.r
      return;
    }
  }
}

function dPtoLine(x, y, x1, y1, x2, y2) {
  let dLx = x2 - x1;
  let dLy = y2 - y1;

  var len_sq = dLx * dLx + dLy * dLy;
  var param = -1;
  if (len_sq != 0)
      param = ((x - x1) * dLx + (y - y1) * dLy) / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * dLx;
    yy = y1 + param * dLy;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

function getEntityMovement(oPixels, nPixels) {
  if (Array.isArray(oPixels[0])) {
    oPixels = joinPosArray(oPixels)
  }
  if (Array.isArray(nPixels[0])) {
    nPixels = joinPosArray(nPixels)
  }

  const addPixels = separatePosArray(nPixels.filter(pixel => !oPixels.includes(pixel)))
  const removePixels = separatePosArray(oPixels.filter(pixel => !nPixels.includes(pixel)))

  return [addPixels, removePixels]
}

function getPlatform(x, y, length, angle) {
  x = width() / 2 + x
  y = height() / 2 + y
  dx = Math.cos(-angle) * length
  dy = Math.sin(-angle) * length
  r = 2

  let circle = getCircle(r, true)
  let startCircle = transform(circle, x, y)
  let endCircle = transform(startCircle, dx, dy)
  let pixels = joinPosArray([...startCircle, ...endCircle])


  for (let i = 0; i < length; i += .5) {
    for (let j = -r - .5; j < r; j += .5) {
      addPixel(pixels, i * Math.cos(angle) + j * Math.sin(angle) + x, j * Math.cos(angle) - i * Math.sin(angle) + y)
    }
  }

  return separatePosArray(pixels)
}

function getCircle(r, filled, resolution) {
  resolution ??= 5
  let pixels = []
  for (let theta = 0; theta < Math.PI * 2; theta += 1 / (r * resolution)) {
    for (let b = (filled ? 0 : r); b <= r; b++) {
      let i = Math.round(Math.cos(theta) * b)
      let j = Math.round(Math.sin(theta) * b)

      let pos = i + "|" + j
      if (!pixels.includes(pos)) {
        pixels.push(pos)
      }
    }
  }
  return separatePosArray(pixels)
}

function separatePosArray(arr) {
  return Array.from(arr, pos => Array.from(pos.split("|"), coord => parseInt(coord)))
}

function joinPosArray(arr) {
  return Array.from(arr, pos => pos.join("|"))
}

function transform(arr, x, y) {
  if (typeof arr[0] == "string") {
    return Array.from(separatePosArray(arr), pos => [pos[0] + x, pos[1] + y])
  }
  return Array.from(arr, pos => [pos[0] + x, pos[1] + y])
}

function addPixel(arr, x, y) {
  if (Array.isArray(arr[0])) {
    arr = joinPosArray(arr)
  }
  let pos = Math.round(x) + "|" + Math.round(y)
  if (!arr.includes(pos)) {
    arr.push(pos)
  }
  return arr
}

function displayScore(score, totalScore, y) {
  score += 120
  if (totalScore - score > 10000) score += 230
  if (totalScore - score > 30000) score += 370
  if (totalScore - score > 50000) score += 850
  if (totalScore - score > 100000) score += Math.round((totalScore - score) / 100000) * 10000

  if (score >= totalScore) {
    addText(totalScore + "", {y, color: color`5`})
    gameStarted = false
    addText("Press any key", {y:10})
    addText("to restart", {y: 11})
    return
  }
  addText(score + "", {y, color: color`3`})
  setTimeout(() => {displayScore(score, totalScore, y)}, 0)
}

function randInRange(min, max) {
  return Math.random()*(max - min) + min
}
