<script setup>
import { ref, onMounted, computed } from 'vue'

const showError = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    const msg = error.response.data.message;
    alert('Ошибка: ' + (Array.isArray(msg) ? msg.join(', ') : msg));
  } else {
    alert('Ошибка: ' + (error.message || 'Что-то пошло не так'));
  }
}

// --- СОСТОЯНИЕ ВХОДА ---
const isAuthenticated = ref(false)
const currentUser = ref(null)
const loginInput = ref('')
const passwordInput = ref('')
const loggingIn = ref(false)

const checkAuth = async () => {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' })
    if (res.ok) {
      currentUser.value = await res.json()
      isAuthenticated.value = true
    }
  } catch (e) { /* не залогинен */ }
}

const login = async () => {
  if (!loginInput.value || !passwordInput.value) {
    alert('Введите логин и пароль')
    return
  }
  loggingIn.value = true
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ login: loginInput.value, password: passwordInput.value })
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Неверный логин или пароль')
    }
    currentUser.value = await res.json()
    isAuthenticated.value = true
    loginInput.value = ''
    passwordInput.value = ''
    loadAll()
  } catch (error) {
    showError(error)
  } finally {
    loggingIn.value = false
  }
}

const logout = async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  } catch (e) { /* игнорируем */ }
  isAuthenticated.value = false
  currentUser.value = null
}

// --- ТАБЫ ---
const activeTab = ref('orgs')

// --- ОРГАНИЗАЦИИ ---
const organizations = ref([])
const newOrgName = ref('')

const fetchOrganizations = async () => {
  try {
    const res = await fetch('/api/organizations', { credentials: 'include' })
    if (res.ok) organizations.value = await res.json()
  } catch (error) { showError(error) }
}
const createOrganization = async () => {
  if (!newOrgName.value) return
  try {
    const res = await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
    const res = await fetch(`/api/organizations/${id}`, { method: 'DELETE', credentials: 'include' })
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
        credentials: 'include',
        body: JSON.stringify({ name: newName })
      })
      if (!res.ok) throw new Error('Ошибка обновления')
      fetchOrganizations()
    } catch (error) { showError(error) }
  }
}

// --- ОТДЕЛЫ ---
const departments = ref([])
const newDepName = ref('')
const selectedOrgId = ref('')

const fetchDepartments = async () => {
  try {
    const res = await fetch('/api/departments', { credentials: 'include' })
    if (res.ok) departments.value = await res.json()
  } catch (error) { showError(error) }
}
const createDepartment = async () => {
  if (!newDepName.value || !selectedOrgId.value) return
  try {
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
    const res = await fetch(`/api/departments/${id}`, { method: 'DELETE', credentials: 'include' })
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
        credentials: 'include',
        body: JSON.stringify({ name: newName })
      })
      if (!res.ok) throw new Error('Ошибка обновления')
      fetchDepartments()
    } catch (error) { showError(error) }
  }
}

// --- ДОЛЖНОСТИ ---
const positions = ref([])
const newPosName = ref('')

const fetchPositions = async () => {
  try {
    const res = await fetch('/api/positions', { credentials: 'include' })
    if (res.ok) positions.value = await res.json()
  } catch (error) { showError(error) }
}
const createPosition = async () => {
  if (!newPosName.value) return
  try {
    const res = await fetch('/api/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
    const res = await fetch(`/api/positions/${id}`, { method: 'DELETE', credentials: 'include' })
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
        credentials: 'include',
        body: JSON.stringify({ name: newName })
      })
      if (!res.ok) throw new Error('Ошибка обновления')
      fetchPositions()
    } catch (error) { showError(error) }
  }
}

// --- СОТРУДНИКИ ---
const employees = ref([])
const newEmpLastName = ref('')
const newEmpFirstName = ref('')
const newEmpBirthDate = ref('')
const searchQuery = ref('')
const filterDepartmentId = ref('')
const isEditModalOpen = ref(false)
const editingEmployee = ref({})

