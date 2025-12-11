export const DEFAULT_DATE_OF_BIRTH = "1990-01-01";

export const DEFAULT_COMPLIANCE_PAYLOAD = {
  email: "sandbox.user@example.com",
  firstName: "Jane",
  lastName: "Doe",
  beneficiaryType: "individual" as const,
  dateOfBirth: DEFAULT_DATE_OF_BIRTH,
  addressLine1: "1 Main St",
  city: "Paris",
  state: "IDF",
  postcode: "75001",
  country: "FR",
  nationality: "FR",
  phone: "+33123456789",
  ssn: "123456789",
};

export const DEFAULT_PAYMENT_DETAILS_PAYLOAD = {
  bankName: "Sandbox Bank",
  accountName: "Sandbox Account",
  beneficiaryType: "business" as const,
  currency: "usd",
  addressLine1: "24 Theatre St.",
  city: "Paramount",
  state: "CA",
  country: "US",
  dateOfBirth: DEFAULT_DATE_OF_BIRTH,
  postalCode: "90723",
  accountNumber: "1234567890",
  routingNumber: "026013356",
  rails: "local" as const,
  accountType: "checking" as const,
};
