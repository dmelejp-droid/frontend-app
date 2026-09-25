import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Le pegamos directo al Inventario en el puerto 8080 para probar
    axios.get('http://localhost:8080/api/products')
      .then(response => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        setMessage('Error al cargar productos. ¿Están encendidos los servidores Java?');
        setLoading(false);
      });
  }, []);

  const buyProduct = (productId: number, productName: string) => {
    setMessage(`Procesando orden para ${productName}...`);
    
    // Enviamos la orden directo a Orders API en el puerto 8081
    axios.post('http://localhost:8081/api/orders', {
      productId: productId,
      quantity: 1
    })
    .then(response => {
      setMessage(`✅ ¡Orden #${response.data.id} creada con éxito! Compraste: ${productName}`);
      // Actualizamos el stock local visualmente
      setProducts(products.map(p => 
        p.id === productId ? { ...p, stock: p.stock - 1 } : p
      ));
    })
    .catch(error => {
      console.error(error);
      setMessage(`❌ Error: ${error.response?.data || 'No se pudo crear la orden'}`);
    });
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Mi Tienda de Microservicios</h1>
        <p className="text-gray-500">React Frontend ↔ API Gateway (Puerto 8000) ↔ MySQL</p>
      </header>

      {message && (
        <div className={`p-4 mb-6 rounded-md text-center font-bold ${message.includes('Error') || message.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-center text-xl text-gray-500">Cargando catálogo desde Java...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-transform hover:-translate-y-1">
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 truncate" title={product.name}>{product.name}</h3>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-2xl font-black text-blue-600">${product.price}</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Stock: {product.stock}
                  </span>
                </div>
                <button 
                  onClick={() => buyProduct(product.id, product.name)}
                  disabled={product.stock === 0}
                  className={`mt-6 w-full py-2 rounded-md font-bold text-white transition-colors ${
                    product.stock > 0 
                      ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {product.stock > 0 ? 'Comprar Ahora' : 'Agotado'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
