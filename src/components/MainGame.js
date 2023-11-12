import { useCallback, useEffect, useState } from 'react'
import { TextStyle } from 'pixi.js'
import { v4 as uuidv4 } from 'uuid'
import { TilingSprite, Container, Sprite, useTick, Graphics, Text, useApp } from '@pixi/react'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/constants/game'
import { IMG_URLS } from '@/constants/image'

const SPEED = 3
const TYPE = {
  A: 0,
  B: 1,
  C: 2,
  X: 3,
}

const IMAGES = {
  [TYPE.A]: IMG_URLS.LOCO_1,
  [TYPE.B]: IMG_URLS.LOCO_2,
  [TYPE.C]: IMG_URLS.LOCO_3,
  [TYPE.X]: IMG_URLS.ERICA_1,
}

const SIZES = {
  [TYPE.A]: { w: 150, h: 174 },
  [TYPE.B]: { w: 150, h: 222 },
  [TYPE.C]: { w: 186, h: 165 },
  [TYPE.X]: { w: 150, h: 165 },
}

const POINTS = {
  [TYPE.A]: 1,
  [TYPE.B]: 2,
  [TYPE.C]: 3,
  [TYPE.X]: -5,
}

const RULES = {
  12: [3, 2, 2, 5],
  10: [3, 2, 1, 4],
  8: [2, 2, 1, 3],
  6: [2, 2, 0, 2],
  4: [2, 1, 0, 1],
  2: [2, 0, 0, 0],
}

const hitArea = {
  contains: () => true,
}

const textStyle = new TextStyle({
  align: 'right',
  fontFamily: '"Comic Sans MS", "Comic Sans", "Chalkboard", "ChalkboardSE-Regular", "cursive"',
  fontSize: 64,
  fill: '#000000',
  lineHeight: 64 * 1.2,
})

function drawStartBtn (g) {
  g.clear()
  g.beginFill(0x5B3138, 1)
  g.drawRect(760, 880, 206, 64)
  g.endFill()
  g.alpha = 0.0
}

function genPos (targets) {
  let arr = Array(12).fill(0).map((_, idx) => idx)
  targets.forEach((target) => {
    arr[target.pos] = -1
  })
  arr = arr.filter(a => a >= 0)
  return arr[Math.floor(Math.random() * arr.length)]
}

function addNewTarget (targets, rule) {
  const pos = genPos(targets)
  const arr = rule.slice()
  targets.forEach((target) => {
    arr[target.type]--
  })
  const items = []
  arr.forEach((a, idx) => {
    for (let i = 0; i < a; ++i) {
      items.push(idx)
    }
  })
  return {
    id: uuidv4(),
    type: items[Math.floor(Math.random() * items.length)],
    pos,
    h: 0,
    dh: SPEED,
  }
}

const POS_OFFSETS = [
  { x: 330, y: 520 },
  { x: 560, y: 520 },
  { x: 790, y: 520 },
  { x: 1010, y: 520 },
  { x: 310, y: 660 },
  { x: 540, y: 660 },
  { x: 770, y: 660 },
  { x: 990, y: 660 },
  { x: 280, y: 800 },
  { x: 510, y: 800 },
  { x: 740, y: 800 },
  { x: 960, y: 800 },
]

const pushNewArray = (arr, el) => {
  const newArr = [...arr, el]
  newArr.sort((a, b) => a.pos - b.pos)
  return newArr
}

