<script>
  import Solargraph from '$lib/Solargraph.svelte';

  export let data = {};

  $: ({ radiation } = data);
</script>

<div class="wrapper">
  <Solargraph
    startDate={new Date(2022, 5, 21)}
    numDays={Math.ceil(365 / 2)}
    radiation={radiation}
  />
</div>

<style>
  .wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>