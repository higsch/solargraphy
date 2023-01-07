<script>
  import { groups, scaleLinear } from 'd3';

  import { addDays, getDayOfYear } from '$lib/solar';

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
    })
    .map(d => {
      return getDayOfYear(d);
    });

  $: cloudsExtended = groups(clouds, d => d.dayOfYear).map(d => {
    const data = d[1];
    const parsedData = data.map(dd => {
      return {
        date: dd.date,
        cloudcover: dd.cloudcover,
        hour: dd.hour,
        hours: dd.hour + dd.minute / 60
      };
    });
    return {
      dayOfYear: d[0],
      data: parsedData
    };
  }).map((d, i, arr) => {
    const { data } = d;
    const extendedData = [];
    data.forEach(dd => {
      if (dd.hour === 0 && dd.hours !== 0 && arr[i - 1]) {
        const { data: previousData } = arr[i - 1];
        extendedData.push({
          ...previousData.slice(-1)[0],
          hours: 0
        });
      }
      extendedData.push(dd);
      if (dd.hour === 23 && dd.hours !== 24 && arr[i + 1]) {
        const { data: nextData } = arr[i + 1];
        extendedData.push({
          ...nextData[0],
          hours: 24
        });
      }
    });
    return {
      ...d,
      data: extendedData
    }
  }).map(d => {
    const { data } = d;
    const spanData = data.map((dd, i, arr) => {
      const startHours = dd.hours;
      const endHours = arr[i + 1] ? arr[i + 1].hours : null;
      return {
        ...dd,
        startHours,
        endHours
      };
    }).filter(dd => dd.endHours !== null);
    return {
      ...d,
      data: spanData
    }
  });

  $: cloudsReduced = cloudsExtended.map(d => {
    const { data } = d;
    const reduced = [];
    let {
      cloudcover: previousCloudCover,
      startHours: start
    } = data[0];
    data.forEach((dd, i, arr) => {
      if (dd.cloudcover !== previousCloudCover || i === arr.length - 1) {
        reduced.push({
          cloudcover: previousCloudCover,
          start: start,
          end: dd.endHours
        });
        start = dd.endHours;
      }
      previousCloudCover = dd.cloudcover;
    });
    return {
      ...d,
      data: reduced
    };
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
      {#each dateArray as dayOfYear (dayOfYear)}
        <Solarpath
          dayOfYear={dayOfYear}
          lat={lat}
          lon={lon}
          deltaGMT={deltaGMT}
          xScale={xScale}
          yScale={yScale}
          clouds={cloudsReduced.find(d => d.dayOfYear === dayOfYear).data}
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