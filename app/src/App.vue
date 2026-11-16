<script setup>
import { ref, onMounted, computed } from 'vue'

// --- Функция для вывода ошибок ---
const showError = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    const msg = error.response.data.message;
    alert('Ошибка: ' + (Array.isArray(msg) ? msg.join(', ') : msg));
  } else {
    alert('Ошибка: ' + (error.message || 'Что-то пошло не так'));
  }
}

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
const searchQuery = ref('')
const filterDepartmentId = ref('')

// Модальное окно редактирования сотрудника (Паспорт, Адрес)
const isEditModalOpen = ref(false)
const editingEmployee = ref({})

// Файлы
const files = ref([])
const fileEmployeeId = ref('')
const fileCategoryId = ref('')
const fileInput = ref(null)
const fileName = ref('')
const categories = ref([])

// Операции
const operations = ref([])
const opEmployeeId = ref('')
const opType = ref('hire')
const opSalary = ref('')
const opDepartmentId = ref('')
const opPositionId = ref('')

// История
const history = ref([])

// --- Функции ---

// Организации
const fetchOrganizations = async () => {
  try {
    const res = await fetch('/api/organizations')
    organizations.value = await res.json()
  } catch (error) { showError(error) }
}
const createOrganization = async () => {
  if (!newOrgName.value) return
  try {
    const res = await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newOrgName.value })
    })
    if (!res.ok) throw new Error('Ошибка создания организации')
    newOrgName.value = ''
    fetchOrganizations()
  } catch (error) { showError(error) }
}
const deleteOrganization = async (id) => {
  if (!confirm('Удалить организацию?')) return
  try {
    const res = await fetch(`/api/organizations/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Ошибка удаления организации')
    fetchOrganizations()
  } catch (error) { showError(error) }
}
const editOrganization = async (org) => {
  const newName = prompt('Новое название:', org.name)
  if (newName) {
    try {
      const res = await fetch(`/api/organizations/${org.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      })
      if (!res.ok) throw new Error('Ошибка обновления')
      fetchOrganizations()
    } catch (error) { showError(error) }
  }
}

