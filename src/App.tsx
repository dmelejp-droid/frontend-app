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
  
  // Estado para la autenticación
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Conexiones directas a los microservicios (Plan B)
  const INVENTORY_URL = 'http://localhost:8080';
  const ORDERS_URL = 'http://localhost:8081';
  const AUTH_URL = 'http://localhost:8082';

  useEffect(() => {
    axios.get(`${INVENTORY_URL}/api/products`)
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

  const register = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Registrando...');
    
    axios.post(`${AUTH_URL}/auth/register`, {
      email: email,
      password: password
    })
    .then(() => {
      setMessage('Registrado con éxito. Ahora dale a "Ingresar".');
    })
    .catch(error => {
      console.error(error);
      setMessage('Error: El usuario ya existe o hubo un problema');
    });
  };

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Iniciando sesión...');
    
    axios.post(`${AUTH_URL}/auth/login`, {
      email: email,
      password: password
    })
    .then(response => {
      setToken(response.data);
      setMessage('¡Sesión iniciada con éxito! Ya puedes comprar.');
    })
    .catch(error => {
      console.error(error);
      setMessage('Error de red o Credenciales incorrectas');
    });
  };

  const buyProduct = (productId: number, productName: string) => {
    setMessage(`Procesando orden para ${productName}...`);
    
    // Enviamos la orden al Gateway, ADJUNTANDO EL TOKEN DE SEGURIDAD
    axios.post(`${ORDERS_URL}/api/orders`, 
      { productId: productId, quantity: 1 },
      {
        headers: {
          'Authorization': `Bearer ${token}` // <--- ¡AQUÍ ESTÁ LA MAGIA!
        }
      }
    )
    .then(response => {
      setMessage(`¡Orden #${response.data.id} creada con éxito! Compraste: ${productName}`);
      setProducts(products.map(p => 
        p.id === productId ? { ...p, stock: p.stock - 1 } : p
      ));
    })
    .catch(error => {
      console.error(error);
      setMessage(`Error de Seguridad: ${error.response?.data || 'Acceso Denegado'}`);
    });
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Mi Tienda Protegida con JWT</h1>
        <p className="text-gray-500">React Frontend ↔ API Gateway ↔ Auth / Inventory / Orders</p>
      </header>

      {message && (
        <div className={`p-4 mb-6 rounded-md text-center font-bold ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* ZONA DE LOGIN (Solo se muestra si no hay token) */}
      {!token && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">Iniciar Sesión para Comprar</h2>
          <form onSubmit={login} className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="Email (ej. daniel@test.com)" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="p-2 border rounded"
              required
            />
            <input 
              type="password" 
              placeholder="Contraseña (ej. 123)" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="p-2 border rounded"
              required
            />
            <div className="flex gap-2">
              <button type="button" onClick={register} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded">
                Registrarse
              </button>
              <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded">
                Ingresar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-center text-xl text-gray-500">Cargando catálogo...</p>
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
                  disabled={product.stock === 0 || !token}
                  className={`mt-6 w-full py-2 rounded-md font-bold text-white transition-colors ${
                    !token ? 'bg-gray-400 cursor-not-allowed' :
                    product.stock > 0 
                      ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' 
                      : 'bg-red-400 cursor-not-allowed'
                  }`}
                >
                  {!token ? 'Inicia sesión primero' : (product.stock > 0 ? 'Comprar Ahora' : 'Agotado')}
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
