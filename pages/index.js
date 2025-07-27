import Head from 'next/head'
import { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import AnimatedPterodactyl from '../components/AnimatedPterodactyl'
import SkillCard from '../components/SkillCard'

export default function Home() {
  const heroTextRef = useRef(null)
  const timelineControls = useAnimation()
  const timelineItems = [0, 1, 2, 3]

  useEffect(() => {
    // Timeline animation
    timelineControls.start({
      backgroundSize: '100% 100%',
      transition: { duration: 2 }
    })
  }, [timelineControls])

  return (
    <>
      <Head>
        <title>Pterodactyl Management Expert | Multimedia Specialist</title>
        <meta name="description" content="Professional pterodactyl wrangler and multimedia creator" />
      </Head>

      <AnimatedPterodactyl />

      <main className="container">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <motion.h1
              ref={heroTextRef}
              className="hero-title"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="text-jurassic">Pterodactyl</span> Management Expert
            </motion.h1>
            <motion.p
              className="hero-subtext"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Multimedia Specialist | cPanel Administrator | Creative Problem Solver
            </motion.p>
          </div>
        </section>

        {/* Skills Section */}
        <section className="skills-section">
          <h2 className="section-title">Prehistoric & Modern Skills</h2>
          <div className="skills-grid">
            <SkillCard 
              title="Pterodactyl Management" 
              level="Expert" 
              icon="🦖" 
              color="#4a7c59"
              description="10+ years wrangling flying reptiles"
            />
            {/* Other SkillCards... */}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="timeline-section">
          <h2 className="section-title">My Prehistoric Journey</h2>
          <motion.div 
            className="timeline" 
            initial={{ backgroundSize: '0% 100%' }}
            animate={timelineControls}
          >
            {timelineItems.map((item) => (
              <motion.div
                key={item}
                className="timeline-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                transition={{ delay: item * 0.3 }}
              >
                <h3>{2008 + item * 4}</h3>
                <p>Timeline event {item + 1}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
    </>
  )
}