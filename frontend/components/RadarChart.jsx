'use client'
import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js'
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)
export default function RadarChart({ labels=[], values=[] }){
  const data = { labels, datasets: [{ label: 'Component scores', data: values, fill: true, tension: 0.3, borderWidth: 2 }] }
  const options = { scales: { r: { suggestedMin: 0, suggestedMax: 100 } }, maintainAspectRatio: false }
  return <div style={{height:250}}><Radar data={data} options={options} /></div>
}

