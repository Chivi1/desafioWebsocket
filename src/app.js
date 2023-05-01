//app.js
import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './utils.js';
import {Server} from 'socket.io'

const app = express();


const server = app.listen (8080, ()=>console.log("listening on 8080")); 
const io = new Server(server);


app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

app.get('/', (req,res)=>{
    res.render('home',{ productos: productos })
})

app.get('/realtimeproducts', (req, res) => {
  const { nombre, precio } = req.body;
  const producto = { nombre, precio, id: productos.length + 1 };
  productos.push(producto);

  // Emitir evento de producto creado a todos los clientes conectados
  io.emit('productoCreado', producto);

  res.render('realTimeProducts');

});

app.use(express.static('public'));

let productos = [];
io.on('connection', (socket) => {
  console.log('Usuario conectado');
  
  // Emitir los productos al cliente cuando se conecte
  socket.emit('productos', productos);
  
  // Escuchar los mensajes del cliente
  socket.on('crearProducto', (producto) => {
    // Crear el producto y enviarlo a todos los clientes conectados
    productos.push(producto);
    io.emit('productoCreado', producto);
  });
  socket.on('eliminarProducto', (producto) => {
    // Eliminar el producto de la lista de productos
    const index = productos.findIndex(p => p.nombre === producto.nombre && p.precio === producto.precio);
    if (index !== -1) {
      productos.splice(index, 1);
      // Emitir el evento 'productoEliminado' a todos los clientes conectados
      io.emit('productoEliminado', producto);
    }
  });
  
});