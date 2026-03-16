<template>
  <v-form
    v-model="isFormValid"
    class="telebot-form"
    :disabled="!isEditing"
    @submit.prevent="saveTagForward"
  >
    <v-text-field v-model="form.tag" class="telebot-form__input" label="@Tag" :rules="rules" />
    <v-combobox
      v-model="form.to_chats"
      class="telebot-form__combobox"
      label="To chats (chat ID-s)"
      multiple
      chips
      closable-chips
      :rules="rules"
    />
    <v-combobox
      v-model="form.allowed_users"
      class="telebot-form__combobox"
      label="Allowed users (ID-s)"
      multiple
      chips
      closable-chips
      :rules="rules"
    />
    <v-btn v-if="isEditing" color="light-blue-darken-2" type="submit">Save</v-btn>
    <v-btn
      v-if="form.id && !isEditing"
      color="light-blue-darken-2"
      type="button"
      @click="isEditing = true"
    >
      Edit
    </v-btn>
    <v-btn
      color="red-lighten-1"
      type="button"
      aria-label="Delete"
      @click="handleWantToDeleteTagForward"
    >
      Delete
    </v-btn>
    <v-dialog v-model="isConfirmationDialogOpen" width="auto">
      <v-card>
        <v-card-text>Are you sure you want to delete this tag forward rule?</v-card-text>
        <v-card-actions>
          <v-btn
            color="light-blue-darken-2"
            aria-label="Cancel"
            @click="isConfirmationDialogOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn color="red-lighten-1" aria-label="Delete" @click="handleDeleteTagForward(form.id)">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="isSnackbarVisible"
      :timeout="1000"
      :color="snackbarColor"
      transition="scroll-y-reverse-transition"
    >
      {{ snackbarMessage }}
      <template #actions>
        <v-btn
          color="white"
          icon="mdi-close"
          aria-label="Close"
          @click="isSnackbarVisible = false"
        />
      </template>
    </v-snackbar>
  </v-form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import {
  useCreateTagForwardMutation,
  useDeleteTagForwardMutation,
  useEditTagForwardMutation,
} from '@/queries/tag-forwarder.query'
import useSnackbar from '@/composables/useSnackbar'

const { mutateAsync: createTagForwardMutation } = useCreateTagForwardMutation()
const { mutateAsync: editTagForwardMutation } = useEditTagForwardMutation()
const { mutateAsync: deleteTagForward } = useDeleteTagForwardMutation()
const { showSnackbar, isSnackbarVisible, snackbarColor, snackbarMessage } = useSnackbar()

const emits = defineEmits(['delete', 'upsert'])

const props = defineProps({
  tag: {
    type: String,
    default: undefined,
  },
  toChats: {
    type: Array,
    default: undefined,
  },
  allowedUsers: {
    type: Array,
    default: undefined,
  },
  forwardId: {
    type: Number,
    default: undefined,
  },
})

// This is used by Vuetify in the background. The form is valid if all fields pass validation.
const isFormValid = ref(false)

// Checking by forwardId prop to determine if it is a new forward or an existing one
// New rows should always automatically be in edit mode
const isEditing = ref(!props.forwardId)

const isConfirmationDialogOpen = ref(false)

const rules = [
  (value) => {
    if (value.length) return true

    return 'This field is required.'
  },
]

const form = reactive({
  tag: props.tag || '',
  to_chats: props.toChats || [],
  allowed_users: props.allowedUsers || [],
  id: props.forwardId || undefined,
})

const handleWantToDeleteTagForward = async () => {
  if (form.id) {
    // If the forward is already saved in the database, we need to confirm the deletion
    isConfirmationDialogOpen.value = true
  } else {
    // If the forward is not saved in the database, we can just delete it
    emits('delete')
  }
}

const handleDeleteTagForward = async (forwardId) => {
  try {
    await deleteTagForward(forwardId)

    // Emit the 'delete' event to notify the parent component
    emits('delete')
  } catch (error) {
    showSnackbar('Error deleting tag forward', 'red-lighten-1')
  }
  isConfirmationDialogOpen.value = false
}

const editTagForward = async () => {
  try {
    const editedTagForward = await editTagForwardMutation(form)

    // Update the form with the edited tag forward
    Object.assign(form, editedTagForward)

    // Emit the 'upsert' event to notify the parent component
    emits('upsert', form)

    showSnackbar('Tag forward successfully edited', 'green-darken-2')
    isEditing.value = false
  } catch (error) {
    showSnackbar('Error editing tag forward', 'red-lighten-1')
  }
}

const createTagForward = async () => {
  try {
    const newTagForward = await createTagForwardMutation(form)

    // Update the form with the newly created tag forward
    Object.assign(form, newTagForward)

    // Emit the 'upsert' event to notify the parent component
    emits('upsert', form)

    showSnackbar('Tag forward successfully created', 'green-darken-2')
    isEditing.value = false
  } catch (error) {
    showSnackbar('Error creating tag forward', 'red-lighten-1')
  }
}

const saveTagForward = async () => {
  if (isFormValid.value) {
    if (form.id) {
      // If the tag forward has an ID, trigger the edit process
      await editTagForward()
    } else {
      // If there's no ID, trigger the creation process
      await createTagForward()
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/components/form';
</style>