const fetchEmployees = async () => {
  try {
    const res = await fetch('/api/employees', { credentials: 'include' })
    if (res.ok) employees.value = await res.json()
  } catch (error) { showError(error) }
}
const createEmployee = async () => {
  if (!newEmpLastName.value || !newEmpFirstName.value || !newEmpBirthDate.value) return
  try {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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

const openEditModal = (emp) => {
  editingEmployee.value = { ...emp }
  isEditModalOpen.value = true
}

const saveEmployeeChanges = async () => {
  const emp = editingEmployee.value;
  try {
    await fetch(`/api/employees/${emp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phone: emp.phone })
    });

    if (emp.passport_series) {
      await fetch('/api/passports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
        credentials: 'include',
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

// --- ФАЙЛЫ ---
const files = ref([])
const fileEmployeeId = ref('')
const fileCategoryId = ref('')
const fileInput = ref(null)
const fileName = ref('')
const categories = ref([])

const fetchFiles = async () => {
  try {
    const res = await fetch('/api/files', { credentials: 'include' })
    if (res.ok) files.value = await res.json()
  } catch (error) { showError(error) }
}
const fetchCategories = async () => {
  try {
    const res = await fetch('/api/file-categories', { credentials: 'include' })
    if (res.ok) categories.value = await res.json()
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

    const res = await fetch('/api/files', { method: 'POST', body: formData, credentials: 'include' })
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
    const res = await fetch(`/api/files/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!res.ok) throw new Error('Ошибка удаления')
    fetchFiles()
  } catch (error) { showError(error) }
}

// --- КАДРОВЫЕ ОПЕРАЦИИ ---
const operations = ref([])
const opEmployeeId = ref('')
const opType = ref('hire')
const opSalary = ref('')
const opDepartmentId = ref('')
const opPositionId = ref('')

const fetchOperations = async () => {
  try {
    const res = await fetch('/api/hr-operations', { credentials: 'include' })
    if (res.ok) operations.value = await res.json()
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
      credentials: 'include',
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
    const res = await fetch(`/api/hr-operations/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!res.ok) throw new Error('Ошибка удаления')
    fetchOperations()
    fetchEmployees()
  } catch (error) { showError(error) }
}

// --- ИСТОРИЯ ---
const history = ref([])

const fetchHistory = async () => {
  try {
    const res = await fetch('/api/change-history', { credentials: 'include' })
    if (res.ok) history.value = await res.json()
  } catch (error) { showError(error) }
}

// --- ПОЛЬЗОВАТЕЛИ ---
const users = ref([])
const newUserLastName = ref('')
const newUserFirstName = ref('')
const newUserMiddleName = ref('')
const newUserLogin = ref('')
const newUserPassword = ref('')
const newUserRoleId = ref('')
const roles = ref([])
const isUserModalOpen = ref(false)
const editingUser = ref({})

const fetchRoles = async () => {
  try {
    const res = await fetch('/api/roles', { credentials: 'include' })
    if (res.ok) roles.value = await res.json()
  } catch (error) { showError(error) }
}

const fetchUsers = async () => {
  try {
    const res = await fetch('/api/users', { credentials: 'include' })
    if (res.ok) {
      users.value = await res.json()
    } else if (res.status === 401) {
      isAuthenticated.value = false
    }
  } catch (error) { showError(error) }
}

const createUser = async () => {
  if (!newUserLastName.value || !newUserFirstName.value || !newUserLogin.value || !newUserPassword.value || !newUserRoleId.value) {
    alert('Заполните все обязательные поля!')
    return
  }
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        last_name: newUserLastName.value,
        first_name: newUserFirstName.value,
        middle_name: newUserMiddleName.value,
        login: newUserLogin.value,
        password: newUserPassword.value,
        role_id: newUserRoleId.value
      })
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.message || 'Ошибка создания пользователя')
    }
    newUserLastName.value = ''
    newUserFirstName.value = ''
    newUserMiddleName.value = ''
    newUserLogin.value = ''
    newUserPassword.value = ''
    newUserRoleId.value = ''
    fetchUsers()
    alert('Пользователь создан!')
  } catch (error) { showError(error) }
}

const openEditUser = (user) => {
  editingUser.value = { ...user }
  isUserModalOpen.value = true
}

const saveUserChanges = async () => {
  try {
    const res = await fetch(`/api/users/${editingUser.value.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        last_name: editingUser.value.last_name,
        first_name: editingUser.value.first_name,
        middle_name: editingUser.value.middle_name,
        role_id: editingUser.value.role_id
      })
    })
    if (!res.ok) throw new Error('Ошибка обновления')
    isUserModalOpen.value = false
    fetchUsers()
    alert('Пользователь обновлен!')
  } catch (error) { showError(error) }
}

