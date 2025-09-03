import * as d3 from 'https://cdn.jsdelivr.net/npm/d3/+esm'
import { Synthetizer } from './node_modules/spessasynth_lib/index.js'
import {
  Tuning,
  Interval,
  tuningFromScala,
  solmizationFromAbleton
} from './build/scalextric.mjs'

const Modes = {
  CENTS: 'cents',
  FRACTION: 'fraction',
  ORIGINAL: 'original',
}

const g_state = {
  context: new AudioContext(),
  mode: Modes.ORIGINAL,
  synth: null,
  reference: null
}

document.addEventListener('DOMContentLoaded', async () => {
  await g_state.context.audioWorklet.addModule('./node_modules/spessasynth_lib/synthetizer/worklet_processor.min.js')
  g_state.synth = new Synthetizer(g_state.context.destination, await (await fetch('data/GeneralUserGS.sf3')).arrayBuffer())
  g_state.reference = solmizationFromAbleton(await (await fetch('data/12edo.ascl')).text())

  document.querySelectorAll('input[name="scale"]').forEach(input => {
    input.addEventListener('change', async (e) => {
      g_state.mode = e.target.value
      renderTunings()
    })
    if (input.value === g_state.mode) {
      input.setAttribute('checked', 'checked')
    }
  })

  // Draw
  renderTunings()
})

async function renderTunings() {
  document.getElementById('tunings').innerText = ''

  renderTuning(Tuning.fromEdo(12))
  renderTuning(Tuning.fromEdo(24))
  renderTuning(tuningFromScala(await (await fetch('data/rast.ascl')).text()))
  renderTuning(tuningFromScala(await (await fetch('data/partch.ascl')).text()))
}

function renderTuning(tuning) {
  const width = document.getElementById('tunings').clientWidth

  const ticks = tuning.intervals.map(i => i.cents)

  const scale = d3.scaleLinear()
    .domain([ticks[0], ticks[ticks.length-1]])
    .range([20, width - 20])

  const svg = d3.create("svg")
    .attr("viewBox", [0, -7, width, 100])

  svg.append("g")
    .call(d3.axisBottom(scale).tickValues(ticks).tickFormat((d, i) => {
      switch (g_state.mode) {
        case Modes.CENTS:
          return Number(tuning.intervals[i].cents).toFixed(2)
        case Modes.FRACTION:
          return tuning.intervals[i].ratio.toFraction()
        case Modes.ORIGINAL:
          return tuning.intervals[i].original
      }
    }))
    .selectAll('.tick text')
    .attr('y', 0)
    .attr('x', 9)
    .attr('dy', '.35em')
    .attr('transform', 'rotate(90)')
    .style('text-anchor', 'start')
    .style('cursor', 'pointer')
    .attr('data-cents', (_, i) => tuning.intervals[i].cents)
    .on('click', e => {
      const { tone, interval, difference } = g_state.reference.tuning.nearest(Interval.fromCents(e.target.dataset.cents))
      console.log(tone, g_state.reference.name(tone), interval, difference)
    })

  const entry = document.querySelector('#tuning').content.cloneNode(true)
  entry.querySelector('.title').textContent = tuning.metadata.name
  entry.querySelector('.scale').appendChild(svg.node())
  document.getElementById('tunings').appendChild(entry)
}
