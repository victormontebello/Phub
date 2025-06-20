import { useQuery } from '@tanstack/react-query';

interface Municipality {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
      };
    };
  };
}

const fetchBrazilianMunicipalities = async () => {
  const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
  
  if (!response.ok) {
    throw new Error('Falha ao buscar os municípios do IBGE.');
  }

  const data: Municipality[] = await response.json();
  
  const sortedData = data.sort((a, b) => {
    // Acesso seguro para evitar erros
    const stateA = a?.microrregiao?.mesorregiao?.UF?.sigla || '';
    const stateB = b?.microrregiao?.mesorregiao?.UF?.sigla || '';
    if (stateA < stateB) return -1;
    if (stateA > stateB) return 1;
    if (a.nome < b.nome) return -1;
    if (a.nome > b.nome) return 1;
    return 0;
  });

  return sortedData.map(municipality => {
    // Garante que ambos os valores existem antes de criar o objeto
    const name = municipality?.nome;
    const state = municipality?.microrregiao?.mesorregiao?.UF?.sigla;
    
    if (name && state) {
      return {
        value: `${name} - ${state}`,
        label: `${name} - ${state}`,
      };
    }
    return null; // Será filtrado depois
  }).filter((item): item is { value: string; label: string } => !!item); // Filtra e garante o tipo correto
};

export const useBrazilianMunicipalities = () => {
  return useQuery({
    queryKey: ['brazilianMunicipalities'],
    queryFn: fetchBrazilianMunicipalities,
    staleTime: 24 * 60 * 60 * 1000, // Cache por 24 horas
    refetchOnWindowFocus: false,
  });
}; 