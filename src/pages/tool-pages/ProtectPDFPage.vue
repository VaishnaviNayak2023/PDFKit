<template>
  <BaseToolPage
    title="Protect PDF"
    description="Password protect and secure your PDF files"
    long-description="Add password protection to your PDF to prevent unauthorized access. Set user and owner passwords, and configure permissions for printing, copying, and editing."
    accepted-file-types=".pdf"
    action-label="Protect PDF"
    success-message="PDF Protected Successfully!"
    download-filename="protected.pdf"
    preview-component="pdf"
    @files-selected="handleFilesSelected"
    @process-files="protectPDF"
  >
    <template #settings-section>
      <div class="settings-section">
        <h3 class="section-title">Security Settings</h3>
        
        <q-card class="settings-card bg-dark text-white">
          <q-card-section>
            <div class="password-section">
              <q-input
                v-model="passwords.userPassword"
                label="User Password (required to open)"
                :type="showUserPassword ? 'text' : 'password'"
                filled
                dark
                color="primary"
                class="q-mb-md"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showUserPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showUserPassword = !showUserPassword"
                  />
                </template>
              </q-input>
              
              <q-input
                v-model="passwords.ownerPassword"
                label="Owner Password (required to change permissions)"
                :type="showOwnerPassword ? 'text' : 'password'"
                filled
                dark
                color="primary"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showOwnerPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showOwnerPassword = !showOwnerPassword"
                  />
                </template>
              </q-input>
            </div>

            <div class="permissions-section q-mt-md">
              <label class="field-label">Permissions</label>
              
              <div class="permission-grid">
                <q-checkbox
                  v-model="permissions.allowPrinting"
                  label="Allow Printing"
                  color="primary"
                  dark
                />
                <q-checkbox
                  v-model="permissions.allowCopying"
                  label="Allow Copying"
                  color="primary"
                  dark
                />
                <q-checkbox
                  v-model="permissions.allowModifying"
                  label="Allow Modifying"
                  color="primary"
                  dark
                />
                <q-checkbox
                  v-model="permissions.allowAnnotating"
                  label="Allow Annotating"
                  color="primary"
                  dark
                />
                <q-checkbox
                  v-model="permissions.allowFillingForms"
                  label="Allow Filling Forms"
                  color="primary"
                  dark
                />
                <q-checkbox
                  v-model="permissions.allowContentExtraction"
                  label="Allow Content Extraction"
                  color="primary"
                  dark
                />
              </div>
            </div>

            <div class="encryption-info q-mt-md">
              <q-icon name="lock" color="info" />
              <span>PDF uses 128-bit AES encryption for strong security</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <template #result-section>
      <div v-if="protectedResult" class="result-section">
        <div class="success-message">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>PDF Protected Successfully!</h3>
          <p>Your PDF is now password protected</p>
        </div>
        
        <q-btn
          color="primary"
          label="Download Protected PDF"
          @click="downloadResult"
          size="lg"
        >
          <template v-slot:after>
            <q-icon name="download" />
          </template>
        </q-btn>
      </div>
    </template>
  </BaseToolPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseToolPage from '@/components/tools/BaseToolPage.vue'
import { PDFService } from '@/services/pdf/pdfService'

const files = ref<File[]>([])
const passwords = ref({
  userPassword: '',
  ownerPassword: ''
})
const showUserPassword = ref(false)
const showOwnerPassword = ref(false)
const permissions = ref({
  allowPrinting: true,
  allowCopying: true,
  allowModifying: false,
  allowAnnotating: true,
  allowFillingForms: true,
  allowContentExtraction: false
})
const protectedResult = ref<ArrayBuffer | null>(null)
const error = ref<string | null>(null)

function handleFilesSelected(selectedFiles: File[]) {
  files.value = selectedFiles
}

async function protectPDF() {
  error.value = null
  protectedResult.value = null
  
  if (files.value.length === 0) {
    error.value = 'Please select a PDF file'
    return
  }

  if (!passwords.value.userPassword) {
    error.value = 'Please enter a user password'
    return
  }

  try {
    const file = files.value[0]
    const buffer = await file.arrayBuffer()
    
    protectedResult.value = await PDFService.protectPDF(buffer, passwords.value.userPassword)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to protect PDF'
  }
}

function downloadResult() {
  if (!protectedResult.value) return

  const blob = new Blob([protectedResult.value], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'protected.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.settings-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.field-label {
  display: block;
  margin-bottom: 12px;
  color: #a0a0a0;
  font-size: 14px;
  font-weight: 500;
}

.permission-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.encryption-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(74, 158, 255, 0.1);
  border-radius: 8px;
  color: #808080;
  margin-top: 16px;
}
</style>