const deleteUser = async (id) => {
  if (!confirm('Удалить пользователя?')) return
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!res.ok) throw new Error('Ошибка удаления')
    fetchUsers()
  } catch (error) { showError(error) }
}

// --- ЗАПУСК ---
const loadAll = () => {
  fetchOrganizations()
  fetchDepartments()
  fetchPositions()
  fetchEmployees()
  fetchFiles()
  fetchCategories()
  fetchOperations()
  fetchHistory()
  if (currentUser.value?.role_name === 'admin') {
    fetchUsers()
    fetchRoles()
  }
}

onMounted(async () => {
  await checkAuth()
  if (isAuthenticated.value) {
    loadAll()
  }
})
</script>

<template>
  <div style="padding: 20px; font-family: sans-serif; max-width: 900px; margin: 0 auto;">

    <!-- ЭКРАН ВХОДА -->
    <div v-if="!isAuthenticated" style="max-width: 360px; margin: 80px auto; border: 1px solid #ddd; border-radius: 8px; padding: 30px;">
      <h2 style="text-align: center;">Вход в систему</h2>
      <input v-model="loginInput" placeholder="Логин" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
      <input v-model="passwordInput" type="password" placeholder="Пароль" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;" @keyup.enter="login" />
      <button @click="login" :disabled="loggingIn" style="width: 100%; padding: 10px; background: #42b983; color: white; border: none; cursor: pointer;">
        {{ loggingIn ? 'Входим...' : 'Войти' }}
      </button>
    </div>

    <!-- ОСНОВНОЙ ИНТЕРФЕЙС -->
    <div v-else>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; align-items: center;">
        <button @click="activeTab = 'orgs'" :style="{ fontWeight: activeTab === 'orgs' ? 'bold' : 'normal' }">Организации</button>
        <button @click="activeTab = 'deps'" :style="{ fontWeight: activeTab === 'deps' ? 'bold' : 'normal' }">Отделы</button>
        <button @click="activeTab = 'pos'" :style="{ fontWeight: activeTab === 'pos' ? 'bold' : 'normal' }">Должности</button>
        <button @click="activeTab = 'emp'" :style="{ fontWeight: activeTab === 'emp' ? 'bold' : 'normal' }">Сотрудники</button>
        <button @click="activeTab = 'files'" :style="{ fontWeight: activeTab === 'files' ? 'bold' : 'normal' }">Файлы</button>
        <button @click="activeTab = 'ops'" :style="{ fontWeight: activeTab === 'ops' ? 'bold' : 'normal' }">Операции</button>
        <button @click="activeTab = 'history'" :style="{ fontWeight: activeTab === 'history' ? 'bold' : 'normal' }">История</button>
        
        <button v-if="currentUser?.role_name === 'admin'" @click="activeTab = 'users'" :style="{ fontWeight: activeTab === 'users' ? 'bold' : 'normal' }">Пользователи</button>
        
        <span style="margin-left: auto; font-size: 0.9em; color: #555;">
          {{ currentUser?.last_name }} {{ currentUser?.first_name }} ({{ currentUser?.role_name }})
        </span>
        <button @click="logout" style="cursor: pointer;">Выйти</button>
      </div>

      <!-- ОРГАНИЗАЦИИ -->
      <div v-if="activeTab === 'orgs'">
        <h2>Организации</h2>
        <div style="margin-bottom: 20px;">
          <input v-model="newOrgName" placeholder="Название" style="padding: 8px; width: 60%;" />
          <button @click="createOrganization" style="padding: 8px 16px; margin-left: 10px; background: #42b983; color: white; border: none; cursor: pointer;">Добавить</button>
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

      <!-- ОТДЕЛЫ -->
      <div v-if="activeTab === 'deps'">
        <h2>Отделы</h2>
        <div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px;">
          <select v-model="selectedOrgId" style="padding: 8px;">
            <option value="" disabled>Выберите организацию</option>
            <option v-for="org in organizations" :key="org.id" :value="org.id">{{ org.name }}</option>
          </select>
          <div>
            <input v-model="newDepName" placeholder="Название отдела" style="padding: 8px; width: 60%;" />
            <button @click="createDepartment" style="padding: 8px 16px; margin-left: 10px; background: #42b983; color: white; border: none; cursor: pointer;">Добавить</button>
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

      <!-- ДОЛЖНОСТИ -->
      <div v-if="activeTab === 'pos'">
        <h2>Должности</h2>
        <div style="margin-bottom: 20px;">
          <input v-model="newPosName" placeholder="Название должности" style="padding: 8px; width: 60%;" />
          <button @click="createPosition" style="padding: 8px 16px; margin-left: 10px; background: #42b983; color: white; border: none; cursor: pointer;">Добавить</button>
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

      <!-- СОТРУДНИКИ -->
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
          <button @click="createEmployee" style="padding: 8px 16px; background: #42b983; color: white; border: none; cursor: pointer;">Добавить</button>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th>ФИО</th><th>Телефон</th><th>Отдел</th><th>Должность</th><th>Статус</th><th>Действия</th>
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
              <td><button v-if="!emp.dismissed_at" @click="openEditModal(emp)" style="cursor: pointer;">✏️</button></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ФАЙЛЫ -->
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
            <button @click="uploadFile" style="padding: 8px 16px; background: #42b983; color: white; border: none; cursor: pointer;">Загрузить</button>
          </div>
        </div>
        <ul>
          <li v-for="file in files" :key="file.id" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
           <span><strong>{{ file.name }}</strong> <a :href="`/api/files/${file.id}/download`" target="_blank" style="margin-left: 10px; color: blue;">(Скачать)</a></span>
            <span><button @click="deleteFile(file.id)" style="color: red; cursor: pointer;">❌</button></span>
          </li>
        </ul>
      </div>

      <!-- ОПЕРАЦИИ -->
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
          <button @click="createOperation" style="padding: 8px 16px; background: #42b983; color: white; border: none; cursor: pointer;">Добавить</button>
        </div>
        <ul>
          <li v-for="op in operations" :key="op.id" style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
            <span><strong>{{ op.operation_type }}</strong> <span v-if="op.salary">(Зарплата: {{ op.salary }})</span></span>
            <span><button @click="deleteOperation(op.id)" style="color: red; cursor: pointer;">❌</button></span>
          </li>
        </ul>
      </div>

      <!-- ИСТОРИЯ -->
      <div v-if="activeTab === 'history'">
        <h2>История изменений</h2>
        <ul>
          <li v-for="h in history" :key="h.id" style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>{{ h.field_name }}</strong>: {{ h.old_value }} → {{ h.new_value }}
            <span style="color: #888; font-size: 0.8em;">({{ h.changed_at ? h.changed_at.split('T')[0] : 'Дата неизвестна' }})</span>
          </li>
        </ul>
      </div>

      <!-- ПОЛЬЗОВАТЕЛИ -->
      <div v-if="activeTab === 'users'">
        <h2>Управление пользователями</h2>
        <div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px; border: 1px solid #ccc; padding: 15px; border-radius: 8px;">
          <h3>Добавить нового пользователя</h3>
          <input v-model="newUserLastName" placeholder="Фамилия *" style="padding: 8px;" />
          <input v-model="newUserFirstName" placeholder="Имя *" style="padding: 8px;" />
          <input v-model="newUserMiddleName" placeholder="Отчество" style="padding: 8px;" />
          <input v-model="newUserLogin" placeholder="Логин *" style="padding: 8px;" />
          <input v-model="newUserPassword" type="password" placeholder="Пароль *" style="padding: 8px;" />
          <select v-model="newUserRoleId" style="padding: 8px;">
            <option value="" disabled>Выберите роль *</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
          <button @click="createUser" style="padding: 8px 16px; background: #42b983; color: white; border: none; cursor: pointer;">Создать пользователя</button>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #f0f0f0;"><th>ФИО</th><th>Логин</th><th>Роль</th><th>Статус</th><th>Действия</th></tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" style="border-bottom: 1px solid #eee;">
              <td>{{ user.last_name }} {{ user.first_name }} {{ user.middle_name }}</td>
              <td>{{ user.login }}</td>
              <td>{{ user.role_name }}</td>
              <td>
                <span v-if="user.deleted_at" style="color: red;">Удален</span>
                <span v-else style="color: green;">Активен</span>
              </td>
              <td>
                <button @click="openEditUser(user)" style="margin-right: 5px; cursor: pointer;">✏️</button>
                <button @click="deleteUser(user.id)" style="color: red; cursor: pointer;">❌</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- МОДАЛКА РЕДАКТИРОВАНИЯ СОТРУДНИКА -->
      <div v-if="isEditModalOpen" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
        <div style="background: white; padding: 20px; border-radius: 8px; width: 500px; max-height: 90vh; overflow-y: auto;">
          <h3>Редактирование: {{ editingEmployee.last_name }} {{ editingEmployee.first_name }}</h3>
          <h4>Основное</h4>
          <input v-model="editingEmployee.phone" placeholder="Телефон" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <h4>Паспорт</h4>
          <input v-model="editingEmployee.passport_series" placeholder="Серия (4 цифры)" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <input v-model="editingEmployee.passport_number" placeholder="Номер (6 цифр)" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <input v-model="editingEmployee.passport_issue_date" type="date" placeholder="Дата выдачи" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <input v-model="editingEmployee.passport_issued_by" placeholder="Кем выдан" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <input v-model="editingEmployee.passport_department_code" placeholder="Код подразделения" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <h4>Адрес регистрации</h4>
          <input v-model="editingEmployee.address_region" placeholder="Область" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <input v-model="editingEmployee.address_city" placeholder="Город/Населенный пункт" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <input v-model="editingEmployee.address_street" placeholder="Улица" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <input v-model="editingEmployee.address_house" placeholder="Дом" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <input v-model="editingEmployee.address_building" placeholder="Корпус" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <input v-model="editingEmployee.address_apartment" placeholder="Квартира" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button @click="isEditModalOpen = false" style="padding: 8px 16px; cursor: pointer;">Отмена</button>
            <button @click="saveEmployeeChanges" style="padding: 8px 16px; background: #42b983; color: white; border: none; cursor: pointer;">Сохранить</button>
          </div>
        </div>
      </div>

      <!-- МОДАЛКА РЕДАКТИРОВАНИЯ ПОЛЬЗОВАТЕЛЯ -->
      <div v-if="isUserModalOpen" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
        <div style="background: white; padding: 20px; border-radius: 8px; width: 400px;">
          <h3>Редактирование: {{ editingUser.login }}</h3>
          <input v-model="editingUser.last_name" placeholder="Фамилия" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <input v-model="editingUser.first_name" placeholder="Имя" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <input v-model="editingUser.middle_name" placeholder="Отчество" style="width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box;" />
          <select v-model="editingUser.role_id" style="width: 100%; padding: 8px; margin-bottom: 20px; box-sizing: border-box;">
            <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button @click="isUserModalOpen = false" style="padding: 8px 16px; cursor: pointer;">Отмена</button>
            <button @click="saveUserChanges" style="padding: 8px 16px; background: #42b983; color: white; border: none; cursor: pointer;">Сохранить</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>