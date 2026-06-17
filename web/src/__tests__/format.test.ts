import { formatPrice, formatPriceDA, formatPhone, getWhatsAppLink } from "../lib/utils/format";

describe("Formatting Utilities", () => {
  describe("formatPrice", () => {
    it("should convert centimes to Dinars and format correctly", () => {
      expect(formatPrice(100000)).toBe("1 000"); // Non-breaking space for thousands separator in fr-DZ
      expect(formatPrice(2500000)).toBe("25 000");
    });
  });

  describe("formatPriceDA", () => {
    it("should append DA suffix to formatted Dinar price", () => {
      expect(formatPriceDA(100000)).toBe("1 000 DA");
      expect(formatPriceDA(2500000)).toBe("25 000 DA");
    });
  });

  describe("formatPhone", () => {
    it("should format local Algerian numbers with +213 prefix", () => {
      expect(formatPhone("0550123456")).toContain("+213");
      expect(formatPhone("0550123456").replace(/\s/g, "")).toBe("+213550123456");
    });

    it("should format standard +213 prefixed numbers", () => {
      expect(formatPhone("213550123456").replace(/\s/g, "")).toBe("+213550123456");
    });
  });

  describe("getWhatsAppLink", () => {
    it("should generate correct wa.me link with message", () => {
      const link = getWhatsAppLink("0550123456", "Hello Safar DZ");
      expect(link).toBe("https://wa.me/213550123456?text=Hello%20Safar%20DZ");
    });
  });
});
