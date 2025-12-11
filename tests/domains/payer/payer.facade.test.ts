import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { isRequestApiError } from "../../../src/core/errors/request-api.error";
import { createRequestClient } from "../../../src/request.client";
import { server } from "../../msw/setup";
import { TEST_BASE_URL } from "../../utils/test-env";

const CLIENT_USER_ID = "user-1" as const;
const DATE_OF_BIRTH = "1990-01-01" as const;
const ACCOUNT_NAME = "Account" as const;
const BANK_MONZO = "Monzo" as const;
const BANK_CHASE = "Chase" as const;
const POSTCODE = "10001" as const;
const COUNTRY_US = "US" as const;
const CITY_NY = "NY" as const;
const EMAIL = "user@example.com" as const;
const FIRST_NAME = "Jane" as const;
const LAST_NAME = "Doe" as const;
const BENEFICIARY_INDIVIDUAL = "individual" as const;
const ADDRESS_LINE = "1 Main St" as const;
const CITY_PARIS = "Paris" as const;
const COUNTRY_FR = "FR" as const;
const PHONE = "+33123456789" as const;
const SSN = "123456789" as const;
const NATIONALITY_FR = "FR" as const;

describe("Payer facade (v2)", () => {
  const client = createRequestClient({ baseUrl: TEST_BASE_URL });

  it("creates compliance data", async () => {
    const response = await client.payer.createComplianceData({
      clientUserId: CLIENT_USER_ID,
      email: EMAIL,
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      beneficiaryType: BENEFICIARY_INDIVIDUAL,
      dateOfBirth: DATE_OF_BIRTH,
      addressLine1: ADDRESS_LINE,
      city: CITY_PARIS,
      state: "",
      postcode: "75001",
      country: COUNTRY_FR,
      nationality: NATIONALITY_FR,
      phone: PHONE,
      ssn: SSN,
    });

    expect(response.userId).toContain("user-");
    expect(response.status.agreementStatus).toBeDefined();
  });

  it("retrieves compliance status", async () => {
    const status = await client.payer.getComplianceStatus(CLIENT_USER_ID);
    expect(status.isCompliant).toBe(true);
    expect(status.userId).toBe("uuid-v2-user-1");
  });

  it("updates compliance status", async () => {
    const response = await client.payer.updateComplianceStatus(CLIENT_USER_ID, { agreementCompleted: true });
    expect(response.success).toBe(true);
  });

  it("creates and retrieves payment details", async () => {
    const created = await client.payer.createPaymentDetails(CLIENT_USER_ID, {
      bankName: BANK_MONZO,
      accountName: ACCOUNT_NAME,
      beneficiaryType: "business",
      currency: "USD",
      addressLine1: "1 Main",
      city: CITY_NY,
      country: COUNTRY_US,
      dateOfBirth: DATE_OF_BIRTH,
      postalCode: POSTCODE,
    });

    const createdDetail = created.payment_detail;
    expect(createdDetail?.bankName).toBe(BANK_MONZO);

    const fetched = await client.payer.getPaymentDetails(CLIENT_USER_ID);
    const fetchedDetails = fetched.paymentDetails as Array<{ id?: string }> | undefined;
    expect(fetchedDetails?.[0]?.id).toBe("pd-2");
  });

  it("propagates 404 errors from compliance status", async () => {
    server.use(
      http.get(`${TEST_BASE_URL}/v2/payer/:clientUserId`, () =>
        HttpResponse.json({ message: "Not Found" }, { status: 404 }),
      ),
    );

    await expect(client.payer.getComplianceStatus("missing")).rejects.toSatisfy((err: unknown) => {
      expect(isRequestApiError(err)).toBe(true);
      return true;
    });
  });
});

describe("Payer legacy facade (v1)", () => {
  const client = createRequestClient({ baseUrl: TEST_BASE_URL });
  const legacy = client.payer.legacy;

  it("exposes compliance lifecycle", async () => {
    const compliance = await legacy.createComplianceData({
      clientUserId: CLIENT_USER_ID,
      email: EMAIL,
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      beneficiaryType: BENEFICIARY_INDIVIDUAL,
      dateOfBirth: DATE_OF_BIRTH,
      addressLine1: ADDRESS_LINE,
      city: CITY_PARIS,
      state: "",
      postcode: "75001",
      country: COUNTRY_FR,
      nationality: NATIONALITY_FR,
      phone: PHONE,
      ssn: SSN,
    });

    expect(compliance.userId).toBe("user-1");

    const status = await legacy.getComplianceStatus(CLIENT_USER_ID);
    expect(status.userId).toBe("uuid-user-1");

    const updated = await legacy.updateComplianceStatus(CLIENT_USER_ID, { agreementCompleted: true });
    expect(updated.success).toBe(true);
  });

  it("handles payment detail create/retrieve", async () => {
    const created = await legacy.createPaymentDetails(CLIENT_USER_ID, {
      bankName: BANK_CHASE,
      accountName: ACCOUNT_NAME,
      beneficiaryType: "business",
      currency: "USD",
      addressLine1: "1 Main",
      city: CITY_NY,
      country: COUNTRY_US,
      dateOfBirth: DATE_OF_BIRTH,
      postalCode: POSTCODE,
    });

    const legacyDetail = created.payment_detail;
    expect(legacyDetail?.bankName).toBe(BANK_CHASE);

    const fetched = await legacy.getPaymentDetails(CLIENT_USER_ID);
    expect(Array.isArray(fetched.paymentDetails)).toBe(true);
  });
});
