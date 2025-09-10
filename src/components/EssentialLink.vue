<template>
  <q-item
    exact
    tag="a"
    :to="link"
    @click="eventEmitter.emit(enums.emitter.CommonEvent.TOGGLE_SIDEBAR, false)"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import * as enums from 'src/enums';
import { eventEmitter } from 'src/utils/event-emitter';

export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
}

withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
});
</script>
