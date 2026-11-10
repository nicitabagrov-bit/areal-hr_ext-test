<script setup>
import { ref, onMounted } from 'vue'

// --- Состояние ---
const activeTab = ref('orgs')

// Организации
const organizations = ref([])
const newOrgName = ref('')

// Отделы
const departments = ref([])
const newDepName = ref('')
const selectedOrgId = ref('')

// Должности
const positions = ref([])
const newPosName = ref('')

// Сотрудники
const employees = ref([])
const newEmpLastName = ref('')
const newEmpFirstName = ref('')
const newEmpBirthDate = ref('')

// Файлы
const files = ref([])
const fileEmployeeId = ref('')
const fileInput = ref(null)
const fileName = ref('')

// Операции
const operations = ref([])
const opEmployeeId = ref('')
const opType = ref('hire')
const opSalary = ref('')

// История
const history = ref([])

// --- Функции ---

// Организации
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
const deleteOrganization = async (id) => {
  if (!confirm('Удалить организацию?')) return
  await fetch(`/api/organizations/${id}`, { method: 'DELETE' })
  fetchOrganizations()
}
const editOrganization = async (org) => {
  const newName = prompt('Новое название:', org.name)
  if (newName) {
    await fetch(`/api/organizations/${org.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    })
    fetchOrganizations()
  }
}

// Отделы
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
const deleteDepartment = async (id) => {
  if (!confirm('Удалить отдел?')) return
  await fetch(`/api/departments/${id}`, { method: 'DELETE' })
  fetchDepartments()
}
const editDepartment = async (dep) => {
  const newName = prompt('Новое название отдела:', dep.name)
  if (newName) {
    await fetch(`/api/departments/${dep.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    })
    fetchDepartments()
  }
}

