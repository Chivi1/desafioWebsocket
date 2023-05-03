//app.js
import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import ProductManager from './Managers/ProductManager.js';
import {Server} from 'socket.io'
import path from 'path';



const app = express();
const server = app.listen (8080, ()=>console.log("listening on 8080")); 
const io = new Server(server);



app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const productManager = new ProductManager(path.join(__dirname, 'products.json'));

app.post('/productos', async (req, res) => {
  const { nombre, precio } = req.body;
  try {
    const id = await productManager.addProduct({ title: nombre, price: precio });
    const producto = await productManager.getProductById(id);
    io.emit('productoCreado', producto);
    res.sendStatus(201);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get('/', async (req, res) => {
  try {
    // Obtener la lista de productos con el productManager
    const productos = await productManager.getProducts();

    // Renderizar la vista home.handlebars y pasarle la lista de productos
    res.render('home', { productos });
  } catch (error) {
    console.error(`Error al obtener los productos: ${error.message}`);
    res.status(500).send('Error interno del servidor');
  }
});


app.get('/realtimeproducts', async (req, res) => {
  try {
    const productos = await productManager.getProducts();
    const productosManager = new ProductManager(productos);
    res.render('realtimeProducts', { productos: productosManager.getProducts() });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los productos');
  }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado');
io.on('productos', async (productos) => {
  try {
    const productosList = document.getElementById('productosList');
    productosList.innerHTML = '';

    // Obtener la lista de productos del ProductManager
    const productManager = new ProductManager('productos.json');
    const productos = await productManager.getProducts();

    productos.forEach((producto) => {
      const li = document.createElement('li');
      li.innerText = `${producto.nombre} - ${producto.precio}`;

      const button = document.createElement('button');
      button.innerText = 'Eliminar';
      li.appendChild(button);

      button.addEventListener('click', async () => {
        // Eliminar el producto del ProductManager
        await productManager.deleteProduct(producto.id);

        // Emitir evento de producto eliminado a todos los clientes conectados
        socket.emit('eliminarProducto', producto);
      });

      productosList.appendChild(li);
    });
  } catch (error) {
    console.error(error);
  }
});});