const MainGame = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeSec, setTimeSec] = useState(0)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [targets, setTargets] = useState([])
  const [inCoolDown, setInCoolDown] = useState(false)
  const [whackObj, setWhackObj] = useState({})

  const app = useApp()
  useEffect(() => {
    app.renderer.events.cursorStyles.default = 'url(\'/img/cursor.png\'),auto'
  }, [app])

  useEffect(() => {
    if (isPlaying) {
      setTimeSec(75)
      setScore(0)

      const timer = setInterval(() => {
        setTimeSec(t => t - 1)
      }, 1000)
      const coolTimer = setInterval(() => {
        setInCoolDown(false)
      }, 300)
      return () => {
        clearInterval(timer)
        clearInterval(coolTimer)
      }
    }
  }, [isPlaying])

  useEffect(() => {
    if (timeSec === 0) {
      setIsPlaying(false)
      setTargets([])
    }
  }, [timeSec])

  useEffect(() => {
    if (!isPlaying) {
      setHighScore(s => Math.max(s, score))
    }
  }, [isPlaying, score])

  useTick((delta) => {
    if (!isPlaying) return

    /* NOTE: move targets */
    setTargets(arr => {
      return arr.map((target) => {
        const nextH = target.h + target.dh * delta * SIZES[target.type].h / SIZES[TYPE.A].h
        const h = Math.min(SIZES[target.type].h, nextH)
        if (h >= SIZES[target.type].h && target.dh > 0) {
          target.dh = -SPEED
        }
        return {
          ...target,
          h,
        }
      }).filter(target => target.h >= 0)
    })

    /* NOTE: add new target */
    if (timeSec > 60) {
      if (inCoolDown) return
      if (targets.length >= 2) return
      /* 2: A2 */
      setTargets(arr => {
        return pushNewArray(arr, addNewTarget(arr, RULES[2]))
      })
    } else if (timeSec > 45) {
      if (inCoolDown && targets.length >= 3) return
      if (targets.length >= 4) return
      /* 4: A2B1X1 */
      setTargets(arr => {
        return pushNewArray(arr, addNewTarget(arr, RULES[4]))
      })
    } else if (timeSec > 30) {
      if (inCoolDown && targets.length >= 5) return
      if (targets.length >= 6) return
      /* 6: A2B2X2 */
      setTargets(arr => {
        return pushNewArray(arr, addNewTarget(arr, RULES[6]))
      })
    } else if (timeSec > 15) {
      if (inCoolDown && targets.length >= 7) return
      if (targets.length >= 8) return
      /* 8: A2B2C1X3 */
      setTargets(arr => {
        return pushNewArray(arr, addNewTarget(arr, RULES[8]))
      })
    } else {
      if (inCoolDown && targets.length >= 9) return
      if (targets.length >= 10) return
      /* 10: A3B2C1X4 */
      setTargets(arr => {
        return pushNewArray(arr, addNewTarget(arr, RULES[10]))
      })
    }
    setInCoolDown(true)
  })

  const hitTarget = useCallback((target, event) => {
    setScore(s => Math.max(0, s + POINTS[target.type]))
    setTargets(arr => {
      return arr.filter(t => t.id !== target.id)
    })

    const whackId = uuidv4()
    setWhackObj(obj => {
      return { ...obj, [whackId]: { x: event.globalX, y: event.globalY } }
    })
    setTimeout(() => {
      setWhackObj(obj => {
        const newObj = { ...obj }
        delete newObj[whackId]
        return newObj
      })
    }, 100)
  }, [])

  return (
    <Container
      eventMode='static'
      hitArea={hitArea}
    >
      <TilingSprite
        image={IMG_URLS.BG}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
      />
      <Sprite
        image={IMG_URLS.ERICA}
        x={-120}
        y={960}
        anchor={[0, 1]}
      />
      <Sprite
        image={IMG_URLS.MACHINE}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
      />
      <Text
        text={`${highScore}`}
        style={textStyle}
        x={510}
        y={260}
        anchor={[1, 0]}
      />
      <Text
        text={`${score}`}
        style={textStyle}
        x={790}
        y={260}
        anchor={[1, 0]}
      />
      <Text
        text={`${timeSec}`}
        style={textStyle}
        x={1060}
        y={260}
        anchor={[1, 0]}
      />
      {targets.map((target) => (
        <TilingSprite
          key={target.id}
          image={IMAGES[target.type]}
          x={POS_OFFSETS[target.pos].x}
          y={POS_OFFSETS[target.pos].y}
          anchor={[0.5, 1]}
          tilePosition={[0, 0]}
          width={SIZES[target.type].w}
          height={target.h}
          eventMode='static'
          onclick={(e) => hitTarget(target, e)}
          ontouchstart={(e) => hitTarget(target, e)}
        />
      ))}
      {Object.entries(whackObj).map(([key, obj]) => (
        <Sprite
          key={key}
          image={IMG_URLS.WHACK}
          x={obj.x}
          y={obj.y}
          anchor={[0.5, 0.5]}
        />
      ))}
      <Graphics
        draw={drawStartBtn}
        eventMode='static'
        onclick={() => setIsPlaying(true)}
        ontouchstart={() => setIsPlaying(true)}
      />
    </Container>
  )
}

export default MainGame
