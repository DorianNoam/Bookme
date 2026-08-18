'use client'

import React, { useState } from 'react'

const NOIR = '#0A0A0A'
const OR = '#B8922A'
const CHART_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#4a3aa7', '#008300', '#e34948']
const MOIS_SHORT = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec']
const MOIS_FULL = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre']

type MonthData = {
  ca: number
  rdvCount: number
  topServices: { name: string; count: number; revenue: number }[]
}

type ServiceData = {
  name: string
  count: number
  revenue: number
  pct: number
}

type Props = {
  monthlyData: MonthData[]
  servicesData: ServiceData[]
  currentMonth: number
  currentYear: number
  totalCaYear: number
  totalServicesMonth: number
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  if (endAngle - startAngle >= 359.99) endAngle = startAngle + 359.99
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

export default function DashboardCharts({ monthlyData, servicesData, currentMonth, currentYear, totalCaYear, totalServicesMonth }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [selectedService, setSelectedService] = useState<number | null>(null)

  const maxCaMonth = Math.max(...monthlyData.map(m => m.ca), 1)

  // Calculer les arcs du camembert
  let currentAngle = 0
  const pieSlices = servicesData.map((s, i) => {
    const angle = (s.pct / 100) * 360
    const slice = {
      ...s,
      color: CHART_COLORS[i % CHART_COLORS.length],
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    }
    currentAngle += angle
    return slice
  })

  function handleBarClick(monthIndex: number) {
    if (monthlyData[monthIndex].ca === 0 && monthlyData[monthIndex].rdvCount === 0) return
    setSelectedMonth(selectedMonth === monthIndex ? null : monthIndex)
    setSelectedService(null)
  }

  function handleSliceClick(serviceIndex: number) {
    setSelectedService(selectedService === serviceIndex ? null : serviceIndex)
    setSelectedMonth(null)
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
      gap: 16
    }}>

      {/* ═══ CA ANNUEL EN BARRES ═══ */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(16px, 3vw, 25px)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: NOIR, marginBottom: 4, marginTop: 0 }}>
          Chiffre d{"'"}affaires {currentYear}
        </h3>
        <p style={{ fontSize: 12, color: '#888', marginTop: 0, marginBottom: 20 }}>
          Total : <strong style={{ color: NOIR }}>{totalCaYear.toLocaleString()} DA</strong>
          <span style={{ color: '#aaa', marginLeft: 8, fontSize: 11 }}>Cliquez sur une barre pour les details</span>
        </p>

        {monthlyData.every(m => m.ca === 0) ? (
          <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center', padding: '30px 0' }}>Aucune donnee pour cette annee.</p>
        ) : (
          <div>
            <svg viewBox="0 0 480 200" style={{ width: '100%', height: 'auto', cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg">
              {monthlyData.map((month, i) => {
                const barWidth = 28
                const gap = (480 - 12 * barWidth) / 13
                const x = gap + i * (barWidth + gap)
                const maxH = 150
                const h = maxCaMonth > 0 ? (month.ca / maxCaMonth) * maxH : 0
                const y = 10 + maxH - h
                const isCurrentMonth = i === currentMonth
                const isSelected = selectedMonth === i
                const hasData = month.ca > 0 || month.rdvCount > 0

                return (
                  <g key={i} onClick={() => handleBarClick(i)} style={{ cursor: hasData ? 'pointer' : 'default' }}>
                    {/* Barre de fond */}
                    <rect x={x} y={10} width={barWidth} height={maxH} rx={4} fill="#f0f0f0" />
                    {/* Barre de valeur */}
                    {h > 0 && (
                      <rect x={x} y={y} width={barWidth} height={h} rx={4}
                        fill={isSelected ? '#1a5fa0' : isCurrentMonth ? '#2a78d6' : '#c0c0c0'}
                        style={{ transition: 'fill 0.2s' }}
                      />
                    )}
                    {/* Indicateur de selection */}
                    {isSelected && (
                      <rect x={x - 2} y={y - 2} width={barWidth + 4} height={h + 4} rx={5}
                        fill="none" stroke="#2a78d6" strokeWidth={2} strokeDasharray="none"
                      />
                    )}
                    {/* Valeur au-dessus */}
                    {month.ca > 0 && (
                      <text x={x + barWidth / 2} y={y - 6} textAnchor="middle"
                        fontSize="7" fontWeight="700" fill={isSelected || isCurrentMonth ? '#2a78d6' : '#999'}
                      >
                        {month.ca >= 1000 ? `${Math.round(month.ca / 1000)}k` : month.ca}
                      </text>
                    )}
                    {/* Label mois */}
                    <text x={x + barWidth / 2} y={175} textAnchor="middle"
                      fontSize="8" fontWeight={isCurrentMonth || isSelected ? '800' : '600'}
                      fill={isSelected ? '#2a78d6' : isCurrentMonth ? '#2a78d6' : '#888'}
                    >
                      {MOIS_SHORT[i]}
                    </text>
                    {/* Point sous le mois courant */}
                    {isCurrentMonth && (
                      <circle cx={x + barWidth / 2} cy={182} r={2} fill="#2a78d6" />
                    )}
                  </g>
                )
              })}
            </svg>

            {/* PANNEAU DETAIL DU MOIS SELECTIONNE */}
            {selectedMonth !== null && (
              <div style={{
                marginTop: 16,
                padding: 18,
                background: '#f8f9fb',
                borderRadius: 8,
                border: '1px solid #d6e3f5',
                animation: 'fadeIn 0.2s ease'
              }}>
                <style dangerouslySetInnerHTML={{__html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: NOIR }}>{MOIS_FULL[selectedMonth]} {currentYear}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {monthlyData[selectedMonth].rdvCount} RDV confirme{monthlyData[selectedMonth].rdvCount > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#2a78d6' }}>
                      {monthlyData[selectedMonth].ca.toLocaleString()} DA
                    </div>
                  </div>
                </div>

                {monthlyData[selectedMonth].topServices.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>Prestations du mois</div>
                    {monthlyData[selectedMonth].topServices.map((s, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '6px 0', borderBottom: i < monthlyData[selectedMonth].topServices.length - 1 ? '1px solid #e8edf3' : 'none',
                        fontSize: 13
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ color: '#2a78d6', fontWeight: 800, fontSize: 12 }}>{s.count}x</span>
                          <span style={{ color: NOIR, fontWeight: 600 }}>{s.name}</span>
                        </div>
                        <span style={{ color: '#888', fontWeight: 600, fontSize: 12 }}>{s.revenue.toLocaleString()} DA</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setSelectedMonth(null)}
                  style={{ marginTop: 12, background: 'none', border: '1px solid #ccc', padding: '6px 14px', borderRadius: 4, fontSize: 12, color: '#888', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ CAMEMBERT PRESTATIONS ═══ */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 'clamp(16px, 3vw, 25px)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: NOIR, marginBottom: 4, marginTop: 0 }}>Repartition des prestations</h3>
        <p style={{ fontSize: 12, color: '#888', marginTop: 0, marginBottom: 20 }}>
          {totalServicesMonth} prestation{totalServicesMonth > 1 ? 's' : ''} ce mois
          <span style={{ color: '#aaa', marginLeft: 8, fontSize: 11 }}>Cliquez sur une part</span>
        </p>

        {pieSlices.length === 0 ? (
          <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center', padding: '30px 0' }}>Aucune prestation ce mois-ci.</p>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* SVG Camembert */}
              <svg viewBox="0 0 200 200" style={{ width: 160, height: 160, flexShrink: 0, cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg">
                {pieSlices.length === 1 ? (
                  <circle cx={100} cy={100} r={90} fill={pieSlices[0].color}
                    onClick={() => handleSliceClick(0)}
                    style={{ cursor: 'pointer' }}
                    opacity={selectedService === 0 ? 1 : 0.85}
                  />
                ) : (
                  pieSlices.map((slice, i) => {
                    const path = describeArc(100, 100, selectedService === i ? 94 : 90, slice.startAngle, slice.endAngle)
                    return (
                      <path key={i} d={path} fill={slice.color} stroke="#fff" strokeWidth={2}
                        onClick={() => handleSliceClick(i)}
                        style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                        opacity={selectedService !== null && selectedService !== i ? 0.4 : 1}
                      />
                    )
                  })
                )}
                {/* Centre donut */}
                <circle cx={100} cy={100} r={50} fill="#fff" />
                <text x={100} y={96} textAnchor="middle" fontSize="18" fontWeight="900" fill={NOIR}>
                  {totalServicesMonth}
                </text>
                <text x={100} y={112} textAnchor="middle" fontSize="9" fontWeight="600" fill="#888">
                  RDV
                </text>
              </svg>

              {/* Legende */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '1 1 140px', minWidth: 0 }}>
                {pieSlices.slice(0, 6).map((slice, i) => (
                  <div key={i}
                    onClick={() => handleSliceClick(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                      padding: '4px 6px', borderRadius: 4,
                      background: selectedService === i ? '#f0f4fa' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{
                      width: 10, height: 10, borderRadius: 2, flexShrink: 0,
                      background: slice.color,
                      opacity: selectedService !== null && selectedService !== i ? 0.4 : 1,
                    }} />
                    <span style={{
                      fontSize: 12, color: NOIR, fontWeight: selectedService === i ? 700 : 600,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                    }}>
                      {slice.name}
                    </span>
                    <span style={{ fontSize: 11, color: '#888', fontWeight: 700, flexShrink: 0 }}>
                      {slice.pct}%
                    </span>
                  </div>
                ))}
                {pieSlices.length > 6 && (
                  <span style={{ fontSize: 11, color: '#aaa', fontStyle: 'italic', paddingLeft: 6 }}>
                    +{pieSlices.length - 6} autre{pieSlices.length - 6 > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* PANNEAU DETAIL DE LA PRESTATION SELECTIONNEE */}
            {selectedService !== null && pieSlices[selectedService] && (
              <div style={{
                marginTop: 16,
                padding: 18,
                background: '#f8f9fb',
                borderRadius: 8,
                border: `1px solid ${pieSlices[selectedService].color}30`,
                animation: 'fadeInPie 0.2s ease'
              }}>
                <style dangerouslySetInnerHTML={{__html: `@keyframes fadeInPie { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }`}} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: 3,
                    background: pieSlices[selectedService].color
                  }} />
                  <span style={{ fontSize: 16, fontWeight: 800, color: NOIR }}>
                    {pieSlices[selectedService].name}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                  <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Part</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: pieSlices[selectedService].color }}>{pieSlices[selectedService].pct}%</div>
                  </div>
                  <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Reservations</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: NOIR }}>{pieSlices[selectedService].count}</div>
                  </div>
                  <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>CA genere</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#2e7d32' }}>{servicesData[selectedService].revenue.toLocaleString()} DA</div>
                  </div>
                  <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: '#888', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Prix moyen</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: NOIR }}>
                      {servicesData[selectedService].count > 0
                        ? Math.round(servicesData[selectedService].revenue / servicesData[selectedService].count).toLocaleString()
                        : 0
                      } DA
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedService(null)}
                  style={{ marginTop: 12, background: 'none', border: '1px solid #ccc', padding: '6px 14px', borderRadius: 4, fontSize: 12, color: '#888', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
