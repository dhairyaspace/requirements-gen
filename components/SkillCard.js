import { motion } from 'framer-motion'

export default function SkillCard({ title, level, icon, color, description }) {
  return (
    <motion.div 
      className="skill-card"
      style={{ borderTop: `4px solid ${color}` }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05, boxShadow: `0 10px 25px ${color}44` }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="skill-icon" style={{ color }}>{icon}</div>
      <h3>{title}</h3>
      <p className="skill-description">{description}</p>
      <div className="skill-level-container">
        <span>{level}</span>
        <div className="skill-level-bg">
          <motion.div 
            className="skill-level" 
            initial={{ width: 0 }}
            animate={{ 
              width: level === 'Expert' ? '100%' : 
                     level === 'Intermediate' ? '75%' : '30%' 
            }}
            transition={{ delay: 0.8, type: 'spring' }}
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </motion.div>
  )
}