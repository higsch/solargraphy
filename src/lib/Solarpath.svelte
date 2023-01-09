<script>
  import { scaleLinear, extent } from 'd3';

  import { getSunPosition } from '$lib/solar';

  export let dayOfYear;
  export let lat;
  export let lon;
  export let deltaGMT;
  export let xScale;
  export let yScale;
  export let radiation;
  export let radiationRange;

  const deltaMinutes = 5;
  const dayMinutes = 24 * 60;

  $: radiationScale = scaleLinear()
    .domain([radiationRange[0], radiationRange[1] / 2, radiationRange[1]])
    .range([0.8, 0.1, 0]);

  $: emptyPoints = Array.from({length: dayMinutes / deltaMinutes + 1})
    .map((_, i) => ({minute: i * deltaMinutes}));

  $: points = emptyPoints.map(d => {
    const localTime = d.minute / 60;
    const [ elevation, azimuth ] = getSunPosition({
      dayOfYear,
      localTime,
      deltaGMT,
      lat,
      lon
    });
    return {
      ...d,
      hour: localTime,
      azimuth,
      elevation,
      x: xScale(azimuth),
      y: yScale(elevation)
    };
  });

  $: singlePath = points.map((d, i) => {
    return `${i === 0 ? 'M' : 'L'}${d.x} ${d.y}`;
  }).join('');

  $: paths = radiation.map((r, i) => {
    const selectedPoints = points.filter(p => r.startHours <= p.hour && r.endHours >= p.hour);
    const path = selectedPoints.map((d, i) => {
      return `${i === 0 ? 'M' : 'L'}${d.x} ${d.y}`;
    }).join('');
    return {
      id: i,
      path,
      opacity: radiationScale(r.radiation),
      points: selectedPoints
    };
  });
</script>

<g class="solarpath">
  <path
    d={singlePath}
    fill="none"
    stroke="#b7c9bb"
    stroke-width="4"
    stroke-opacity="0.4"
  />
  {#each paths as { id, path, opacity } (id)}
    <path
      d={path}
      fill="none"
      stroke="#09003d"
      stroke-width="4"
      stroke-opacity={opacity}
      stroke-linecap="butt"
    />
  {/each}
</g>