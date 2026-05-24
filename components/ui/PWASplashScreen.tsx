'use client'

import { useEffect, useState } from 'react'

export function PWASplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fading,  setFading]  = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('hmp-splash-shown')) return
    sessionStorage.setItem('hmp-splash-shown', '1')
    setVisible(true)

    const fadeTimer = setTimeout(() => setFading(true),  1400)
    const hideTimer = setTimeout(() => setVisible(false), 2050)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         9999,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        background:     'linear-gradient(180deg, #980B0A 0%, #6B0606 100%)',
        opacity:        fading ? 0 : 1,
        transition:     'opacity 0.65s ease',
        pointerEvents:  fading ? 'none' : 'auto',
      }}
    >
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            '20px',
        padding:        '40px',
      }}>

        {/* Glow + logo stack */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

          {/* Ambient radial glow behind the logo */}
          <div style={{
            position:     'absolute',
            width:        '200px',
            height:       '200px',
            borderRadius: '50%',
            background:   'radial-gradient(circle, rgba(255,180,80,0.26) 0%, rgba(255,100,40,0.09) 50%, transparent 72%)',
            filter:       'blur(22px)',
            pointerEvents:'none',
          }} />

          {/* Ground shadow */}
          <div style={{
            position:     'absolute',
            bottom:       '-14px',
            left:         '50%',
            transform:    'translateX(-50%)',
            width:        '90px',
            height:       '14px',
            borderRadius: '50%',
            background:   'rgba(0,0,0,0.30)',
            filter:       'blur(10px)',
            pointerEvents:'none',
          }} />

          {/*
            Padded container: outer 144×144px, 16px padding each side
            → 112×112px usable area for the logo
            objectFit: contain inside a square container ensures:
              - Full icon-192.svg (192×192 square) is always visible
              - Logo is centred perfectly
              - No edge clipping from any side
          */}
          <div style={{
            position:       'relative',
            width:          '144px',
            height:         '144px',
            padding:        '16px',
            boxSizing:      'border-box',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            zIndex:         1,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-192.svg"
              alt="HMP Masala"
              style={{
                display:   'block',
                width:     '100%',
                height:    '100%',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>

        {/* Brand text */}
        <div style={{ textAlign: 'center', userSelect: 'none' }}>
          <p style={{
            margin:        0,
            color:         'rgba(255,255,255,0.97)',
            fontWeight:    700,
            fontSize:      'clamp(18px, 5vw, 22px)',
            letterSpacing: '-0.01em',
            lineHeight:    1.2,
          }}>
            HMP Masala
          </p>
          <p style={{
            margin:        '5px 0 0',
            color:         'rgba(255,205,115,0.82)',
            fontSize:      'clamp(11px, 3.5vw, 13px)',
            fontWeight:    400,
            letterSpacing: '0.01em',
          }}>
            Pure Spices. Family Recipe.
          </p>
        </div>
      </div>
    </div>
  )
}
