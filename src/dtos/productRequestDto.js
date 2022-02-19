class ProductRequestDto {
  constructor({
    name, description, price, quantity,
  }) {
    if (!ProductRequestDto.isValidString(name)) {
      throw new Error('Name is mandatory and must have a minimum lenght of 3');
    }

    if (!ProductRequestDto.isValidString(description)) {
      throw new Error('Description is mandatory and must have a minimum lenght of 3');
    }

    if (typeof price === 'undefined' || typeof price === 'string' || price === null || price <= 0) {
      throw new Error('Price is mandatory and must to be greater than 0');
    }

    return {
      name,
      description,
      price,
      quantity,
    };
  }

  static isValidString(target) {
    return typeof target === 'string' && target !== '' && target.length > 2;
  }
}

module.exports = ProductRequestDto;
