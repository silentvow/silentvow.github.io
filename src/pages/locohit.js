import { Stage } from '@pixi/react'
import { Assets } from 'pixi.js'
import { useEffect, useState } from 'react'

import BounceText from '@/components/BounceText'
import MainGame from '@/components/MainGame'
import { IMG_URLS } from '@/constants/image'
import { SOUND_URLS } from '@/constants/sound'
import { FONT_TEST_STRING } from '@/constants/text'
import dynamic from 'next/dynamic'
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/constants/game'

const SoundProvider = dynamic(() => import('@/components/SoundProvider'), { ssr: false })

Object.entries(IMG_URLS).forEach(([key, url]) => Assets.add(key, url))

function handleStageMount (app) {
  const canvas = document.querySelector('canvas')
  if (!canvas) return
  canvas.style.minWidth = 'min(1440px, 100vw - 32px)'
  canvas.style.minHeight = 'min(1080px, calc((100vw - 32px) * 3 / 4))'
  canvas.style.maxWidth = 'calc(100vw - 32px)'
  canvas.style.maxHeight = 'calc((100vw - 32px) * 3 / 4)'
}

function Home () {
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [, setAssetsLoadFailed] = useState(false)

  useEffect(() => {
    Assets.load(Object.keys(IMG_URLS)).then(() => {
      const promise = new Promise((resolve, reject) => {
        const { sound } = require('@pixi/sound')
        sound.add(SOUND_URLS, { preload: true, loaded: () => resolve() })
      })
      return promise
    }).then(() => {
      const promise = new Promise((resolve, reject) => {
        const WebFont = require('webfontloader')
        WebFont.load({
          custom: {
            families: ['Xiaolai Mono SC', 'Joystix Monospace'],
            urls: ['https://cdn.jsdelivr.net/npm/cn-fontsource-xiaolai-mono-sc-regular/font.css', '/fonts/fonts.css'],
            testStrings: { 'Xiaolai Mono SC': FONT_TEST_STRING },
          },
          google: {
            families: ['Sono', 'Noto Sans TC'],
          },
          active: e => {
            resolve()
          },
        })
      })
      return promise
    }).then(() => {
      setAssetsLoaded(true)
    }).catch(() => {
      setAssetsLoadFailed(true)
    })
  }, [])

  return (
    <SoundProvider>
      <div className='flex sm:hidden w-full pt-8 justify-center'>
        此網頁在小於 640 像素的螢幕上可能無法正常運作。
      </div>
      <div className='flex flex-col'>
        <div className='flex-1 p-8 flex justify-center'>
          <div className='border-2 border-black select-none'>
            {assetsLoaded
              ? (
                <Stage
                  width={SCREEN_WIDTH}
                  height={SCREEN_HEIGHT}
                  onMount={handleStageMount}
                >
                  <MainGame />
                </Stage>)
              : (
                <div className='w-[min(1440px,calc(100vw-32px))] h-[min(1080px,calc(calc(100vw-32px)*0.75))] text-[#423934] font-comic text-[min(144px,10vw)] flex justify-center items-center bg-[url("/img/bg1.png")]'>
                  <BounceText text='Loading...' />
                </div>
                )}
          </div>
        </div>
      </div>
    </SoundProvider>
  )
}

export default Home
