import { useState, useCallback } from "react";

export const useNumericInput = (initialValue = "") => {
  const [rawValue, setRawValue] = useState(initialValue);

  // Handler for the onChange event
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Convert Persian digits to English
    const englishValue = persianDigitsToEnglish(e.target.value);

    // 2. Remove all non-numeric characters
    const numericValue = englishValue.replace(/\D/g, "");

    setRawValue(numericValue);
  }, []);

  // Helper to set value programmatically (e.g., for template buttons)
  const setValue = useCallback((val: string | number) => {
    setRawValue(String(val));
  }, []);

  // Calculate formatted value for display (e.g., "1,000,000")
  const formattedValue = rawValue ? Number(rawValue).toLocaleString() : "";

  return {
    rawValue, // Use this for API calls
    formattedValue, // Use this for Input value
    handleChange, // Pass this to Input onChange
    setValue, // Use this to update state manually
  };
};

function persianDigitsToEnglish(str: string) {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return str.replace(/۰|۱|۲|۳|۴|۵|۶|۷|۸|۹/g, (match) => {
    return englishDigits[persianDigits.indexOf(match)];
  });
}
