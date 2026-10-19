const addressRepository = require('../repositories/address.repository');

class AddressService {
  async getAddresses(customerId) {
    return await addressRepository.findByCustomerId(customerId);
  }

  async addAddress(customerId, addressData) {
    if (!addressData.addressLines || !addressData.city || !addressData.postalCode) {
      const error = new Error('Address lines, city, and postal code are required');
      error.statusCode = 400;
      throw error;
    }

    const currentCount = await addressRepository.countByCustomerId(customerId);

    // Rule: "the first address added becomes the default automatically"
    let shouldBeDefault = currentCount === 0 || Boolean(addressData.isDefault);

    if (shouldBeDefault && currentCount > 0) {
      await addressRepository.clearDefaultFlag(customerId);
    }

    const newAddress = await addressRepository.create({
      customerId,
      addressName: addressData.addressName || 'Home',
      addressLines: addressData.addressLines.trim(),
      city: addressData.city.trim(),
      postalCode: addressData.postalCode.trim(),
      latitude: addressData.latitude ? Number(addressData.latitude) : null,
      longitude: addressData.longitude ? Number(addressData.longitude) : null,
      isDefault: shouldBeDefault,
    });

    return newAddress;
  }

  async updateAddress(addressId, customerId, updateData) {
    const address = await addressRepository.findById(addressId);
    if (!address) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      throw error;
    }

    if (address.customerId !== customerId) {
      const error = new Error('Access denied: you can only update your own address');
      error.statusCode = 403;
      throw error;
    }

    if (updateData.isDefault) {
      await addressRepository.clearDefaultFlag(customerId);
    }

    const updated = await addressRepository.updateById(addressId, {
      ...updateData,
      customerId,
    });

    return updated;
  }

  async deleteAddress(addressId, customerId) {
    const address = await addressRepository.findById(addressId);
    if (!address) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      throw error;
    }

    if (address.customerId !== customerId) {
      const error = new Error('Access denied: you can only delete your own address');
      error.statusCode = 403;
      throw error;
    }

    const wasDefault = address.isDefault;
    await addressRepository.deleteById(addressId);

    // If deleted address was default, promote another address to default
    if (wasDefault) {
      const remaining = await addressRepository.findByCustomerId(customerId);
      if (remaining.length > 0) {
        const nextId = remaining[0]._id || remaining[0].id;
        await addressRepository.updateById(nextId, { isDefault: true });
      }
    }

    return { message: 'Address deleted successfully' };
  }

  async setDefaultAddress(addressId, customerId) {
    const address = await addressRepository.findById(addressId);
    if (!address) {
      const error = new Error('Address not found');
      error.statusCode = 404;
      throw error;
    }

    if (address.customerId !== customerId) {
      const error = new Error('Access denied: you can only modify your own address');
      error.statusCode = 403;
      throw error;
    }

    await addressRepository.clearDefaultFlag(customerId);
    const updated = await addressRepository.updateById(addressId, { isDefault: true });
    return updated;
  }
}

module.exports = new AddressService();
