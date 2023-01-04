<script>
  import { getDayOfYear, getSunPosition } from '$lib/solar';

  export let date;
  export let lat;
  export let lon;
  export let deltaGMT;
  export let xScale;
  export let yScale;
  export let clouds;

  const deltaMinutes = 5;
  const dayMinutes = 24 * 60;

  let cloudPoints = [];

  $: dayOfYear = getDayOfYear(date);

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

  $: {
    const p = [];
    const cPoints = points.map(point => {
      const cloud = clouds.filter(d => point.minute >= d.acc_minutes_start && point.minute < d.acc_minutes_end);
      return {
        ...point, 
        cloud
      };
    });
    console.log(cPoints);
  }

  $: path = points.map((d, i) => {
    return `${i === 0 ? 'M' : 'L'}${d.x} ${d.y}`;
  }).join('');

  $: console.log(clouds);
</script>

<g class="solarpath">
  <path
    d={path}
    fill="none"
    stroke="#e8e04d"
    stroke-width="3"
    stroke-opacity="0.3"
  />
</g>