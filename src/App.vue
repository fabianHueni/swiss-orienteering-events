<template>
  <EventTable />
</template>

<script>
import EventTable from "@/components/EventTable";

export default {
  name: 'App',
  components: {
    EventTable
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background: var(--surface-card)	;
}


</style>