// Отделы
const fetchDepartments = async () => {
  try {
    const res = await fetch('/api/departments')
    departments.value = await res.json()
  } catch (error) { showError(error) }
}
const createDepartment = async () => {
  if (!newDepName.value || !selectedOrgId.value) return
  try {
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newDepName.value, organization_id: selectedOrgId.value })
    })
    if (!res.ok) throw new Error('Ошибка создания отдела')
    newDepName.value = ''
    fetchDepartments()
  } catch (error) { showError(error) }
}
const deleteDepartment = async (id) => {
  if (!confirm('Удалить отдел?')) return
  try {
    const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Ошибка удаления отдела')
    fetchDepartments()
  } catch (error) { showError(error) }
}
const editDepartment = async (dep) => {
  const newName = prompt('Новое название отдела:', dep.name)
  if (newName) {
    try {
      const res = await fetch(`/api/departments/${dep.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      })
      if (!res.ok) throw new Error('Ошибка обновления')
      fetchDepartments()
    } catch (error) { showError(error) }
  }
}

// Должности
const fetchPositions = async () => {
  try {
    const res = await fetch('/api/positions')
    positions.value = await res.json()
  } catch (error) { showError(error) }
}
const createPosition = async () => {
  if (!newPosName.value) return
  try {
    const res = await fetch('/api/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newPosName.value })
    })
    if (!res.ok) throw new Error('Ошибка создания должности')
    newPosName.value = ''
    fetchPositions()
  } catch (error) { showError(error) }
}
const deletePosition = async (id) => {
  if (!confirm('Удалить должность?')) return
  try {
    const res = await fetch(`/api/positions/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Ошибка удаления')
    fetchPositions()
  } catch (error) { showError(error) }
}
const editPosition = async (pos) => {
  const newName = prompt('Новое название должности:', pos.name)
  if (newName) {
    try {
      const res = await fetch(`/api/positions/${pos.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      })
      if (!res.ok) throw new Error('Ошибка обновления')
      fetchPositions()
    } catch (error) { showError(error) }
  }
}

// Сотрудники
const fetchEmployees = async () => {
  try {
    const res = await fetch('/api/employees')
    employees.value = await res.json()
  } catch (error) { showError(error) }
}
const createEmployee = async () => {
  if (!newEmpLastName.value || !newEmpFirstName.value || !newEmpBirthDate.value) return
  try {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        last_name: newEmpLastName.value, 
        first_name: newEmpFirstName.value, 
        birth_date: newEmpBirthDate.value 
      })
    })
    if (!res.ok) throw new Error('Ошибка создания сотрудника (проверьте данные)')
    newEmpLastName.value = ''
    newEmpFirstName.value = ''
    newEmpBirthDate.value = ''
    fetchEmployees()
  } catch (error) { showError(error) }
}

// Открытие модалки редактирования
const openEditModal = (emp) => {
  editingEmployee.value = { ...emp }
  isEditModalOpen.value = true
}

// Сохранение изменений (Телефон + Паспорт + Адрес)
const saveEmployeeChanges = async () => {
  const emp = editingEmployee.value;
  try {
    await fetch(`/api/employees/${emp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: emp.phone })
    });

    if (emp.passport_series) {
      await fetch('/api/passports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: emp.id,
          series: emp.passport_series,
          number: emp.passport_number,
          issue_date: emp.passport_issue_date,
          issued_by: emp.passport_issued_by,
          department_code: emp.passport_department_code
        })
      });
    }

    if (emp.address_city) {
      await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: emp.id,
          region: emp.address_region,
          city: emp.address_city,
          street: emp.address_street,
          house: emp.address_house,
          building: emp.address_building,
          apartment: emp.address_apartment
        })
      });
    }

    isEditModalOpen.value = false;
    fetchEmployees();
    alert('Данные сохранены!');
  } catch (error) {
    showError(error);
  }
}

// Вспомогательные функции для отображения названий
const getDepartmentName = (id) => {
  if (!id) return '-';
  const dep = departments.value.find(d => d.id === id);
  return dep ? dep.name : 'Не найден';
}

const getPositionName = (id) => {
  if (!id) return '-';
  const pos = positions.value.find(p => p.id === id);
  return pos ? pos.name : 'Не найден';
}

// Фильтрация сотрудников
const filteredEmployees = computed(() => {
  let result = employees.value;
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(e => 
      `${e.last_name} ${e.first_name} ${e.middle_name || ''}`.toLowerCase().includes(q)
    );
  }
  
  if (filterDepartmentId.value) {
    result = result.filter(e => e.department_id === filterDepartmentId.value);
  }
  
  return result;
});

