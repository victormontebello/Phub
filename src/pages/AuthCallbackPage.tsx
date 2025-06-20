import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const AuthCallbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Verificar se há parâmetros de verificação na URL
        const token = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Se há erro na URL
        if (errorParam) {
          setError(errorDescription || 'Erro na verificação do email');
          setLoading(false);
          return;
        }

        // Se há token de verificação
        if (token && type) {
          try {
            await verifyEmail(token, type);
            // Se a verificação foi bem-sucedida, redirecionar para a página inicial
            navigate('/', { replace: true });
            return;
          } catch (verifyError) {
            console.error('Erro na verificação:', verifyError);
            setError('Erro na verificação do email. Tente novamente.');
            setLoading(false);
            return;
          }
        }

        // Se não há token, verificar se o usuário já está autenticado
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro na autenticação:', error);
          setError('Erro na verificação do email. Tente novamente.');
          setLoading(false);
          return;
        }

        if (data.session) {
          // Usuário autenticado com sucesso
          console.log('Usuário autenticado:', data.session.user);
          navigate('/', { replace: true });
        } else {
          setError('Link de verificação inválido ou expirado');
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        setError('Erro inesperado. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, verifyEmail]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sua conta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro na Verificação</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/auth')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}; 