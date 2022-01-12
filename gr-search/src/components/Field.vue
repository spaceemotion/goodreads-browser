<template>
  <div>
    <div class="font-bold text-brown-800 mb-2 tracking-wide text-sm">{{ label }}</div>
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    label: {
      type: String,
      default: ''
    }
  },
})
</script>
