import {
  wifi,
  url,
  email,
  sms,
  phone,
  geo,
  vcard,
  mecard,
  event,
  swissQR,
  gs1DigitalLink,
} from "etiket";

function safeSVG(fn: () => string): { svg: string } | { error: string } {
  try {
    return { svg: fn() };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export const useHelpersStore = defineStore("helpers", () => {
  // Wi-Fi
  const wifiSsid = ref("MyNetwork");
  const wifiPass = ref("password123");
  const wifiEnc = ref<"WPA" | "WEP" | "nopass">("WPA");

  // URL
  const urlValue = ref("https://etiket.dev");

  // Email
  const emailValue = ref("hello@example.com");

  // SMS
  const smsNumber = ref("+1234567890");
  const smsBody = ref("");

  // Phone
  const phoneValue = ref("+1234567890");

  // Geo
  const geoLat = ref(48.8566);
  const geoLng = ref(2.3522);

  // vCard
  const vcardFn = ref("Jane");
  const vcardLn = ref("Doe");
  const vcardPhone = ref("+1234567890");
  const vcardEmail = ref("jane@example.com");
  const vcardOrg = ref("Acme Inc.");
  const vcardTitle = ref("Engineer");
  const vcardUrl = ref("");

  // MeCard
  const mecardName = ref("Jane Doe");
  const mecardPhone = ref("+1234567890");
  const mecardEmail = ref("jane@example.com");

  // Event
  const eventTitle = ref("Meeting");
  const eventStart = ref("20260101T100000");
  const eventEnd = ref("20260101T110000");
  const eventLocation = ref("Paris");

  // Swiss QR
  const swissIban = ref("CH5604835012345678009");
  const swissName = ref("Jane Doe");
  const swissZip = ref("8001");
  const swissCity = ref("Zurich");
  const swissCountry = ref("CH");
  const swissAmount = ref(100);
  const swissCurrency = ref<"CHF" | "EUR">("CHF");

  // GS1 Digital Link
  const gs1Gtin = ref("01234567890128");
  const gs1Batch = ref("");
  const gs1Serial = ref("");

  // Computed SVGs
  const wifiResult = computed(() =>
    safeSVG(() => wifi(wifiSsid.value, wifiPass.value, { encryption: wifiEnc.value })),
  );
  const urlResult = computed(() => safeSVG(() => url(urlValue.value)));
  const emailResult = computed(() => safeSVG(() => email(emailValue.value)));
  const smsResult = computed(() =>
    safeSVG(() => sms(smsNumber.value, smsBody.value || undefined)),
  );
  const phoneResult = computed(() => safeSVG(() => phone(phoneValue.value)));
  const geoResult = computed(() => safeSVG(() => geo(geoLat.value, geoLng.value)));

  const vcardResult = computed(() =>
    safeSVG(() =>
      vcard({
        firstName: vcardFn.value,
        lastName: vcardLn.value || undefined,
        phone: vcardPhone.value || undefined,
        email: vcardEmail.value || undefined,
        org: vcardOrg.value || undefined,
        title: vcardTitle.value || undefined,
        url: vcardUrl.value || undefined,
      }),
    ),
  );

  const mecardResult = computed(() =>
    safeSVG(() =>
      mecard({
        name: mecardName.value,
        phone: mecardPhone.value || undefined,
        email: mecardEmail.value || undefined,
      }),
    ),
  );

  const eventResult = computed(() =>
    safeSVG(() =>
      event({
        title: eventTitle.value,
        start: eventStart.value,
        end: eventEnd.value || undefined,
        location: eventLocation.value || undefined,
      }),
    ),
  );

  const swissResult = computed(() =>
    safeSVG(() =>
      swissQR({
        iban: swissIban.value,
        creditor: {
          name: swissName.value,
          postalCode: swissZip.value,
          city: swissCity.value,
          country: swissCountry.value,
        },
        amount: swissAmount.value,
        currency: swissCurrency.value,
      }),
    ),
  );

  const gs1Result = computed(() =>
    safeSVG(() =>
      gs1DigitalLink({
        gtin: gs1Gtin.value,
        batch: gs1Batch.value || undefined,
        serial: gs1Serial.value || undefined,
      }),
    ),
  );

  return {
    wifiSsid, wifiPass, wifiEnc, wifiResult,
    urlValue, urlResult,
    emailValue, emailResult,
    smsNumber, smsBody, smsResult,
    phoneValue, phoneResult,
    geoLat, geoLng, geoResult,
    vcardFn, vcardLn, vcardPhone, vcardEmail, vcardOrg, vcardTitle, vcardUrl, vcardResult,
    mecardName, mecardPhone, mecardEmail, mecardResult,
    eventTitle, eventStart, eventEnd, eventLocation, eventResult,
    swissIban, swissName, swissZip, swissCity, swissCountry, swissAmount, swissCurrency, swissResult,
    gs1Gtin, gs1Batch, gs1Serial, gs1Result,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useHelpersStore, import.meta.hot));
}
