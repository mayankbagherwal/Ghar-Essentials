/*
  Formats a price in the shop's own money format.

  Shopify's money format is a template string with one of four placeholders in
  it, and which one it uses is the merchant's choice, not ours - an Indian store
  showing "Rs. 1,299" and one showing "₹1299.00" are the same shop setting with
  different placeholders. Reading the format rather than assuming one means a
  total worked out in the browser is punctuated exactly like every price Liquid
  rendered on the same page.

  Prices known at render time go through Liquid's money filter. This is only for
  the ones that move as the shopper ticks a box or changes a quantity.
*/
window.gharFormatMoney = function gharFormatMoney(cents) {
  const format = window.gharMoneyFormat || '{{amount}}';
  const value = Math.round(Number(cents) || 0);

  /* Group digits the Indian way: the last three, then in twos.
     1234567 becomes 12,34,567 rather than 1,234,567. */
  function groupIndian(whole) {
    const digits = String(whole);
    if (digits.length <= 3) return digits;
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return rest + ',' + last3;
  }

  function groupThousands(whole) {
    return String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const rupees = Math.floor(Math.abs(value) / 100);
  const paise = String(Math.abs(value) % 100).padStart(2, '0');
  const sign = value < 0 ? '-' : '';

  /* Comma grouping follows the currency the format is written in: a rupee
     amount groups 12,34,567 and everything else groups 1,234,567. */
  const indian = /(?:₹|Rs\.?|INR)/i.test(format);
  const grouped = indian ? groupIndian(rupees) : groupThousands(rupees);
  const plain = String(rupees);

  const values = {
    amount: sign + grouped + '.' + paise,
    amount_no_decimals: sign + grouped,
    amount_with_comma_separator: sign + plain.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + paise,
    amount_no_decimals_with_comma_separator: sign + plain.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
    amount_with_space_separator: sign + plain.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + paise,
    amount_no_decimals_with_space_separator: sign + plain.replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
    amount_with_apostrophe_separator: sign + plain.replace(/\B(?=(\d{3})+(?!\d))/g, "'") + '.' + paise,
  };

  return format.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(values, name) ? values[name] : match
  );
};
