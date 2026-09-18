<template>
  <q-card flat bordered class="privacy-card q-pa-md">
    <div class="text-subtitle2 text-weight-medium q-mb-xs">Your Privacy Matters</div>
    <div class="text-caption text-grey-6 q-mb-md" style="line-height: 1.5">
      All tools work offline.<br />
      Your files never leave your device.
    </div>
    <q-btn
      unelevated
      no-caps
      dense
      color="primary"
      label="Learn More"
      icon-right="arrow_forward"
      to="/privacy"
      class="full-width"
    />
  </q-card>
</template>

<script setup lang="ts">
</script>

<style scoped>
.privacy-card {
  background: #111827;
  border-color: var(--pk-border);
  border-radius: 16px;
}
</style>
