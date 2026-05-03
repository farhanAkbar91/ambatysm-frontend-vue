<template>
  <nav class="bottom-nav">
    <router-link to="/pesanan" class="bottom-nav__item text-decoration-none" active-class="active">
      <i class="bi bi-box-seam-fill fs-4"></i>
      <span class="bottom-nav__text">Pesanan</span>
    </router-link>
    <router-link to="/home" class="bottom-nav__item text-decoration-none" active-class="active">
      <i class="bi bi-house-fill fs-4"></i>
      <span class="bottom-nav__text">Beranda</span>
    </router-link>
    <router-link to="/profil" class="bottom-nav__item text-decoration-none" active-class="active">
      <i class="bi bi-person-fill fs-4"></i>
      <span class="bottom-nav__text">Profil</span>
    </router-link>
  </nav>
</template>
