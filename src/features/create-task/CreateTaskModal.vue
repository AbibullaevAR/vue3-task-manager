<script setup lang="ts">
import { reactive, ref } from 'vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import type { TaskCreatePayload, TaskStatus, TaskPriority } from '@/entities/task/model/task.types'
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '@/entities/task/model/task.types'
import type { Project } from '@/entities/project/model/project.types'
import type { User } from '@/entities/user/model/user.types'

const props = defineProps<{
  projects: Project[]
  users: User[]
  defaultStatus?: TaskStatus
}>()

const emit = defineEmits<{
  submit: [payload: TaskCreatePayload]
  close: []
}>()

const isSubmitting = ref(false)

const form = reactive<TaskCreatePayload>({
  title: '',
  description: '',
  status: props.defaultStatus ?? 'todo',
  priority: 'medium',
  projectId: props.projects[0]?.id ?? '',
  assigneeId: undefined,
  tags: [],
  deadline: undefined,
  estimatedHours: undefined,
})

const tagsInput = ref('')

function addTag(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    const tag = tagsInput.value.trim().toLowerCase().replace(/,/g, '')
    if (tag && !form.tags!.includes(tag)) {
      form.tags = [...(form.tags ?? []), tag]
    }
    tagsInput.value = ''
  }
}

function removeTag(tag: string) {
  form.tags = form.tags!.filter((t) => t !== tag)
}

async function handleSubmit() {
  if (!form.title.trim() || !form.projectId) return
  isSubmitting.value = true
  try {
    emit('submit', { ...form })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal title="Create Task" width="580px" @close="$emit('close')">
    <form class="create-task-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label class="form-label">Title *</label>
        <input
          v-model="form.title"
          class="form-input"
          placeholder="Task title"
          required
          autofocus
        />
      </div>

      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea
          v-model="form.description"
          class="form-input form-input--textarea"
          placeholder="Describe the task..."
          rows="3"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Status</label>
          <select v-model="form.status" class="form-input">
            <option v-for="(cfg, s) in TASK_STATUS_CONFIG" :key="s" :value="s">
              {{ cfg.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Priority</label>
          <select v-model="form.priority" class="form-input">
            <option v-for="(cfg, p) in TASK_PRIORITY_CONFIG" :key="p" :value="p">
              {{ cfg.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Project *</label>
          <select v-model="form.projectId" class="form-input" required>
            <option v-for="proj in projects" :key="proj.id" :value="proj.id">
              {{ proj.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Assignee</label>
          <select v-model="form.assigneeId" class="form-input">
            <option value="">Unassigned</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Deadline</label>
          <input v-model="form.deadline" type="date" class="form-input" />
        </div>

        <div class="form-group">
          <label class="form-label">Est. hours</label>
          <input
            v-model.number="form.estimatedHours"
            type="number"
            min="0.5"
            step="0.5"
            class="form-input"
            placeholder="e.g. 4"
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Tags (press Enter or comma to add)</label>
        <div class="tag-input">
          <span v-for="tag in form.tags" :key="tag" class="tag-input__tag">
            {{ tag }}
            <button type="button" @click="removeTag(tag)">×</button>
          </span>
          <input
            v-model="tagsInput"
            class="tag-input__field"
            placeholder="Add tag..."
            @keydown="addTag"
          />
        </div>
      </div>
    </form>

    <template #footer>
      <BaseButton variant="secondary" @click="$emit('close')">Cancel</BaseButton>
      <BaseButton
        :loading="isSubmitting"
        :disabled="!form.title.trim() || !form.projectId"
        @click="handleSubmit"
      >
        Create Task
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style lang="scss" scoped>
.create-task-form { display: flex; flex-direction: column; gap: 1rem; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

.form-group { display: flex; flex-direction: column; gap: 0.375rem; }

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;

  &:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px #{var(--color-primary)}22; }
  &--textarea { resize: vertical; min-height: 80px; }
}

.tag-input {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: text;

  &:focus-within { border-color: var(--color-primary); }

  &__tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    background: var(--color-primary-light);
    color: var(--color-primary);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 500;

    button {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 0.875rem;
      line-height: 1;
      padding: 0;
    }
  }

  &__field {
    flex: 1;
    min-width: 80px;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text);
    font-size: 0.875rem;
    font-family: inherit;
  }
}
</style>
