<script setup>
import { ref, onMounted, computed } from 'vue'
import { Notify } from 'quasar'

const showError = (error) => {
  const msg = error.response?.data?.message
    ? (Array.isArray(error.response.data.message) ? error.response.data.message.join(', ') : error.response.data.message)
    : (error.message || 'Что-то пошло не так')
  Notify.create({ type: 'negative', message: 'Ошибка: ' + msg })
}
const notifyOk = (message) => Notify.create({ type: 'positive', message })

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
    Notify.create({ type: 'warning', message: 'Введите логин и пароль' })
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
const selectedOrgId = ref(null)

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
const filterDepartmentId = ref(null)
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
  const emp = editingEmployee.value
  try {
    await fetch(`/api/employees/${emp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phone: emp.phone })
    })

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
      })
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
      })
    }

    isEditModalOpen.value = false
    fetchEmployees()
    notifyOk('Данные сохранены!')
  } catch (error) {
    showError(error)
  }
}

const getDepartmentName = (id) => {
  if (!id) return '-'
  const dep = departments.value.find(d => d.id === id)
  return dep ? dep.name : 'Не найден'
}
const getPositionName = (id) => {
  if (!id) return '-'
  const pos = positions.value.find(p => p.id === id)
  return pos ? pos.name : 'Не найден'
}

const filteredEmployees = computed(() => {
  let result = employees.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(e =>
      `${e.last_name} ${e.first_name} ${e.middle_name || ''}`.toLowerCase().includes(q)
    )
  }
  if (filterDepartmentId.value) {
    result = result.filter(e => e.department_id === filterDepartmentId.value)
  }
  return result
})

const employeeColumns = [
  { name: 'fio', label: 'ФИО', field: 'last_name', align: 'left' },
  { name: 'phone', label: 'Телефон', field: 'phone', align: 'left', format: v => v || '-' },
  { name: 'department', label: 'Отдел', field: r => getDepartmentName(r.department_id), align: 'left' },
  { name: 'position', label: 'Должность', field: r => getPositionName(r.position_id), align: 'left' },
  { name: 'status', label: 'Статус', field: r => r.dismissed_at ? 'Уволен' : 'Работает', align: 'left' },
  { name: 'actions', label: 'Действия', field: () => '', align: 'center' },
]

// --- ФАЙЛЫ ---
const files = ref([])
const fileEmployeeId = ref(null)
const fileCategoryId = ref(null)
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
const opEmployeeId = ref(null)
const opType = ref('hire')
const opSalary = ref('')
const opDepartmentId = ref(null)
const opPositionId = ref(null)

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
      const errData = await res.json()
      throw new Error(errData.message || 'Ошибка создания операции')
    }
    opEmployeeId.value = null
    opSalary.value = ''
    opDepartmentId.value = null
    opPositionId.value = null
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
const newUserRoleId = ref(null)
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
    Notify.create({ type: 'warning', message: 'Заполните все обязательные поля!' })
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
    newUserRoleId.value = null
    fetchUsers()
    notifyOk('Пользователь создан!')
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
    notifyOk('Пользователь обновлен!')
  } catch (error) { showError(error) }
}

const deleteUser = async (id) => {
  const user = users.value.find(u => u.id === id)

  if (user?.deleted_at) {
    Notify.create({
      type: 'warning',
      message: 'Этот пользователь уже удалён',
      timeout: 1500
    })
    return
  }

  if (!confirm('Удалить пользователя?')) return

  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || 'Ошибка удаления')
    }

    fetchUsers()
  } catch (error) {
    showError(error)
  }
}

const userColumns = [
  { name: 'fio', label: 'ФИО', field: 'last_name', align: 'left' },
  { name: 'login', label: 'Логин', field: 'login', align: 'left' },
  { name: 'role', label: 'Роль', field: 'role_name', align: 'left' },
  { name: 'status', label: 'Статус', field: r => r.deleted_at ? 'Удален' : 'Активен', align: 'left' },
  { name: 'actions', label: 'Действия', field: () => '', align: 'center' },
]

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
  <q-layout view="hHh lpR fFf">

    <!-- ЭКРАН ВХОДА -->
    <q-page-container v-if="!isAuthenticated">
      <q-page class="flex flex-center">
        <q-card class="q-pa-lg" style="width: 100%; max-width: 380px;">
          <q-card-section class="text-h5 text-center text-weight-bold">
            Вход в систему
          </q-card-section>
          <q-card-section class="q-gutter-y-md">
            <q-input v-model="loginInput" label="Логин" outlined @keyup.enter="login" />
            <q-input v-model="passwordInput" label="Пароль" type="password" outlined @keyup.enter="login" />
          </q-card-section>
          <q-card-actions align="center">
            <q-btn
              color="primary"
              unelevated
              class="full-width"
              :label="loggingIn ? 'Входим...' : 'Войти'"
              :loading="loggingIn"
              @click="login"
            />
          </q-card-actions>
        </q-card>
      </q-page>
    </q-page-container>

    <!-- ОСНОВНОЙ ИНТЕРФЕЙС -->
    <template v-else>
      <q-header elevated class="bg-primary text-white">
        <q-toolbar>
          <q-tabs v-model="activeTab" dense inline-label class="col-grow">
            <q-tab name="orgs" label="Организации" />
            <q-tab name="deps" label="Отделы" />
            <q-tab name="pos" label="Должности" />
            <q-tab name="emp" label="Сотрудники" />
            <q-tab name="files" label="Файлы" />
            <q-tab name="ops" label="Операции" />
            <q-tab name="history" label="История" />
            <q-tab v-if="currentUser?.role_name === 'admin'" name="users" label="Пользователи" />
          </q-tabs>
          <q-space />
          <span class="text-caption q-mr-sm">
            {{ currentUser?.last_name }} {{ currentUser?.first_name }} ({{ currentUser?.role_name }})
          </span>
          <q-btn flat label="Выйти" @click="logout" />
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page padding>

          <!-- ОРГАНИЗАЦИИ -->
          <div v-if="activeTab === 'orgs'">
            <div class="text-h5 q-mb-md">Организации</div>
            <div class="row items-center q-mb-md q-gutter-x-sm">
              <q-input v-model="newOrgName" label="Название" outlined dense class="col-grow" style="max-width: 400px;" @keyup.enter="createOrganization" />
              <q-btn color="primary" label="Добавить" unelevated @click="createOrganization" />
            </div>
            <q-list bordered separator>
              <q-item v-for="org in organizations" :key="org.id">
                <q-item-section>{{ org.name }}</q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-x-xs">
                    <q-btn flat round dense size="sm" color="primary" icon="edit" @click="editOrganization(org)">
                      <q-tooltip>Редактировать</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense size="sm" color="negative" icon="delete" @click="deleteOrganization(org.id)">
                      <q-tooltip>Удалить</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- ОТДЕЛЫ -->
          <div v-if="activeTab === 'deps'">
            <div class="text-h5 q-mb-md">Отделы</div>
            <div class="q-mb-md q-gutter-y-sm" style="max-width: 500px;">
              <q-select
                v-model="selectedOrgId"
                :options="organizations"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                clearable
                label="Организация"
                outlined
                dense
              />
              <div class="row items-center q-gutter-x-sm">
                <q-input v-model="newDepName" label="Название отдела" outlined dense class="col-grow" @keyup.enter="createDepartment" />
                <q-btn color="primary" label="Добавить" unelevated @click="createDepartment" />
              </div>
            </div>
            <q-list bordered separator>
              <q-item v-for="dep in departments" :key="dep.id">
                <q-item-section>
                  {{ dep.name }}
                  <q-item-label caption>{{ organizations.find(o => o.id === dep.organization_id)?.name || '—' }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-x-xs">
                    <q-btn flat round dense size="sm" color="primary" icon="edit" @click="editDepartment(dep)">
                      <q-tooltip>Редактировать</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense size="sm" color="negative" icon="delete" @click="deleteDepartment(dep.id)">
                      <q-tooltip>Удалить</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- ДОЛЖНОСТИ -->
          <div v-if="activeTab === 'pos'">
            <div class="text-h5 q-mb-md">Должности</div>
            <div class="row items-center q-mb-md q-gutter-x-sm">
              <q-input v-model="newPosName" label="Название должности" outlined dense class="col-grow" style="max-width: 400px;" @keyup.enter="createPosition" />
              <q-btn color="primary" label="Добавить" unelevated @click="createPosition" />
            </div>
            <q-list bordered separator>
              <q-item v-for="pos in positions" :key="pos.id">
                <q-item-section>{{ pos.name }}</q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-x-xs">
                    <q-btn flat round dense size="sm" color="primary" icon="edit" @click="editPosition(pos)">
                      <q-tooltip>Редактировать</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense size="sm" color="negative" icon="delete" @click="deletePosition(pos.id)">
                      <q-tooltip>Удалить</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- СОТРУДНИКИ -->
          <div v-if="activeTab === 'emp'">
            <div class="text-h5 q-mb-md">Сотрудники</div>
            <div class="row q-mb-md q-gutter-x-sm">
              <q-input v-model="searchQuery" label="Поиск по ФИО" outlined dense clearable class="col-grow" style="max-width: 250px;" />
              <q-select
                v-model="filterDepartmentId"
                :options="departments"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                clearable
                label="Все отделы"
                outlined
                dense
                style="min-width: 200px;"
              />
            </div>
            <div class="row items-center q-mb-md q-gutter-x-sm">
              <q-input v-model="newEmpLastName" label="Фамилия" outlined dense style="width: 160px;" />
              <q-input v-model="newEmpFirstName" label="Имя" outlined dense style="width: 160px;" />
              <q-input v-model="newEmpBirthDate" label="Дата рождения" type="date" outlined dense />
              <q-btn color="primary" label="Добавить" unelevated @click="createEmployee" />
            </div>
            <q-table
              :rows="filteredEmployees"
              :columns="employeeColumns"
              row-key="id"
              flat
              bordered
              dense
              :pagination="{ rowsPerPage: 0 }"
            >
              <template #body-cell-fio="props">
                <q-td :props="props">{{ props.row.last_name }} {{ props.row.first_name }} {{ props.row.middle_name }}</q-td>
              </template>
              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-badge :color="props.row.dismissed_at ? 'negative' : 'positive'" :label="props.row.dismissed_at ? 'Уволен' : 'Работает'" />
                </q-td>
              </template>
              <template #body-cell-actions="props">
                <q-td :props="props">
                  <q-btn v-if="!props.row.dismissed_at" flat round dense size="sm" color="primary" icon="edit" @click="openEditModal(props.row)">
                    <q-tooltip>Редактировать</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </div>

          <!-- ФАЙЛЫ -->
          <div v-if="activeTab === 'files'">
            <div class="text-h5 q-mb-md">Файлы (Сканы)</div>
            <div class="q-mb-md q-gutter-y-sm" style="max-width: 500px;">
              <q-select
                v-model="fileEmployeeId"
                :options="employees"
                option-value="id"
                option-label="last_name"
                emit-value
                map-options
                label="Сотрудник"
                outlined
                dense
              />
              <q-select
                v-model="fileCategoryId"
                :options="categories"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                clearable
                label="Категория (необязательно)"
                outlined
                dense
              />
              <q-input v-model="fileName" label="Название файла" outlined dense />
              <div class="row items-center q-gutter-x-sm">
                <q-file v-model="fileInput" label="Выбрать файл" outlined dense clearable class="col-grow" />
                <q-btn color="primary" label="Загрузить" unelevated @click="uploadFile" />
              </div>
            </div>
            <q-list bordered separator>
              <q-item v-for="file in files" :key="file.id">
                <q-item-section>
                  {{ file.name }}
                  <q-item-label caption>
                    <a :href="`/api/files/${file.id}/download`" target="_blank">Скачать</a>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense size="sm" color="negative" icon="delete" @click="deleteFile(file.id)">
                    <q-tooltip>Удалить</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- ОПЕРАЦИИ -->
          <div v-if="activeTab === 'ops'">
            <div class="text-h5 q-mb-md">Кадровые операции</div>
            <div class="q-mb-md q-gutter-y-sm" style="max-width: 500px;">
              <q-select
                v-model="opEmployeeId"
                :options="employees"
                option-value="id"
                option-label="last_name"
                emit-value
                map-options
                label="Сотрудник"
                outlined
                dense
              />
              <q-select
                v-model="opType"
                :options="[
                  { label: 'Прием на работу', value: 'hire' },
                  { label: 'Установка зарплаты', value: 'salary_set' },
                  { label: 'Изменение зарплаты', value: 'salary_change' },
                  { label: 'Изменение отдела', value: 'department_change' },
                  { label: 'Увольнение', value: 'dismissal' }
                ]"
                emit-value
                map-options
                label="Тип операции"
                outlined
                dense
              />
              <q-select
                v-model="opDepartmentId"
                :options="departments"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                clearable
                label="Отдел (если нужно)"
                outlined
                dense
              />
              <q-select
                v-model="opPositionId"
                :options="positions"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                clearable
                label="Должность (если нужно)"
                outlined
                dense
              />
              <q-input v-model="opSalary" type="number" label="Зарплата (опционально)" outlined dense />
              <q-btn color="primary" label="Добавить" unelevated @click="createOperation" />
            </div>
            <q-list bordered separator>
              <q-item v-for="op in operations" :key="op.id">
                <q-item-section>
                  <q-item-label>{{ op.operation_type }}</q-item-label>
                  <q-item-label v-if="op.salary" caption>Зарплата: {{ op.salary }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round dense size="sm" color="negative" icon="delete" @click="deleteOperation(op.id)">
                    <q-tooltip>Удалить</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- ИСТОРИЯ -->
          <div v-if="activeTab === 'history'">
            <div class="text-h5 q-mb-md">История изменений</div>
            <q-list bordered separator>
              <q-item v-for="h in history" :key="h.id">
                <q-item-section>
                  <q-item-label>{{ h.field_name }}: {{ h.old_value }} → {{ h.new_value }}</q-item-label>
                  <q-item-label caption>{{ h.changed_at ? h.changed_at.split('T')[0] : 'Дата неизвестна' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- ПОЛЬЗОВАТЕЛИ (только админ) -->
          <div v-if="activeTab === 'users'">
            <div class="text-h5 q-mb-md">Управление пользователями</div>
            <q-card class="q-mb-md" flat bordered style="max-width: 500px;">
              <q-card-section class="text-h6">Добавить нового пользователя</q-card-section>
              <q-card-section class="q-gutter-y-sm">
                <q-input v-model="newUserLastName" label="Фамилия *" outlined dense />
                <q-input v-model="newUserFirstName" label="Имя *" outlined dense />
                <q-input v-model="newUserMiddleName" label="Отчество" outlined dense />
                <q-input v-model="newUserLogin" label="Логин *" outlined dense />
                <q-input v-model="newUserPassword" label="Пароль *" type="password" outlined dense />
                <q-select
                  v-model="newUserRoleId"
                  :options="roles"
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  label="Роль *"
                  outlined
                  dense
                />
              </q-card-section>
              <q-card-actions>
                <q-btn color="primary" label="Создать пользователя" unelevated @click="createUser" />
              </q-card-actions>
            </q-card>

            <q-table
              :rows="users"
              :columns="userColumns"
              row-key="id"
              flat
              bordered
              dense
              :pagination="{ rowsPerPage: 0 }"
            >
              <template #body-cell-fio="props">
                <q-td :props="props">{{ props.row.last_name }} {{ props.row.first_name }} {{ props.row.middle_name }}</q-td>
              </template>
              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-badge :color="props.row.deleted_at ? 'negative' : 'positive'" :label="props.row.deleted_at ? 'Удален' : 'Активен'" />
                </q-td>
              </template>
              <template #body-cell-actions="props">
                <q-td :props="props">
                  <div v-if="!props.row.deleted_at" class="row justify-end q-gutter-x-sm">
                    <q-btn flat round dense size="sm" color="primary" icon="edit" @click="openEditUser(props.row)">
                      <q-tooltip>Редактировать</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense size="sm" color="negative" icon="delete" @click="deleteUser(props.row.id)">
                      <q-tooltip>Удалить</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </template>
            </q-table>
          </div>

          <!-- МОДАЛКА РЕДАКТИРОВАНИЯ СОТРУДНИКА -->
          <q-dialog v-model="isEditModalOpen">
            <q-card style="width: 560px; max-width: 95vw;">
              <q-card-section class="text-h6">
                Редактирование: {{ editingEmployee.last_name }} {{ editingEmployee.first_name }}
              </q-card-section>
              <q-card-section class="q-gutter-y-sm">
                <div class="text-subtitle2">Основное</div>
                <q-input v-model="editingEmployee.phone" label="Телефон" outlined dense />
                <div class="text-subtitle2 q-mt-sm">Паспорт</div>
                <q-input v-model="editingEmployee.passport_series" label="Серия (4 цифры)" outlined dense />
                <q-input v-model="editingEmployee.passport_number" label="Номер (6 цифры)" outlined dense />
                <q-input v-model="editingEmployee.passport_issue_date" label="Дата выдачи" type="date" outlined dense />
                <q-input v-model="editingEmployee.passport_issued_by" label="Кем выдан" outlined dense />
                <q-input v-model="editingEmployee.passport_department_code" label="Код подразделения" outlined dense />
                <div class="text-subtitle2 q-mt-sm">Адрес регистрации</div>
                <q-input v-model="editingEmployee.address_region" label="Область" outlined dense />
                <q-input v-model="editingEmployee.address_city" label="Город / населенный пункт" outlined dense />
                <q-input v-model="editingEmployee.address_street" label="Улица" outlined dense />
                <q-input v-model="editingEmployee.address_house" label="Дом" outlined dense />
                <q-input v-model="editingEmployee.address_building" label="Корпус" outlined dense />
                <q-input v-model="editingEmployee.address_apartment" label="Квартира" outlined dense />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Отмена" v-close-popup />
                <q-btn color="primary" label="Сохранить" unelevated @click="saveEmployeeChanges" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <!-- МОДАЛКА РЕДАКТИРОВАНИЯ ПОЛЬЗОВАТЕЛЯ -->
          <q-dialog v-model="isUserModalOpen">
            <q-card style="width: 420px; max-width: 95vw;">
              <q-card-section class="text-h6">Редактирование: {{ editingUser.login }}</q-card-section>
              <q-card-section class="q-gutter-y-sm">
                <q-input v-model="editingUser.last_name" label="Фамилия" outlined dense />
                <q-input v-model="editingUser.first_name" label="Имя" outlined dense />
                <q-input v-model="editingUser.middle_name" label="Отчество" outlined dense />
                <q-select
                  v-model="editingUser.role_id"
                  :options="roles"
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  label="Роль"
                  outlined
                  dense
                />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Отмена" v-close-popup />
                <q-btn color="primary" label="Сохранить" unelevated @click="saveUserChanges" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

        </q-page>
      </q-page-container>
    </template>

  </q-layout>
</template>
