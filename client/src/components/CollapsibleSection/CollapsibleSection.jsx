import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import styles from './CollapsibleSection.module.css'

export default function CollapsibleSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={styles.section}>
      <button className={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <span>{title}</span>
        <ChevronDown
          className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`}
          size={20}
        />
      </button>

      <div className={`${styles.content} ${isOpen ? styles.contentOpen : ''}`}>
        {children}
      </div>
    </div>
  )
}