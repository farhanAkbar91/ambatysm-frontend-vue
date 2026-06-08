<template>
  <nav class="bottom-nav">
    <router-link to="/admin" class="bottom-nav__item text-decoration-none" active-class="active" exact-active-class="active">
      <i class="bi bi-house-fill fs-4"></i>
      <span class="bottom-nav__text">Beranda</span>
    </router-link>
    <router-link to="/admin/dashboard" class="bottom-nav__item text-decoration-none" active-class="active">
      <i class="bi bi-speedometer2 fs-4"></i>
      <span class="bottom-nav__text">Dashboard</span>
    </router-link>
    <router-link to="/admin/pesanan" class="bottom-nav__item text-decoration-none" active-class="active">
      <i class="bi bi-box-seam-fill fs-4"></i>
      <span class="bottom-nav__text">Pesanan</span>
    </router-link>
    <router-link to="/admin/profil" class="bottom-nav__item text-decoration-none" active-class="active">
      <i class="bi bi-person-fill fs-4"></i>
      <span class="bottom-nav__text">Profil</span>
    </router-link>
  </nav>
</template>

<style scoped>
.bottom-nav__item.active {
  color: #dc2626 !important;
}
</style>
