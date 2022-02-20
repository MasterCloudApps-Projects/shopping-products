class ProductResponseDto {
  constructor(id, name, description, price, quantity) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.quantity = quantity;
  }
}

module.exports = ProductResponseDto;
