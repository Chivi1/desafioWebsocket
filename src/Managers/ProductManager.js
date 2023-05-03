import fs from 'fs';


class ProductManager {
  constructor(path) {
    this.path = path;
    this.products = [];
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const data = await fs.promises.readFile(this.path);
      this.products = JSON.parse(data);
    } catch (err) {
      this.products = [];
      console.error(`Error al cargar productos desde archivo ${this.path}: ${err}`);
    }
  }
  
  async saveProducts() {
    try {
      const data = JSON.stringify(this.products);
      await fs.promises.writeFile(this.path, data);
      console.log(`Productos guardados en archivo ${this.path}.`);
    } catch (err) {
      console.error(`Error al guardar productos en archivo ${this.path}: ${err}`);
    }
  }
  

  async addProduct(product) {
    const { title, description, price, thumbnail, code, stock } = product;
    if (!title || !description || !price || !thumbnail || !code || !stock) {
      console.error('Todos los campos son obligatorios');
      return;
    }
    if (this.getProductByCode(code)) {
      console.error('El código del producto ya existe');
      return;
    }
    const id = this.products.length + 1;
    const newProduct = { id, ...product };
    this.products.push(newProduct);
    await this.saveProducts();
    console.log(`El producto ${newProduct.title} ha sido agregado con éxito.`);
  }
  

  async getProducts() {
    try {
      const file = await fs.promises.readFile(this.path);
      return JSON.parse(file.toString());
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const products = await this.getProducts();

      const product = products.find((p) => p.id === id);

      if (!product) {
        throw new Error(`No se encontró ningún producto con id ${id}`);
      }

      return product;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  getProductByCode(code) {
    const product = this.products.find(p => p.code === code);
    return product;
  }

  async updateProduct(id, productData) {
    try {
      const productIndex = this.products.findIndex(p => p.id === id);
      ;
      if (productIndex !== -1) {
        // Copiamos el objeto
        const productToUpdate = Object.assign({}, this.products[productIndex]);
  
        // Actualizamos solo las propiedades que se reciben en el objeto productData
        Object.assign(productToUpdate, productData);
  
        this.products[productIndex] = productToUpdate;
        await this.saveProducts();
        console.log(`Producto con ID ${id} actualizado.`);
      } else {
        console.log(`Producto con ID ${id} no encontrado.`);
      }
    } catch (error) {
      console.log(`Error al actualizar el producto con ID ${id}: ${error}`);
    }
  }
  

  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      console.error('Producto no encontrado');
      return;
    }
    this.products.splice(index, 1);
    this.saveProducts();
    console.log(`El producto con id ${id} ha sido eliminado con éxito.`);
  }
}

export default ProductManager;
//Ejemplo de uso

const productManager = new ProductManager('./products.json');

//Crear producto
/* const newProduct = {
    title: 'Nuevo producto',
    description: 'Descripción del nuevo producto',
    price: 300,
    thumbnail: 'ruta/imagen.jpg',
    code: 'ADBC525',
    stock: 100
};
productManager.addProduct(newProduct);   */

