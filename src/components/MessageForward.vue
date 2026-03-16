<template>
  <v-form
    v-model="isFormValid"
    class="telebot-form"
    :disabled="!isEditing"
    @submit.prevent="saveMessageForward"
  >
    <v-text-field
      v-model="form.from_chat"
      class="telebot-form__input"
      label="From (chat ID)"
      :rules="rules"
      required
    />
    <v-combobox
      v-model="form.to_chats"
      class="telebot-form__combobox"
      label="To chats (chat ID-s)"
      multiple
      chips
      closable-chips
      :rules="rules"
      required
    />
    <v-btn v-if="isEditing" color="light-blue-darken-2" type="submit" aria-label="Save">Save</v-btn>
    <v-btn
      v-if="form.id && !isEditing"
      color="light-blue-darken-2"
      type="button"
      aria-label="Edit"
      @click="isEditing = true"
    >
      Edit
    </v-btn>
    <v-btn
      color="red-lighten-1"
      type="button"
      aria-label="Delete"
      @click="handleWantToDeleteForward"
    >
      Delete
    </v-btn>
    <v-dialog v-model="isConfirmationDialogOpen" width="auto">
      <v-card>
        <v-card-text>Are you sure you want to delete this message forward rule?</v-card-text>
        <v-card-actions>
          <v-btn color="light-blue-darken-2" @click="isConfirmationDialogOpen = false">
            Cancel
          </v-btn>
          <v-btn color="red-lighten-1" @click="handleDeleteForward(form.id)">Delete</v-btn>
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
        <v-btn color="white" icon="mdi-close" @click="isSnackbarVisible = false" />
      </template>
    </v-snackbar>
  </v-form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import {
  useCreateMessageForwardMutation,
  useDeleteMessageForwardMutation,
  useEditMessageForwardMutation,
} from '@/queries/message-forwarder.query'
import useSnackbar from '@/composables/useSnackbar'

const { mutateAsync: createMessageForwardMutation } = useCreateMessageForwardMutation()
const { mutateAsync: editMessageForwardMutation } = useEditMessageForwardMutation()
const { mutateAsync: deleteForward } = useDeleteMessageForwardMutation()
const { showSnackbar, isSnackbarVisible, snackbarColor, snackbarMessage } = useSnackbar()

const emits = defineEmits(['delete', 'upsert'])

const props = defineProps({
  fromChat: {
    type: String,
    default: undefined,
  },
  toChats: {
    type: Array,
    default: undefined,
  },
  forwardId: {
    type: Number,
    default: undefined,
  },
})

const isConfirmationDialogOpen = ref(false)

// Checking by forwardId prop to determine if it is a new forward or an existing one
// New rows should always automatically be in edit mode
const isEditing = ref(!props.forwardId)

// This is used by Vuetify in the background. The form is valid if all fields pass validation.
const isFormValid = ref(false)

const form = reactive({
  from_chat: props.fromChat || '',
  to_chats: props.toChats || [],
  id: props.forwardId || undefined,
})

const rules = [
  (value) => {
    if (value.length) return true

    return 'This field is required.'
  },
]

const handleWantToDeleteForward = async () => {
  if (form.id) {
    // If the message forward has an ID, open the confirmation dialog
    isConfirmationDialogOpen.value = true
  } else {
    // If there's no ID, emit the 'delete' event directly (used for new unsaved message forward rows)
    emits('delete')
  }
}

const handleDeleteForward = async () => {
  try {
    await deleteForward(form.id)

    // Emit the 'delete' event to notify the parent component
    emits('delete')

    isConfirmationDialogOpen.value = false
  } catch (e) {
    showSnackbar('Error deleting message forward', 'red-lighten-1')
  }
}

const editMessageForward = async () => {
  try {
    const editedForward = await editMessageForwardMutation(form)

    // Update the form data with the newly created message forward
    Object.assign(form, editedForward)

    // Emit the 'upsert' event to notify the parent component of the update
    emits('upsert', form)

    showSnackbar('Message forward successfully edited', 'green-darken-2')
    isEditing.value = false
  } catch (e) {
    showSnackbar('Error editing message forward', 'red-lighten-1')
  }
}

const createMessageForward = async () => {
  try {
    const newForward = await createMessageForwardMutation(form)

    // Update the form data with the created message forward
    Object.assign(form, newForward)

    // Emit the 'upsert' event to notify the parent component of the update
    emits('upsert', form)
    showSnackbar('Message forward successfully created', 'green-darken-2')
    isEditing.value = false
  } catch (e) {
    showSnackbar('Error creating message forward', 'red-lighten-1')
  }
}

const saveMessageForward = async () => {
  if (isFormValid.value) {
    if (form.id) {
      // If the message forward has an ID, trigger the edit process
      await editMessageForward()
    } else {
      // If there's no ID, trigger the creation process
      await createMessageForward()
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/components/form';
</style>
