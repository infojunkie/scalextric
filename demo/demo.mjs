import * as d3 from 'https://cdn.jsdelivr.net/npm/d3/+esm'
import {
  Tuning,
  tuningFromScala
} from './build/scalextric.js'

const Modes = {
  CENTS: Symbol('cents'),
  SAVARTS: Symbol('savarts'),
  DECIMAL: Symbol('decimal'),
  FRACTION: Symbol('fraction'),
  ORIGINAL: Symbol('original'),
}

const mode = Modes.ORIGINAL

renderTuning(Tuning.fromEdo(12))
renderTuning(Tuning.fromEdo(24))
renderTuning(tuningFromScala(await (await fetch('data/rast.ascl')).text()))
renderTuning(tuningFromScala(await (await fetch('data/partch.ascl')).text()))

function renderTuning(tuning) {
  const width = document.getElementById('tunings').clientWidth

  const ticks = tuning.intervals.map(i => i.cents)

  const scale = d3.scaleLinear()
    .domain([ticks[0], ticks[ticks.length-1]])
    .range([20, width - 20])

  const svg = d3.create("svg")
    .attr("viewBox", [0, -7, width, 26])

  svg.append("g")
    .call(d3.axisBottom(scale).tickValues(ticks).tickFormat((d, i) => {
      switch (mode) {
        case Modes.CENTS:
        case Modes.DECIMAL:
        case Modes.SAVARTS:
          return d.toLocaleString()
        case Modes.FRACTION:
          return tuning.intervals[i].ratio.toFraction()
        case Modes.ORIGINAL:
          return tuning.intervals[i].original
      }
    }))

  const entry = document.querySelector('#tuning').content.cloneNode(true)
  entry.querySelector('.title').textContent = tuning.metadata.name
  entry.querySelector('.scale').appendChild(svg.node())
  document.getElementById('tunings').appendChild(entry)
}
