'use client'

import styles from './TrustBadges.module.css'

export default function TrustBadges() {
  const items = [
    { text: 'Secure checkout', icon: '🔒' },
    { text: 'Quick delivery', icon: '🚚' },
    { text: 'Quality assured', icon: '✨' },
  ]
  return (
    <div className="mt-6">
      <ul className={styles.inline} aria-label="Trust and guarantees">
        {items.map(({ text, icon }) => (
          <li key={text} className={styles.pill}>
            <span className={styles.icon} aria-hidden="true">{icon}</span>
            <span className={styles.text}>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
