<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    <!-- Wi-Fi -->
    <HelpersHelperCard title="Wi-Fi" icon="i-lucide-wifi" :result="store.wifiResult" name="h-wifi">
      <UFormField label="SSID">
        <UInput v-model="store.wifiSsid" class="w-full" placeholder="Network name" />
      </UFormField>
      <UFormField label="Password">
        <UInput v-model="store.wifiPass" class="w-full" type="password" placeholder="Password" />
      </UFormField>
      <UFormField label="Encryption">
        <USelect
          v-model="store.wifiEnc"
          :items="[{ value: 'WPA', label: 'WPA/WPA2' }, { value: 'WEP', label: 'WEP' }, { value: 'nopass', label: 'None' }]"
          value-key="value"
          label-key="label"
          class="w-full"
        />
      </UFormField>
    </HelpersHelperCard>

    <!-- URL -->
    <HelpersHelperCard title="URL" icon="i-lucide-link" :result="store.urlResult" name="h-url">
      <UFormField label="URL">
        <UInput v-model="store.urlValue" class="w-full" placeholder="https://..." />
      </UFormField>
    </HelpersHelperCard>

    <!-- Email -->
    <HelpersHelperCard title="Email" icon="i-lucide-mail" :result="store.emailResult" name="h-email">
      <UFormField label="Email address">
        <UInput v-model="store.emailValue" class="w-full" type="email" placeholder="hello@example.com" />
      </UFormField>
    </HelpersHelperCard>

    <!-- SMS -->
    <HelpersHelperCard title="SMS" icon="i-lucide-message-square" :result="store.smsResult" name="h-sms">
      <UFormField label="Phone number">
        <UInput v-model="store.smsNumber" class="w-full" placeholder="+1234567890" />
      </UFormField>
      <UFormField label="Message (optional)">
        <UInput v-model="store.smsBody" class="w-full" placeholder="Message..." />
      </UFormField>
    </HelpersHelperCard>

    <!-- Phone -->
    <HelpersHelperCard title="Phone" icon="i-lucide-phone" :result="store.phoneResult" name="h-phone">
      <UFormField label="Phone number">
        <UInput v-model="store.phoneValue" class="w-full" placeholder="+1234567890" />
      </UFormField>
    </HelpersHelperCard>

    <!-- Geo -->
    <HelpersHelperCard title="Geo location" icon="i-lucide-map-pin" :result="store.geoResult" name="h-geo">
      <div class="grid grid-cols-2 gap-3">
        <UFormField label="Latitude">
          <UInputNumber v-model="store.geoLat" :step="0.0001" class="w-full" />
        </UFormField>
        <UFormField label="Longitude">
          <UInputNumber v-model="store.geoLng" :step="0.0001" class="w-full" />
        </UFormField>
      </div>
    </HelpersHelperCard>

    <!-- vCard -->
    <HelpersHelperCard title="vCard" icon="i-lucide-contact" :result="store.vcardResult" name="h-vcard">
      <div class="grid grid-cols-2 gap-3">
        <UFormField label="First name">
          <UInput v-model="store.vcardFn" class="w-full" />
        </UFormField>
        <UFormField label="Last name">
          <UInput v-model="store.vcardLn" class="w-full" />
        </UFormField>
      </div>
      <UFormField label="Phone">
        <UInput v-model="store.vcardPhone" class="w-full" />
      </UFormField>
      <UFormField label="Email">
        <UInput v-model="store.vcardEmail" class="w-full" type="email" />
      </UFormField>
      <div class="grid grid-cols-2 gap-3">
        <UFormField label="Organization">
          <UInput v-model="store.vcardOrg" class="w-full" />
        </UFormField>
        <UFormField label="Title">
          <UInput v-model="store.vcardTitle" class="w-full" />
        </UFormField>
      </div>
    </HelpersHelperCard>

    <!-- MeCard -->
    <HelpersHelperCard title="MeCard" icon="i-lucide-user" :result="store.mecardResult" name="h-mecard">
      <UFormField label="Name">
        <UInput v-model="store.mecardName" class="w-full" />
      </UFormField>
      <UFormField label="Phone">
        <UInput v-model="store.mecardPhone" class="w-full" />
      </UFormField>
      <UFormField label="Email">
        <UInput v-model="store.mecardEmail" class="w-full" type="email" />
      </UFormField>
    </HelpersHelperCard>

    <!-- Calendar Event -->
    <HelpersHelperCard title="Calendar event" icon="i-lucide-calendar" :result="store.eventResult" name="h-event">
      <UFormField label="Title">
        <UInput v-model="store.eventTitle" class="w-full" />
      </UFormField>
      <div class="grid grid-cols-2 gap-3">
        <UFormField label="Start">
          <UInput v-model="store.eventStart" class="w-full font-mono text-xs" placeholder="20260101T100000" />
        </UFormField>
        <UFormField label="End">
          <UInput v-model="store.eventEnd" class="w-full font-mono text-xs" placeholder="20260101T110000" />
        </UFormField>
      </div>
      <UFormField label="Location">
        <UInput v-model="store.eventLocation" class="w-full" />
      </UFormField>
    </HelpersHelperCard>

    <!-- Swiss QR -->
    <HelpersHelperCard title="Swiss QR" icon="i-lucide-banknote" :result="store.swissResult" name="h-swiss">
      <UFormField label="IBAN">
        <UInput v-model="store.swissIban" class="w-full font-mono text-xs" />
      </UFormField>
      <UFormField label="Creditor name">
        <UInput v-model="store.swissName" class="w-full" />
      </UFormField>
      <div class="grid grid-cols-2 gap-3">
        <UFormField label="Postal code">
          <UInput v-model="store.swissZip" class="w-full" />
        </UFormField>
        <UFormField label="City">
          <UInput v-model="store.swissCity" class="w-full" />
        </UFormField>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <UFormField label="Amount">
          <UInputNumber v-model="store.swissAmount" :min="0" :step="0.01" class="w-full" />
        </UFormField>
        <UFormField label="Currency">
          <USelect
            v-model="store.swissCurrency"
            :items="[{ value: 'CHF', label: 'CHF' }, { value: 'EUR', label: 'EUR' }]"
            value-key="value"
            label-key="label"
            class="w-full"
          />
        </UFormField>
      </div>
    </HelpersHelperCard>

    <!-- GS1 Digital Link -->
    <HelpersHelperCard title="GS1 Digital Link" icon="i-lucide-barcode" :result="store.gs1Result" name="h-gs1">
      <UFormField label="GTIN">
        <UInput v-model="store.gs1Gtin" class="w-full font-mono" />
      </UFormField>
      <UFormField label="Batch / lot">
        <UInput v-model="store.gs1Batch" class="w-full" placeholder="optional" />
      </UFormField>
      <UFormField label="Serial">
        <UInput v-model="store.gs1Serial" class="w-full" placeholder="optional" />
      </UFormField>
    </HelpersHelperCard>
  </div>
</template>

<script setup lang="ts">
const store = useHelpersStore();
</script>
