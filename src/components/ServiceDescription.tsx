'use client'

import React, { useState, useEffect, useRef } from 'react'

const OR = '#B8922A'

export default function ServiceDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const [needsToggle, setNeedsToggle] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Mesure en etat replie : le texte depasse-t-il les 3 lignes ?
  // Si oui, on affiche le bouton "Voir plus".
  useEffect(() => {
    const el = ref.current
    if (!el) return
    setNeedsToggle(el.scrollHeight > el.clientHeight + 1)
  }, [text])

  const clampStyle: React.CSSProperties = expanded
    ? {}
    : {
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 3,
        overflow: 'hidden',
      }

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        ref={ref}
        style={{
          color: '#888',
          fontSize: 12,
          lineHeight: 1.5,
          ...clampStyle,
        }}
      >
        {text}
      </div>

      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            marginTop: 4,
            color: OR,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {expanded ? 'Voir moins' : 'Voir plus'}
          <span style={{ fontSize: 9 }}>{expanded ? '\u25B2' : '\u25BC'}</span>
        </button>
      )}
    </div>
  )
}
