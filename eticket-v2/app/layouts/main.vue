<template>
  <div class="min-h-dvh flex flex-col">
    <UHeader>
      <template #title>
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <div class="size-6">
            <AppLogo />
          </div>
          <span class="font-semibold text-base tracking-tight">etiket</span>
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton variant="ghost" color="neutral" />
      </template>
    </UHeader>

    <UMain class="flex-1">
      <UContainer class="py-8">
        <slot />
      </UContainer>
    </UMain>
  </div>
</template>
