<script>
  import { getContext, onMount, onDestroy, afterUpdate } from 'svelte';
  import { max, scaleLinear, scalePow, interpolateHcl } from 'd3';

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
  export let lineWidth;
  export let contextName = 'canvas';

  const { register, deregister, invalidate } = getContext(contextName);

  const deltaMinutes = 1;
  const dayMinutes = 24 * 60;

  function draw(ctx) {
    paths.forEach(({color, points}) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      // const p = new Path2D(path);
      // ctx.stroke(p);

      ctx.beginPath();
      points.forEach((p, i) => {
        // console.log(p)
        if (i === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.stroke();
    });
  }

  onMount(() => {
    register(draw);
    invalidate();
    
    return () => {
      deregister(draw);
    };
  });
  
  afterUpdate(invalidate);
  onDestroy(invalidate);

  $: localRadiationRange = [0, max(radiation, d => d.radiation)];

  $: colorScale = scalePow()
    .exponent(1)
    // .domain(localRadiationRange)
    .domain(radiationRange)
    .range([backgroundColor, foregroundColor]);
    // .interpolate(interpolateHcl);

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

  $: singlePath = points.map((d, i) => {
    return `${i === 0 ? 'M' : 'L'}${d.x} ${d.y}`;
  }).join('');

  $: paths = radiation.map((r, i) => {
    const selectedPoints = points.filter(p => r.startHour - deltaMinutes / 120 <= p.hour && r.endHour + deltaMinutes / 120 >= p.hour);
    const path = selectedPoints.map((d, i) => {
      return `${i === 0 ? 'M' : 'L'}${d.x} ${d.y}`;
    }).join('');
    return {
      id: i,
      path,
      // opacity: opacityScale(r.radiation),
      color: colorScale(r.radiation),
      points: selectedPoints
    };
  });
</script>