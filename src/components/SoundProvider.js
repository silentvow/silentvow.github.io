import { SOUND_URLS } from '@/constants/sound'
import { sound } from '@pixi/sound'

sound.add(SOUND_URLS)

function SoundProvider ({ children }) {
  return children
}

export default SoundProvider
