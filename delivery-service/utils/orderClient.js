const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL || 'http://localhost:5003';

const syncOrderStatus = async (orderId, status, note) => {
  try {
    const response = await fetch(`${ORDER_SERVICE_URL}/api/orders/${orderId}/delivery-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        note: note || `Delivery updated to ${status}`,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn(`[delivery-service] Order Service sync returned ${response.status}:`, data);
      return null;
    }

    return data.data;
  } catch (err) {
    console.warn(`[delivery-service] Failed to sync status with Order Service (${err.message})`);
    return null;
  }
};

module.exports = { syncOrderStatus };
