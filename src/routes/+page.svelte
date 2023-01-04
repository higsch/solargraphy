<script>
  import Solargraph from '$lib/Solargraph.svelte';

  export let data = {};

  $: ({ clouds } = data);
</script>

<div class="wrapper">
  <Solargraph
    startDate={new Date(2021, 11, 21)}
    numDays={Math.ceil(365 / 2)}
    clouds={clouds}
  />
</div>

<style>
  .wrapper {
    width: 100%;
    height: 600px;
  }
</style>