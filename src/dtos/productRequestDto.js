class ProductRequestDto {
  constructor({
    name, description, price, quantity,
  }) {
    if (!ProductRequestDto.isValidString(name)) {
      throw new Error('Name is mandatory and must have a minimum lenght of 3');
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
