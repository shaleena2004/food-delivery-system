const DELIVERY_SERVICE_URL =
  process.env.DELIVERY_SERVICE_URL || 'http://localhost:5004';

const notifyDeliveryServiceReady = async (orderPayload) => {
  try {
    const response = await fetch(`${DELIVERY_SERVICE_URL}/api/deliveries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn(`[order-service] Delivery Service responded with status ${response.status}:`, data);
      return null;
    }

    return data.data;
  } catch (err) {
    console.warn(`[order-service] Could not notify Delivery Service (${err.message}). Delivery will be ready once Delivery Service polls.`);
    return null;
  }
};

module.exports = { notifyDeliveryServiceReady };
