<script setup>
import { ref, onMounted } from 'vue'

// --- Состояние для Организаций ---
const organizations = ref([])
const newOrgName = ref('')

// --- Состояние для Отделов ---
const departments = ref([])
const newDepName = ref('')
const selectedOrgId = ref('')

// --- Состояние для Должностей ---
const positions = ref([])
const newPosName = ref('')

// --- Активная вкладка ---
const activeTab = ref('orgs') // 'orgs', 'deps', 'pos'

// --- Функции для Организаций ---
const fetchOrganizations = async () => {
  const res = await fetch('/api/organizations')
  organizations.value = await res.json()
}

const createOrganization = async () => {
  if (!newOrgName.value) return
  await fetch('/api/organizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newOrgName.value })
  })
  newOrgName.value = ''
  fetchOrganizations()
}

// --- Функции для Отделов ---
const fetchDepartments = async () => {
  const res = await fetch('/api/departments')
  departments.value = await res.json()
}

const createDepartment = async () => {
  if (!newDepName.value || !selectedOrgId.value) return
  await fetch('/api/departments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newDepName.value, organization_id: selectedOrgId.value })
  })
  newDepName.value = ''
  fetchDepartments()
}

// --- Функции для Должностей ---
const fetchPositions = async () => {
  const res = await fetch('/api/positions')
  positions.value = await res.json()
}

const createPosition = async () => {
  if (!newPosName.value) return
  await fetch('/api/positions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newPosName.value })
  })
  newPosName.value = ''
  fetchPositions()
}

// --- Загрузка данных при старте ---
onMounted(() => {
  fetchOrganizations()
  fetchDepartments()
  fetchPositions()
})
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif; max-width: 800px; margin: 0 auto;">
    
    <!-- Вкладки -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
      <button @click="activeTab = 'orgs'" :style="{ fontWeight: activeTab === 'orgs' ? 'bold' : 'normal' }">Организации</button>
      <button @click="activeTab = 'deps'" :style="{ fontWeight: activeTab === 'deps' ? 'bold' : 'normal' }">Отделы</button>
      <button @click="activeTab = 'pos'" :style="{ fontWeight: activeTab === 'pos' ? 'bold' : 'normal' }">Должности</button>
    </div>

    <!-- Вкладка: Организации -->
    <div v-if="activeTab === 'orgs'">
      <h2>Организации</h2>
      <div style="margin-bottom: 20px;">
        <input v-model="newOrgName" placeholder="Название организации" style="padding: 8px; width: 60%;" />
        <button @click="createOrganization" style="padding: 8px 16px; margin-left: 10px; background: #42b883; color: white; border: none; cursor: pointer;">Добавить</button>
      </div>
      <ul>
        <li v-for="org in organizations" :key="org.id" style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>{{ org.name }}</strong> <span style="color: #888; font-size: 0.9em;">(ID: {{ org.id }})</span>
        </li>
      </ul>
    </div>

    <!-- Вкладка: Отделы -->
    <div v-if="activeTab === 'deps'">
      <h2>Отделы</h2>
      <div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px;">
        <select v-model="selectedOrgId" style="padding: 8px;">
          <option value="" disabled>Выберите организацию</option>
          <option v-for="org in organizations" :key="org.id" :value="org.id">{{ org.name }}</option>
        </select>
        <div>
          <input v-model="newDepName" placeholder="Название отдела" style="padding: 8px; width: 60%;" />
          <button @click="createDepartment" style="padding: 8px 16px; margin-left: 10px; background: #42b883; color: white; border: none; cursor: pointer;">Добавить</button>
        </div>
      </div>
      <ul>
        <li v-for="dep in departments" :key="dep.id" style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>{{ dep.name }}</strong> <span style="color: #888; font-size: 0.9em;">(ID: {{ dep.id }})</span>
        </li>
      </ul>
    </div>

    <!-- Вкладка: Должности -->
    <div v-if="activeTab === 'pos'">
      <h2>Должности</h2>
      <div style="margin-bottom: 20px;">
        <input v-model="newPosName" placeholder="Название должности" style="padding: 8px; width: 60%;" />
        <button @click="createPosition" style="padding: 8px 16px; margin-left: 10px; background: #42b883; color: white; border: none; cursor: pointer;">Добавить</button>
      </div>
      <ul>
        <li v-for="pos in positions" :key="pos.id" style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>{{ pos.name }}</strong> <span style="color: #888; font-size: 0.9em;">(ID: {{ pos.id }})</span>
        </li>
      </ul>
    </div>

  </div>
</template>