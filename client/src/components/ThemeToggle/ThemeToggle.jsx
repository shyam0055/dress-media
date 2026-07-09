import { useTheme } from '../../context/ThemeContext.jsx';
import { FiSun, FiMoon } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="toggle-track">
        <motion.div
          className="toggle-thumb"
          layout
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          animate={{ x: isDark ? 0 : 22 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isDark ? 'moon' : 'sun'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex' }}
            >
              {isDark ? <FiMoon size={11} /> : <FiSun size={11} />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </button>
  );
}
