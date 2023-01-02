<script>
  import Solargraph from '$lib/Solargraph.svelte';
</script>

<div class="wrapper">
  <Solargraph
    startDate={new Date(2022, 11, 21)}
    numDays={Math.ceil(365 / 2)}
  />
</div>

<style>
  .wrapper {
    width: 100%;
    height: 600px;
  }
</style>