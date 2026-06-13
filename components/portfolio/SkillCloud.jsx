"use client"

import { useEffect, useRef, useState } from "react"
import { skills } from "@/data/portfolio/skills"

const MAX_TRIES = 50
const PADDING = 10
const DESIGN_WIDTH = 1920

const clamp = (val, min, max) => Math.min(Math.max(val, min), max)


export default function SkillsCloud() {
  const containerRef = useRef(null)
  const [positions, setPositions] = useState([])

  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (containerWidth === 0) return

    const container = containerRef.current
    if (!container) return

    const placed = []

    // viewport-based scale (relative to 1920)
    const screenScale = clamp(window.innerWidth / DESIGN_WIDTH, 0.6, 1)

    skills.forEach(skill => {
      // BASE values tuned for 1920
      const baseFontMin = 12
      const baseFontRange = 24
      const baseOpacityMin = 0.35
      const baseOpacityRange = 0.65

      // level influence
      const levelRatio = (skill.level - 1) / 9

      // scaled font size
      const fontSize =
        (baseFontMin + levelRatio * baseFontRange) * screenScale

      // scaled opacity (subtle on small screens)
      const opacity = clamp(
        baseOpacityMin + levelRatio * baseOpacityRange * screenScale,
        0.25,
        1
      )

      const temp = document.createElement("span")
      temp.className = "portfolio-skill"
      temp.style.fontSize = `${fontSize}px`
      temp.style.opacity = opacity
      temp.style.position = "absolute"
      temp.style.visibility = "hidden"
      temp.textContent = skill.name

      container.appendChild(temp)
      const rect = temp.getBoundingClientRect()
      container.removeChild(temp)

      let placedSuccessfully = false

      const maxRangeX = containerWidth - rect.width
      const containerHeight = 320
      const maxRangeY = containerHeight - rect.height

      for (let i = 0; i < MAX_TRIES; i++) {
        const x = maxRangeX > 0 ? Math.random() * maxRangeX : 0
        const y = maxRangeY > 0 ? Math.random() * maxRangeY : 0

        const overlaps = placed.some(p =>
          x < p.x + p.width + PADDING &&
          x + rect.width + PADDING > p.x &&
          y < p.y + p.height + PADDING &&
          y + rect.height + PADDING > p.y
        )

        if (!overlaps) {
          placed.push({
            name: skill.name,
            level: skill.level,
            x,
            y,
            fontSize,
            opacity,
            width: rect.width,
            height: rect.height,
          })
          placedSuccessfully = true
          break
        }
      }

      if (!placedSuccessfully) {
        placed.push({
          name: skill.name,
          level: skill.level,
          x: 0,
          y: placed.length * 32 * screenScale,
          fontSize,
          opacity,
          width: rect.width,
          height: rect.height,
        })
      }
    })

    setPositions(placed)
  }, [containerWidth])


  return (
    <section id="portfolio-skills" className="portfolio-section">
      <h1 className="portfolio-section-title">Skills</h1>

      <div ref={containerRef} className="portfolio-skills">
        {positions.map((p, i) => (
          <span
            key={i}
            className="portfolio-skill"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              fontSize: `${p.fontSize}px`,
              opacity: p.opacity,
              zIndex: p.level,
            }}
          >
            {p.name}
          </span>
        ))}
      </div>
    </section>
  )
}
