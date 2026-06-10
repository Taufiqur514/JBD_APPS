export type ShippingQuote = {
  courier: string;
  service: string;
  etd: string;
  cost: number;
  provider: "manual-demo" | "biteship" | "komerce";
};

export type ShipmentBooking = ShippingQuote & {
  awb: string;
  trackingUrl?: string;
};

export function quoteShipping(destinationCity = "Bekasi", weightGrams = 1000): ShippingQuote[] {
  const provider = (process.env.SHIPPING_PROVIDER as ShippingQuote["provider"]) || "manual-demo";
  const multiplier = Math.max(1, Math.ceil(weightGrams / 1000));
  return [
    { provider, courier: "JNE", service: "Reguler", etd: "1-3 hari", cost: 18000 * multiplier },
    { provider, courier: "SiCepat", service: "BEST", etd: "1-2 hari", cost: 26000 * multiplier },
    { provider, courier: "Anteraja", service: destinationCity.toLowerCase().includes("bekasi") ? "Regular" : "Cargo", etd: "2-4 hari", cost: 42000 * multiplier },
  ];
}

export function bookShipment(orderId: string, quote: ShippingQuote): ShipmentBooking {
  return {
    ...quote,
    awb: `${quote.courier.toUpperCase()}-${orderId.replace(/\D/g, "").slice(-8).padStart(8, "0")}`,
    trackingUrl: `/storefront/orders/${encodeURIComponent(orderId)}`,
  };
}

