import { useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import HeroCharacter from './HeroCharacter'
import { useCanHover } from '../../lib/useCanHover'

/** Homepage-only character stage. It preserves the existing mouse-responsive
 * illustrated mascot while removing the former game-world props. */
export default function HeroStage() {
  const prefersReduced = useReducedMotion()
  const canHover = useCanHover()
  const stageRef = useRef<HTMLDivElement>(null)
  const [pointerX, setPointerX] = useState<number | null>(null)
  const [pointerY, setPointerY] = useState<number | null>(null)

  const onPointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover) return
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    setPointerX(Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)))
    setPointerY(Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)))
  }

  return (
    <div
      ref={stageRef}
      onMouseMove={onPointerMove}
      onMouseLeave={() => { setPointerX(null); setPointerY(null) }}
      className="relative mx-auto aspect-square w-full max-w-[330px] overflow-visible sm:max-w-[370px]"
    >
      <div className="absolute inset-x-[10%] bottom-[8%] h-[16%] rounded-[50%] bg-violet-300/20 blur-2xl" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
        <HeroCharacter pointerX={pointerX} pointerY={pointerY} reducedMotion={!!prefersReduced} interactive={canHover} size={300} />
      </div>
    </div>
  )
}
