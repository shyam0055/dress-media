import { useTheme } from '../../context/ThemeContext.jsx';
import { FiSun, FiMoon } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        className="toggle-track"
        animate={{ background: isDark ? 'rgba(192,132,252,0.2)' : 'rgba(124,58,237,0.15)' }}
      >
        <motion.div
          className="toggle-thumb"
          layout
          animate={{ x: isDark ? 0 : 26 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <motion.div
            animate={{ rotate: isDark ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isDark ? <FiMoon size={12} /> : <FiSun size={12} />}
          </motion.div>
        </motion.div>
      </motion.div>
    </button>
  );
}
