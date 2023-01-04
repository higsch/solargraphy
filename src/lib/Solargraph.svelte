<script>
  import { scaleLinear } from 'd3';

  import { addDays } from '$lib/solar';

  import Solarpath from '$lib/Solarpath.svelte';

  export let startDate;
  export let numDays;
  export let clouds;

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
    });
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
      {#each dateArray as date (date)}
        {@const currentMs = date.getTime()}
        {@const nextDayMs = date.getTime() + 24 * 60 * 60 * 1000}
        <Solarpath
          date={date}
          lat={lat}
          lon={lon}
          deltaGMT={deltaGMT}
          xScale={xScale}
          yScale={yScale}
          clouds={clouds.filter(d => d.ms >= currentMs && d.ms < nextDayMs)}
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