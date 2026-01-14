  const formatToCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  export const transformToCurrency = (value: number) => formatToCurrency.format(value);