// Файлы
const fetchFiles = async () => {
  try {
    const res = await fetch('/api/files')
    files.value = await res.json()
  } catch (error) { showError(error) }
}
const fetchCategories = async () => {
  try {
    const res = await fetch('/api/file-categories')
    categories.value = await res.json()
  } catch (error) { showError(error) }
}
const uploadFile = async () => {
  if (!fileInput.value || !fileEmployeeId.value) return
  try {
    const formData = new FormData()
    formData.append('file', fileInput.value)
    formData.append('employee_id', fileEmployeeId.value)
    if (fileCategoryId.value) formData.append('category_id', fileCategoryId.value)
    formData.append('name', fileName.value || 'Scan')

    const res = await fetch('/api/files', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Ошибка загрузки файла')
    
    fileInput.value = null
    fileName.value = ''
    fetchFiles()
  } catch (error) { showError(error) }
}
const handleFileChange = (e) => {
  fileInput.value = e.target.files[0]
}
const deleteFile = async (id) => {
  if (!confirm('Удалить файл?')) return
  try {
    const res = await fetch(`/api/files/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Ошибка удаления')
    fetchFiles()
  } catch (error) { showError(error) }
}

// Операции
const fetchOperations = async () => {
  try {
    const res = await fetch('/api/hr-operations')
    operations.value = await res.json()
  } catch (error) { showError(error) }
}
const createOperation = async () => {
  if (!opEmployeeId.value || !opType.value) return
  try {
    const data = { 
      employee_id: opEmployeeId.value, 
      operation_type: opType.value,
      department_id: opDepartmentId.value || null,
      position_id: opPositionId.value || null
    }
    if (opSalary.value) data.salary = Number(opSalary.value)

    const res = await fetch('/api/hr-operations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Ошибка создания операции');
    }
    opEmployeeId.value = ''
    opSalary.value = ''
    opDepartmentId.value = ''
    opPositionId.value = ''
    fetchOperations()
    fetchEmployees()
  } catch (error) { showError(error) }
}
const deleteOperation = async (id) => {
  if (!confirm('Удалить операцию?')) return
  try {
    const res = await fetch(`/api/hr-operations/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Ошибка удаления')
    fetchOperations()
    fetchEmployees()
  } catch (error) { showError(error) }
}

// История
const fetchHistory = async () => {
  try {
    const res = await fetch('/api/change-history')
    history.value = await res.json()
  } catch (error) { showError(error) }
}

onMounted(() => {
  fetchOrganizations()
  fetchDepartments()
  fetchPositions()
  fetchEmployees()
  fetchFiles()
  fetchCategories()
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
        <input v-model="searchQuery" placeholder="Поиск по ФИО..." style="padding: 8px; width: 30%;" />
        <select v-model="filterDepartmentId" style="padding: 8px; width: 30%;">
          <option value="">Все отделы</option>
          <option v-for="dep in departments" :key="dep.id" :value="dep.id">{{ dep.name }}</option>
        </select>
      </div>

      <div style="margin-bottom: 20px; display: flex; gap: 10px;">
        <input v-model="newEmpLastName" placeholder="Фамилия" style="padding: 8px; width: 30%;" />
        <input v-model="newEmpFirstName" placeholder="Имя" style="padding: 8px; width: 30%;" />
        <input v-model="newEmpBirthDate" type="date" style="padding: 8px; width: 30%;" />
        <button @click="createEmployee" style="padding: 8px 16px; background: #42b883; color: white; border: none; cursor: pointer;">Добавить</button>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f0f0f0;">
            <th>ФИО</th>
            <th>Телефон</th>
            <th>Отдел</th>
            <th>Должность</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="emp in filteredEmployees" :key="emp.id" style="border-bottom: 1px solid #eee;">
            <td>{{ emp.last_name }} {{ emp.first_name }} {{ emp.middle_name }}</td>
            <td>{{ emp.phone || '-' }}</td>
            <td>{{ getDepartmentName(emp.department_id) }}</td>
            <td>{{ getPositionName(emp.position_id) }}</td>
            <td>
              <span v-if="emp.dismissed_at" style="color: red;">Уволен</span>
              <span v-else style="color: green;">Работает</span>
            </td>
            <td>
              <button v-if="!emp.dismissed_at" @click="openEditModal(emp)" style="cursor: pointer;" title="Редактировать паспорт и адрес">✏️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Файлы -->
    <div v-if="activeTab === 'files'">
      <h2>Файлы (Сканы)</h2>
      <div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px;">
        <select v-model="fileEmployeeId" style="padding: 8px;">
          <option value="" disabled>Выберите сотрудника</option>
          <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.last_name }} {{ emp.first_name }}</option>
        </select>
        
        <select v-model="fileCategoryId" style="padding: 8px;">
          <option value="">Без категории</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <input v-model="fileName" placeholder="Название файла" style="padding: 8px;" />
        <div>
          <input type="file" @change="handleFileChange" style="padding: 8px;" />
          <button @click="uploadFile" style="padding: 8px 16px; background: #42b883; color: white; border: none; cursor: pointer;">Загрузить</button>
        </div>
      </div>
      <ul>
        <li v-for="file in files" :key="file.id" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
          <span>
            <strong>{{ file.name }}</strong> 
            <!-- ССЫЛКА НА СКАЧИВАНИЕ ЧЕРЕЗ БЕЗОПАСНЫЙ ЭНДПОИНТ -->
            <a :href="`http://localhost:3000/files/${file.id}/download`" target="_blank" style="margin-left: 10px; color: blue;">(Скачать)</a>
          </span>
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

        <select v-model="opDepartmentId" style="padding: 8px;">
          <option value="">Выберите отдел (если нужно)</option>
          <option v-for="dep in departments" :key="dep.id" :value="dep.id">{{ dep.name }}</option>
        </select>
        <select v-model="opPositionId" style="padding: 8px;">
          <option value="">Выберите должность (если нужно)</option>
          <option v-for="pos in positions" :key="pos.id" :value="pos.id">{{ pos.name }}</option>
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
          <span style="color: #888; font-size: 0.8em;">({{ h.changed_at ? h.changed_at.split('T')[0] : 'Дата неизвестна' }})</span>
        </li>
      </ul>
    </div>

    <!-- МОДАЛЬНОЕ ОКНО РЕДАКТИРОВАНИЯ (Паспорт и Адрес) -->
    <div v-if="isEditModalOpen" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
      <div style="background: white; padding: 20px; border-radius: 8px; width: 500px; max-height: 90vh; overflow-y: auto;">
        <h3>Редактирование: {{ editingEmployee.last_name }} {{ editingEmployee.first_name }}</h3>
        
        <h4>Основное</h4>
        <input v-model="editingEmployee.phone" placeholder="Телефон" style="width: 100%; padding: 8px; margin-bottom: 10px;" />

        <h4>Паспорт</h4>
        <input v-model="editingEmployee.passport_series" placeholder="Серия (4 цифры)" style="width: 100%; padding: 8px; margin-bottom: 10px;" />
        <input v-model="editingEmployee.passport_number" placeholder="Номер (6 цифр)" style="width: 100%; padding: 8px; margin-bottom: 10px;" />
        <input v-model="editingEmployee.passport_issue_date" type="date" placeholder="Дата выдачи" style="width: 100%; padding: 8px; margin-bottom: 10px;" />
        <input v-model="editingEmployee.passport_issued_by" placeholder="Кем выдан" style="width: 100%; padding: 8px; margin-bottom: 10px;" />
        <input v-model="editingEmployee.passport_department_code" placeholder="Код подразделения" style="width: 100%; padding: 8px; margin-bottom: 10px;" />

        <h4>Адрес регистрации</h4>
        <input v-model="editingEmployee.address_region" placeholder="Область" style="width: 100%; padding: 8px; margin-bottom: 10px;" />
        <input v-model="editingEmployee.address_city" placeholder="Город/Населенный пункт" style="width: 100%; padding: 8px; margin-bottom: 10px;" />
        <input v-model="editingEmployee.address_street" placeholder="Улица" style="width: 100%; padding: 8px; margin-bottom: 10px;" />
        <input v-model="editingEmployee.address_house" placeholder="Дом" style="width: 100%; padding: 8px; margin-bottom: 10px;" />
        <input v-model="editingEmployee.address_building" placeholder="Корпус" style="width: 100%; padding: 8px; margin-bottom: 10px;" />
        <input v-model="editingEmployee.address_apartment" placeholder="Квартира" style="width: 100%; padding: 8px; margin-bottom: 10px;" />

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
          <button @click="isEditModalOpen = false" style="padding: 8px 16px; cursor: pointer;">Отмена</button>
          <button @click="saveEmployeeChanges" style="padding: 8px 16px; background: #42b883; color: white; border: none; cursor: pointer;">Сохранить</button>
        </div>
      </div>
    </div>

  </div>
</template>