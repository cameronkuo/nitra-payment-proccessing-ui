<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-black">
      <q-toolbar>
        <q-btn aria-label="Menu" dense flat icon="fa fa-bars" round @click="toggleLeftDrawer" />

        <q-toolbar-title>{{ $route.meta.title }}</q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import useBreakpoints from 'src/composables/useBreakpoints';
import * as enums from 'src/enums';
import { eventEmitter } from 'src/utils/event-emitter';

import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';

const breakpoints = useBreakpoints();

const linksList: EssentialLinkProps[] = [
  {
    title: 'Main Function',
    caption: 'Nitra Payment Proccessing UI',
    icon: 'home',
    link: '/',
  },
  {
    title: 'Color Demo',
    caption: 'Color palette',
    icon: 'colorize',
    link: '/colors',
  },
  {
    title: 'Icon Demo',
    caption: 'SVG Icons',
    icon: 'photo_library',
    link: '/icons',
  },
  {
    title: 'Dialog Demo',
    caption: 'Global Dialog',
    icon: 'open_in_new',
    link: '/dialogs',
  },
  {
    title: 'Breakpoints Demo',
    caption: 'Responsive breakpoints',
    icon: 'devices',
    link: '/breakpoints',
  },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const isDesktop = computed(() => breakpoints.xxl.value);

watch(
  () => isDesktop.value,
  (val) => {
    leftDrawerOpen.value = val;
  },
);

leftDrawerOpen.value = isDesktop.value;

eventEmitter.on(enums.emitter.CommonEvent.TOGGLE_SIDEBAR, (open: boolean) => {
  leftDrawerOpen.value = open || !leftDrawerOpen.value;
});
</script>
