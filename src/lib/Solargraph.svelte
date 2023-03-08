<script>
  import { groups, scaleLinear, max } from 'd3';

  import { addDays, getDayOfYear } from '$lib/solar';

  import Solarpath from '$lib/Solarpath.svelte';
  import SolarpathCanvas from '$lib/SolarpathCanvas.svelte';
  import Canvas from './Canvas.svelte';

  export let startDate;
  export let numDays;
  export let radiation;
  export let foregroundColor = '#C3C7C0';
  export let backgroundColor = '#063959';

  // Hamburg
  // const lat = 53.45;
  // const lon = 9.94;
  // const deltaGMT = 1;

  // Lilienthal
  const lat = 53.13333;
  const lon = 8.91667;
  const deltaGMT = 1;

  let width, height;

  $: xScale = scaleLinear()
    .domain([0, 360])
    .range([0, width]);

  $: yScale = scaleLinear()
    .domain([0, 90])
    .range([height, 0]);

  $: dateArray = Array.from({length: numDays})
    .map((_, i) => {
      return addDays(startDate, i);
    })
    .map(d => {
      return getDayOfYear(d);
    });

  $: radiationExtended = groups(radiation, d => d.dayOfYear).map(d => {
    return {
      dayOfYear: d[0],
      data: d[1]
    };
  }).map(d => {
    const { data } = d;
    const spanData = data.map((dd, i, arr) => {
      const startHour = arr[i - 1] ? arr[i - 1].hour : null;
      const endHour = dd.hour;
      return {
        ...dd,
        startHour,
        endHour
      };
    });
    return {
      ...d,
      data: spanData
    }
  });

  $: radiationExtendedDoubled = radiationExtended.map((d, i, arr) => {
    const { data } = d;
    const { data: nextDayData = [] } = arr[i + 1] || {};
    const firstNextDatum = nextDayData[0];
    return {
      ...d,
      data: [...data, {
        ...firstNextDatum,
        startHour: 23 + 50 / 60,
        endHour: 24
      }].filter(d => d.startHour !== null)
    };
  }).map(d => {
    const { data } = d;
    const dataReduced = [];
    let { startHour } = data[0];
    let { radiation: nextRadiation = -1 } = data[1] || {};
    data.forEach((dd, i, arr) => {
      if (dd.radiation !== nextRadiation || dd.endHour === 24) {
        dataReduced.push({
          ...dd,
          startHour
        });
        startHour = arr[i + 1] ? arr[i + 1].startHour : null;
      }
    });
    return {
      ...d,
      data: dataReduced
    };
  });

  $: radiationRange = [0, max(radiationExtendedDoubled.map(d => d.data).flat(), d => d.radiation)];
</script>

<div
  class="solargraph"
  bind:clientWidth={width}
  bind:clientHeight={height}
>
  {#if (width && height)}
    <Canvas
      width={width}
      height={height}
      pixelRatio="4"
    >
      {#each dateArray as dayOfYear (dayOfYear)}
        <SolarpathCanvas
          dayOfYear={dayOfYear}
          lat={lat}
          lon={lon}
          deltaGMT={deltaGMT}
          xScale={xScale}
          yScale={yScale}
          radiation={radiationExtendedDoubled.find(d => d.dayOfYear === dayOfYear).data}
          radiationRange={radiationRange}
          foregroundColor={foregroundColor}
          backgroundColor={backgroundColor}
          lineWidth="2"
        />
      {/each}
    </Canvas>
  {/if}
</div>

<style>
  .solargraph {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>