const tenDigitPhoneNumberPattern = /^\d{10}$/;

export const isValidPhoneNumber = (value: string): boolean =>
  tenDigitPhoneNumberPattern.test(value);
