<script>
  import { scaleLinear, scalePow, interpolateHcl } from 'd3';

  import { getSunPosition } from '$lib/solar';

  export let dayOfYear;
  export let lat;
  export let lon;
  export let deltaGMT;
  export let xScale;
  export let yScale;
  export let radiation;
  export let radiationRange;
  export let foregroundColor;
  export let backgroundColor;

  const deltaMinutes = 1;
  const dayMinutes = 24 * 60;

  $: opacityScale = scaleLinear()
    .domain([radiationRange[0], radiationRange[1] / 5, radiationRange[1]])
    .range([1, 0.1, 0]);

  $: colorScale = scalePow()
    .exponent(0.6)
    .domain([radiationRange[0], radiationRange[1]])
    .range([backgroundColor, foregroundColor])
    .interpolate(interpolateHcl);

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
  }).filter(d => d.hour < 27);

  // $: singlePath = points.map((d, i) => {
  //   return `${i === 0 ? 'M' : 'L'}${d.x} ${d.y}`;
  // }).join('');

  $: paths = radiation.map((r, i) => {
    const selectedPoints = points.filter(p => r.startHour <= p.hour && r.endHour >= p.hour);
    const path = selectedPoints.map((d, i) => {
      return `${i === 0 ? 'M' : 'L'}${d.x} ${d.y}`;
    }).join('');
    return {
      id: i,
      path,
      opacity: opacityScale(r.radiation),
      color: colorScale(r.radiation),
      points: selectedPoints
    };
  });
</script>

<g class="solarpath">
<!-- <g class="solarpath" filter="url(#noise)"> -->
  <!-- <path
    d={singlePath}
    fill="none"
    stroke="#edf6f9"
    stroke-width="3.5"
    stroke-opacity="0.8"
  /> -->
  {#each paths as { id, path, color } (id)}
    <path
      d={path}
      fill="none"
      stroke={color}
      stroke-width="4"
      stroke-opacity="1.0"
      stroke-linecap="round"
    />
  {/each}
</g>