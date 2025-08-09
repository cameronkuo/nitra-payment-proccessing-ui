<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn aria-label="Menu" dense flat icon="fa fa-bars" round @click="toggleLeftDrawer" />

        <q-toolbar-title> Quasar App </q-toolbar-title>

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
import { ref } from 'vue';

import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';

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
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
