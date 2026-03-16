<template>
  <v-form
    v-model="isFormValid"
    class="telebot-form"
    :disabled="!isEditing"
    @submit.prevent="saveTagGroup"
  >
    <v-text-field v-model="form.tag" class="telebot-form__input" label="@Tag" :rules="rules" />
    <v-combobox
      v-model="form.usernames"
      class="telebot-form__combobox"
      label="Usernames"
      multiple
      chips
      closable-chips
      :rules="rules"
    />
    <v-btn v-if="isEditing" color="light-blue-darken-2" type="submit" aria-label="Save">Save</v-btn>
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
      @click="handleWantToDeleteTagGroup"
    >
      Delete
    </v-btn>
    <v-dialog v-model="isConfirmationDialogOpen" width="auto">
      <v-card>
        <v-card-text>Are you sure you want to delete this tag group rule?</v-card-text>
        <v-card-actions>
          <v-btn
            color="light-blue-darken-2"
            aria-label="Cancel"
            @click="isConfirmationDialogOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn color="red-lighten-1" aria-label="Delete" @click="handleDeleteTagGroup(form.id)">
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
          aria-label="close"
          @click="isSnackbarVisible = false"
        />
      </template>
    </v-snackbar>
  </v-form>
</template>

<script setup>
import { reactive, ref } from 'vue'
import {
  useCreateTagGroupMutation,
  useDeleteTagGroupMutation,
  useEditTagGroupMutation,
} from '@/queries/tag-grouper.query'
import useSnackbar from '@/composables/useSnackbar'

const { mutateAsync: createTagGroupMutation } = useCreateTagGroupMutation()
const { mutateAsync: editTagGroupMutation } = useEditTagGroupMutation()
const { mutateAsync: deleteTagGroup } = useDeleteTagGroupMutation()
const { showSnackbar, isSnackbarVisible, snackbarColor, snackbarMessage } = useSnackbar()

const emits = defineEmits(['delete', 'upsert'])

const props = defineProps({
  tag: {
    type: String,
    default: undefined,
  },
  usernames: {
    type: Array,
    default: undefined,
  },
  tagId: {
    type: Number,
    default: undefined,
  },
})

const isConfirmationDialogOpen = ref(false)

// Checking by tagId prop to determine if it is a new tag group or an existing one
// New rows should always automatically be in edit mode
const isEditing = ref(!props.tagId)

// This is used by Vuetify in the background. The form is valid if all fields pass validation.
const isFormValid = ref(false)

const rules = [
  (value) => {
    if (value.length) return true

    return 'This field is required.'
  },
]

const form = reactive({
  tag: props.tag || '',
  usernames: props.usernames || [],
  id: props.tagId || undefined,
})

const handleWantToDeleteTagGroup = async () => {
  if (form.id) {
    // If the tag group is already saved in the database, we need to confirm the deletion
    isConfirmationDialogOpen.value = true
  } else {
    // If the tag group is not saved in the database, we can just delete it
    emits('delete')
  }
}

const handleDeleteTagGroup = async (tagId) => {
  try {
    await deleteTagGroup(tagId)

    // Emit the 'delete' event to the parent component
    emits('delete')
  } catch (e) {
    showSnackbar('Error deleting tag group', 'red-lighten-1')
  }
  isConfirmationDialogOpen.value = false
}

const editTagGroup = async () => {
  try {
    const editedTagGroup = await editTagGroupMutation(form)

    // Update the form with the new values
    Object.assign(form, editedTagGroup)

    // Emit the 'upsert' event to the parent component
    emits('upsert', form)

    showSnackbar('Tag group successfully edited', 'green-darken-2')
    isEditing.value = false
  } catch (e) {
    showSnackbar('Error editing tag group', 'red-lighten-1')
  }
}

const createTagGroup = async () => {
  try {
    const newTagGroup = await createTagGroupMutation(form)

    // Update the form with the new values
    Object.assign(form, newTagGroup)

    // Emit the 'upsert' event to the parent component
    emits('upsert', form)

    showSnackbar('Tag group successfully created', 'green-darken-2')
    isEditing.value = false
  } catch (e) {
    showSnackbar('Error creating tag group', 'red-lighten-1')
  }
}

const saveTagGroup = async () => {
  if (isFormValid.value) {
    if (form.id) {
      // If the tag group has an ID, trigger the edit process
      await editTagGroup()
    } else {
      // If there's no ID, trigger the creation process
      await createTagGroup()
    }
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/components/form';
</style>
