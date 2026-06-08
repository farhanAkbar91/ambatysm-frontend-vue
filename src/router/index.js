import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  { path: '/home', component: () => import('../views/HomeUserView.vue'), meta: { requiresAuth: true } },
  { path: '/login', component: () => import('../views/LoginView.vue') },
  { path: '/register', component: () => import('../views/RegisterView.vue') },
  { path: '/category', component: () => import('../views/CategoryView.vue') },
  { path: '/product/:id', component: () => import('../views/DetailView.vue') },
  { path: '/cart', component: () => import('../views/CartView.vue'), meta: { requiresAuth: true } },
  { path: '/checkout', component: () => import('../views/CheckoutView.vue'), meta: { requiresAuth: true } },
  { path: '/payment', component: () => import('../views/PaymentView.vue'), meta: { requiresAuth: true } },
  { path: '/payment-success', component: () => import('../views/PaymentSuccessView.vue') },
  { path: '/pesanan', component: () => import('../views/PesananView.vue'), meta: { requiresAuth: true } },
  { path: '/pesanan/:id', component: () => import('../views/OrderDetailView.vue'), meta: { requiresAuth: true } },
  { path: '/profil', component: () => import('../views/ProfilView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/dashboard', component: () => import('../views/admin/DashboardAdminView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin', component: () => import('../views/admin/HomeAdminView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/tambah-produk', component: () => import('../views/admin/TambahProdukView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/pesanan', component: () => import('../views/admin/PesananAdminView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/pesanan/:id', component: () => import('../views/admin/OrderDetailAdminView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/profil', component: () => import('../views/admin/ProfilAdminView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) {
    return '/login'
  }
  if (to.meta.requiresAdmin) {
    if (!auth.user) await auth.fetchUser()
    if (auth.user?.role !== 'admin') return '/home'
  }
})

export default router
