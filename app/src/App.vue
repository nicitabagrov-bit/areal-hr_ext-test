<script setup>
import { ref, onMounted } from 'vue'

const organizations = ref([])
const newName = ref('')

// Функция для получения списка организаций
const fetchOrganizations = async () => {
  const res = await fetch('/api/organizations')
  organizations.value = await res.json()
}

// Функция для создания новой организации
const createOrganization = async () => {
  if (!newName.value) return
  await fetch('/api/organizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName.value })
  })
  newName.value = ''
  fetchOrganizations() // Обновляем список после добавления
}

// Загружаем список при старте
onMounted(fetchOrganizations)
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif; max-width: 600px; margin: 0 auto;">
    <h1>Организации</h1>
    
    <div style="margin-bottom: 20px;">
      <input 
        v-model="newName" 
        placeholder="Название организации" 
        style="padding: 8px; width: 70%; border: 1px solid #ccc; border-radius: 4px;"
      />
      <button 
        @click="createOrganization" 
        style="padding: 8px 16px; margin-left: 10px; background: #42b883; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Добавить
      </button>
    </div>

    <ul style="list-style-type: none; padding: 0;">
      <li 
        v-for="org in organizations" 
        :key="org.id" 
        style="padding: 10px; border-bottom: 1px solid #eee;"
      >
        <strong>{{ org.name }}</strong> 
        <span style="color: #888; font-size: 0.9em;">(ID: {{ org.id }})</span>
      </li>
    </ul>
  </div>
</template>