// Должности
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
const deletePosition = async (id) => {
  if (!confirm('Удалить должность?')) return
  await fetch(`/api/positions/${id}`, { method: 'DELETE' })
  fetchPositions()
}
const editPosition = async (pos) => {
  const newName = prompt('Новое название должности:', pos.name)
  if (newName) {
    await fetch(`/api/positions/${pos.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName })
    })
    fetchPositions()
  }
}

// Сотрудники
const fetchEmployees = async () => {
  const res = await fetch('/api/employees')
  employees.value = await res.json()
}
const createEmployee = async () => {
  if (!newEmpLastName.value || !newEmpFirstName.value || !newEmpBirthDate.value) return
  await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      last_name: newEmpLastName.value, 
      first_name: newEmpFirstName.value, 
      birth_date: newEmpBirthDate.value 
    })
  })
  newEmpLastName.value = ''
  newEmpFirstName.value = ''
  newEmpBirthDate.value = ''
  fetchEmployees()
}
const deleteEmployee = async (id) => {
  if (!confirm('Удалить сотрудника?')) return
  await fetch(`/api/employees/${id}`, { method: 'DELETE' })
  fetchEmployees()
}

// Файлы
const fetchFiles = async () => {
  const res = await fetch('/api/files')
  files.value = await res.json()
}
const uploadFile = async () => {
  if (!fileInput.value || !fileEmployeeId.value) return
  
  const formData = new FormData()
  formData.append('file', fileInput.value)
  formData.append('employee_id', fileEmployeeId.value)
  formData.append('name', fileName.value || 'Scan')

  await fetch('/api/files', {
    method: 'POST',
    body: formData
  })
  
  fileInput.value = null
  fileName.value = ''
  fetchFiles()
}
const handleFileChange = (e) => {
  fileInput.value = e.target.files[0]
}
const deleteFile = async (id) => {
  if (!confirm('Удалить файл?')) return
  await fetch(`/api/files/${id}`, { method: 'DELETE' })
  fetchFiles()
}

// Операции
const fetchOperations = async () => {
  const res = await fetch('/api/hr-operations')
  operations.value = await res.json()
}
const createOperation = async () => {
  if (!opEmployeeId.value || !opType.value) return
  const data = { 
    employee_id: opEmployeeId.value, 
    operation_type: opType.value 
  }
  if (opSalary.value) data.salary = Number(opSalary.value)

  await fetch('/api/hr-operations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  opEmployeeId.value = ''
  opSalary.value = ''
  fetchOperations()
}
const deleteOperation = async (id) => {
  if (!confirm('Удалить операцию?')) return
  await fetch(`/api/hr-operations/${id}`, { method: 'DELETE' })
  fetchOperations()
}

// История
const fetchHistory = async () => {
  const res = await fetch('/api/change-history')
  history.value = await res.json()
}

// --- Загрузка ---
onMounted(() => {
  fetchOrganizations()
  fetchDepartments()
  fetchPositions()
  fetchEmployees()
  fetchFiles()
  fetchOperations()
  fetchHistory()
})
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif; max-width: 900px; margin: 0 auto;">
    
    <!-- Вкладки -->
    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px;">
      <button @click="activeTab = 'orgs'" :style="{ fontWeight: activeTab === 'orgs' ? 'bold' : 'normal' }">Организации</button>
      <button @click="activeTab = 'deps'" :style="{ fontWeight: activeTab === 'deps' ? 'bold' : 'normal' }">Отделы</button>
      <button @click="activeTab = 'pos'" :style="{ fontWeight: activeTab === 'pos' ? 'bold' : 'normal' }">Должности</button>
      <button @click="activeTab = 'emp'" :style="{ fontWeight: activeTab === 'emp' ? 'bold' : 'normal' }">Сотрудники</button>
      <button @click="activeTab = 'files'" :style="{ fontWeight: activeTab === 'files' ? 'bold' : 'normal' }">Файлы</button>
      <button @click="activeTab = 'ops'" :style="{ fontWeight: activeTab === 'ops' ? 'bold' : 'normal' }">Операции</button>
      <button @click="activeTab = 'history'" :style="{ fontWeight: activeTab === 'history' ? 'bold' : 'normal' }">История</button>
    </div>

    <!-- Организации -->
    <div v-if="activeTab === 'orgs'">
      <h2>Организации</h2>
      <div style="margin-bottom: 20px;">
        <input v-model="newOrgName" placeholder="Название" style="padding: 8px; width: 60%;" />
        <button @click="createOrganization" style="padding: 8px 16px; margin-left: 10px; background: #42b883; color: white; border: none; cursor: pointer;">Добавить</button>
      </div>
      <ul>
        <li v-for="org in organizations" :key="org.id" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
          <span><strong>{{ org.name }}</strong></span>
          <span>
            <button @click="editOrganization(org)" style="margin-right: 5px; cursor: pointer;">✏️</button>
            <button @click="deleteOrganization(org.id)" style="color: red; cursor: pointer;">❌</button>
          </span>
        </li>
      </ul>
    </div>

    <!-- Отделы -->
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
        <li v-for="dep in departments" :key="dep.id" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
          <span><strong>{{ dep.name }}</strong></span>
          <span>
            <button @click="editDepartment(dep)" style="margin-right: 5px; cursor: pointer;">✏️</button>
            <button @click="deleteDepartment(dep.id)" style="color: red; cursor: pointer;">❌</button>
          </span>
        </li>
      </ul>
    </div>

    <!-- Должности -->
    <div v-if="activeTab === 'pos'">
      <h2>Должности</h2>
      <div style="margin-bottom: 20px;">
        <input v-model="newPosName" placeholder="Название должности" style="padding: 8px; width: 60%;" />
        <button @click="createPosition" style="padding: 8px 16px; margin-left: 10px; background: #42b883; color: white; border: none; cursor: pointer;">Добавить</button>
      </div>
      <ul>
        <li v-for="pos in positions" :key="pos.id" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
          <span><strong>{{ pos.name }}</strong></span>
          <span>
            <button @click="editPosition(pos)" style="margin-right: 5px; cursor: pointer;">✏️</button>
            <button @click="deletePosition(pos.id)" style="color: red; cursor: pointer;">❌</button>
          </span>
        </li>
      </ul>
    </div>

    <!-- Сотрудники -->
    <div v-if="activeTab === 'emp'">
      <h2>Сотрудники</h2>
      <div style="margin-bottom: 20px; display: flex; gap: 10px;">
        <input v-model="newEmpLastName" placeholder="Фамилия" style="padding: 8px; width: 30%;" />
        <input v-model="newEmpFirstName" placeholder="Имя" style="padding: 8px; width: 30%;" />
        <input v-model="newEmpBirthDate" type="date" style="padding: 8px; width: 30%;" />
        <button @click="createEmployee" style="padding: 8px 16px; background: #42b883; color: white; border: none; cursor: pointer;">Добавить</button>
      </div>
      <ul>
        <li v-for="emp in employees" :key="emp.id" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
          <span><strong>{{ emp.last_name }} {{ emp.first_name }}</strong> ({{ emp.birth_date.split('T')[0] }})</span>
          <span>
            <button @click="deleteEmployee(emp.id)" style="color: red; cursor: pointer;">❌</button>
          </span>
        </li>
      </ul>
    </div>

    <!-- Файлы -->
    <div v-if="activeTab === 'files'">
      <h2>Файлы (Сканы)</h2>
      <div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px;">
        <select v-model="fileEmployeeId" style="padding: 8px;">
          <option value="" disabled>Выберите сотрудника</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.last_name }} {{ emp.first_name }}</option>
        </select>
        <input v-model="fileName" placeholder="Название файла" style="padding: 8px;" />
        <div>
          <input type="file" @change="handleFileChange" style="padding: 8px;" />
          <button @click="uploadFile" style="padding: 8px 16px; background: #42b883; color: white; border: none; cursor: pointer;">Загрузить</button>
        </div>
      </div>
      <ul>
        <li v-for="file in files" :key="file.id" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
          <span><strong>{{ file.name }}</strong> <a :href="file.file_path" target="_blank">(Открыть)</a></span>
          <span>
            <button @click="deleteFile(file.id)" style="color: red; cursor: pointer;">❌</button>
          </span>
        </li>
      </ul>
    </div>

    <!-- Операции -->
    <div v-if="activeTab === 'ops'">
      <h2>Кадровые операции</h2>
      <div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px;">
        <select v-model="opEmployeeId" style="padding: 8px;">
          <option value="" disabled>Выберите сотрудника</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.last_name }} {{ emp.first_name }}</option>
        </select>
        <select v-model="opType" style="padding: 8px;">
          <option value="hire">Прием на работу</option>
          <option value="salary_set">Установка зарплаты</option>
          <option value="salary_change">Изменение зарплаты</option>
          <option value="department_change">Изменение отдела</option>
          <option value="dismissal">Увольнение</option>
        </select>
        <input v-model="opSalary" type="number" placeholder="Зарплата (опционально)" style="padding: 8px;" />
        <button @click="createOperation" style="padding: 8px 16px; background: #42b883; color: white; border: none; cursor: pointer;">Добавить</button>
      </div>
      <ul>
        <li v-for="op in operations" :key="op.id" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
          <span><strong>{{ op.operation_type }}</strong> <span v-if="op.salary">(Зарплата: {{ op.salary }})</span></span>
          <span>
            <button @click="deleteOperation(op.id)" style="color: red; cursor: pointer;">❌</button>
          </span>
        </li>
      </ul>
    </div>

    <!-- История -->
    <div v-if="activeTab === 'history'">
      <h2>История изменений</h2>
      <ul>
        <li v-for="h in history" :key="h.id" style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>{{ h.field_name }}</strong>: {{ h.old_value }} → {{ h.new_value }} 
          <span style="color: #888; font-size: 0.8em;">({{ h.changed_at.split('T')[0] }})</span>
        </li>
      </ul>
    </div>

  </div>
</template>