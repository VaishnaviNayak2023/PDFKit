<template>
  <q-page class="bg-dark">
    <div class="workspace-container">
      <div class="workspace-header">
        <h1 class="workspace-title">Workspace</h1>
        <p class="workspace-subtitle">Manage your documents with advanced tools and workflows</p>
      </div>

      <div class="workspace-placeholder">
        <q-icon name="workspaces" size="128px" class="placeholder-icon" />
        <h2 class="placeholder-title">Workspace Coming Soon</h2>
        <p class="placeholder-desc">
          The workspace feature will allow you to manage multiple documents, compare files side-by-side, and build custom workflows.
        </p>
        <q-btn
          size="lg"
          color="primary"
          label="Explore Tools"
          to="/tools"
          class="q-mt-md"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// Workspace page - placeholder for future implementation
</script>

<style scoped>
.workspace-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.workspace-header {
  margin-bottom: 60px;
}

.workspace-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 12px;
}

.workspace-subtitle {
  font-size: 18px;
  color: #808080;
}

.workspace-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  background: #1a1a1a;
  border-radius: 16px;
  border: 1px solid #2a2a2a;
}

.placeholder-icon {
  color: #4a9eff;
  margin-bottom: 32px;
}

.placeholder-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
}

.placeholder-desc {
  font-size: 18px;
  color: #808080;
  text-align: center;
  max-width: 600px;
  margin-bottom: 32px;
}
</style>
