import { useEffect, useRef } from 'react'
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion'

export default function AnimatedPterodactyl() {
  const controls = useAnimation()
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  useEffect(() => {
    // Flying animation
    controls.start({
      x: ['-100%', '150%'],
      y: ['-20%', '10%', '-20%'],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: 'linear'
      }
    })

    // Cursor follower
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX + 20)
      cursorY.set(e.clientY + 20)
    }

    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [controls, cursorX, cursorY])

  return (
    <>
      <motion.div 
        animate={controls}
        className="pterodactyl"
        style={{ position: 'absolute', fontSize: '3rem', zIndex: 1 }}
      >
        🦅
      </motion.div>
      
      <motion.div 
        className="pterodactyl-cursor"
        style={{
          position: 'fixed',
          fontSize: '1.5rem',
          x: cursorX,
          y: cursorY,
          zIndex: 9999
        }}
      >
        🦖
      </motion.div>
    </>
  )
}