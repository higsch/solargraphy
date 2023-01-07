<script>
  import { scaleLinear } from 'd3';

  import { getSunPosition } from '$lib/solar';

  export let dayOfYear;
  export let lat;
  export let lon;
  export let deltaGMT;
  export let xScale;
  export let yScale;
  export let clouds;

  const deltaMinutes = 1;
  const dayMinutes = 24 * 60;

  const cloudScale = scaleLinear()
    .domain([0, 8])
    .range([0, 0.3]);

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

  $: paths = clouds.map((c, i, arr) => {
    const selectedPoints = points.filter(p => c.start <= p.hour && c.end > p.hour);
    const path = selectedPoints.map((d, i) => {
      return `${i === 0 ? 'M' : 'L'}${d.x} ${d.y}`;
    }).join('');
    // const { cloudcover: previousCloudCover } = arr[i - 1] || {};
    // const { cloudcover: nextCloudCover } = arr[i + 1] || {};
    return {
      id: i,
      path,
      opacity: cloudScale(c.cloudcover),
      points: selectedPoints
    };
  }).map((d, i, arr) => {
    const link = arr[i + 1] ? `L${arr[i + 1].points[0].x} ${arr[i + 1].points[0].y}` : '';
    return {
      ...d,
      path: `${d.path}${link}`
    };
  });
</script>

<g class="solarpath">
  <path
    d={singlePath}
    fill="none"
    stroke="#e8e04d"
    stroke-width="3"
    stroke-opacity="0.4"
  />
  {#each paths as { id, path, opacity } (id)}
    <path
      d={path}
      fill="none"
      stroke="#09003d"
      stroke-width="3"
      stroke-opacity={opacity}
    />
  {/each}
</g>