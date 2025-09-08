import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        meta: { title: 'Main Function' },
        path: '',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        meta: { title: 'Color Demo' },
        path: '/colors',
        component: () => import('pages/ColorDemo.vue'),
      },
      {
        meta: { title: 'Icon Demo' },
        path: '/icons',
        component: () => import('pages/IconDemo.vue'),
      },
      {
        meta: { title: 'Dialog Demo' },
        path: '/dialogs',
        component: () => import('pages/DialogDemo.vue'),
      },
      {
        meta: { title: 'Breakpoints Demo' },
        path: '/breakpoints',
        component: () => import('pages/BreakpointsDemo.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
