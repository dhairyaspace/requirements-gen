import '../styles/globals.css'
import { AnimatePresence } from 'framer-motion'

function MyApp({ Component, pageProps, router }) {
  return (
    <AnimatePresence mode="wait">
      <Component key={router.asPath} {...pageProps} />
    </AnimatePresence>
  )
}

export default MyApp