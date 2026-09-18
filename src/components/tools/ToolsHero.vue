<template>
  <div class="row items-center q-col-gutter-lg">
    <div class="col-12 col-md-7">
      <div class="text-caption text-uppercase text-grey-6 letter-spacing q-mb-sm">
        Document Tools
      </div>
      <div class="text-h3 text-weight-bold q-mb-md">All Tools</div>
      <p class="text-grey-5" style="max-width: 520px; line-height: 1.7; font-size: 16px">
        70+ privacy-first tools to process, edit, convert and manage your documents.
        Works offline. No uploads. No watermarks.
      </p>
    </div>

    <div class="col-12 col-md-5 flex flex-center relative-position">
      <div class="hero-art">
        <div class="hero-glow" />
        <div class="stack-card stack-card--back" />
        <div class="stack-card stack-card--mid" />
        <div class="stack-card stack-card--front column flex-center">
          <q-icon name="description" size="52px" color="primary" />
        </div>
        <q-card flat bordered class="local-badge">
          <q-card-section class="q-pa-sm row no-wrap items-start q-gutter-sm">
            <q-icon name="lock" color="primary" size="18px" class="q-mt-xs" />
            <div>
              <div class="text-caption text-weight-medium">100% Local Processing</div>
              <div class="text-caption text-grey-6">Your files stay on your device</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.letter-spacing {
  letter-spacing: 0.18em;
}

.hero-art {
  position: relative;
  width: 340px;
  height: 250px;
}

.hero-glow {
  position: absolute;
  inset: 0 10px;
  background: radial-gradient(circle, rgba(79, 140, 255, 0.32), transparent 70%);
  filter: blur(22px);
}

.stack-card {
  position: absolute;
  width: 168px;
  height: 200px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, #1a2740 0%, #111827 100%);
}

.stack-card--back {
  right: 28px;
  top: 34px;
  transform: rotate(14deg);
  opacity: 0.5;
}

.stack-card--mid {
  right: 56px;
  top: 22px;
  transform: rotate(7deg);
  opacity: 0.78;
}

.stack-card--front {
  right: 92px;
  top: 10px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
}

.local-badge {
  position: absolute;
  right: 0;
  top: 0;
  width: 220px;
  background: #141b24;
  border-color: var(--pk-border);
  border-radius: 14px;
}
</style>
