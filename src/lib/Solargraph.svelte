<script>
  import { groups, scaleLinear, max } from 'd3';

  import { addDays, getDayOfYear } from '$lib/solar';

  import Solarpath from '$lib/Solarpath.svelte';

  export let startDate;
  export let numDays;
  export let radiation;

  // Hamburg
  const lat = 53.45;
  const lon = 9.94;
  const deltaGMT = 1;

  // Solna
  // const lat = 59.38;
  // const lon = 18.03;
  // const deltaGMT = 1;

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
    const data = d[1];
    const parsedData = data.map(dd => {
      return {
        date: dd.date,
        radiation: dd.global_radiation,
        hour: dd.hour,
        hours: dd.hour + dd.minute / 60
      };
    });
    return {
      dayOfYear: d[0],
      data: parsedData
    };
  }).map(d => {
    const { data } = d;
    const spanData = data.map((dd, i, arr) => {
      const startHours = arr[i - 1] ? arr[i - 1].hours : null;
      const endHours = dd.hours;
      return {
        ...dd,
        startHours,
        endHours
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
        startHours: 23 + 50 / 60,
        endHours: 24
      }].filter(d => d.startHours !== null)
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
    <svg
      width={width}
      height={height}
      style:background="#09003d"
    >
      {#each dateArray as dayOfYear (dayOfYear)}
        <Solarpath
          dayOfYear={dayOfYear}
          lat={lat}
          lon={lon}
          deltaGMT={deltaGMT}
          xScale={xScale}
          yScale={yScale}
          radiation={radiationExtendedDoubled.find(d => d.dayOfYear === dayOfYear).data}
          radiationRange={radiationRange}
        />
      {/each}
    </svg>
  {/if}
</div>

<style>
  .solargraph {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>