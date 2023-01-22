<template>
  <EventTable />
</template>

<script>
import EventTable from "@/components/EventTable";

export default {
  name: 'App',
  components: {
    EventTable
  },
  created(){
    document.title = "Swiss Orienteering Events"
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background: var(--surface-card)	;
}

/* width */
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

/* Track */
::-webkit-scrollbar-track {
  background: var(--text-color-secondary);
  border-radius: 5px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 5px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
