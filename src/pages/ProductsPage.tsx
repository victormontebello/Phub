import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useProducts } from '../hooks/useProductsQueries';

export const ProductsPage: React.FC = () => {
  const { data: products = [], isLoading, error } = useProducts();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Produtos
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Veja todos os produtos disponíveis para pets
          </p>
        </div>
        {isLoading ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Carregando produtos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 transition-colors">
            {error.message}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500 dark:text-gray-400">Tente cadastrar um novo produto</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden transition-colors">
                <img
                  src={product.image_url || 'https://images.pexels.com/photos/4587997/pexels-photo-4587997.jpeg?auto=compress&cs=tinysrgb&w=400'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{product.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{product.description}</p>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-primary-50 dark:bg-primary-50-dark text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-xs font-medium capitalize">
                      {product.category}
                    </span>
                    {product.status === 'available' ? (
                      <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">Disponível</span>
                    ) : (
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">Indisponível</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-500-dark">R${product.price}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Estoque: {product.stock}</span>
                  </div>
                  <button
                    className="mt-4 w-full bg-primary-500 dark:bg-primary-500-dark text-white py-2 px-4 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-600-dark transition-colors font-medium"
                    disabled={product.status !== 'available'}
                    onClick={() => addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image_url: product.image_url,
                      quantity: 1
                    })}
                  >
                    Adicionar ao Carrinho
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 