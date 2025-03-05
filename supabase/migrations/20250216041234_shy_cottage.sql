/*
  # Adicionar função de logout

  1. Nova Função
    - `handle_logout()`: Função para realizar o logout do usuário atual
    
  2. Segurança
    - Função executada com permissões de SECURITY DEFINER
    - Apenas usuários autenticados podem executar
*/

CREATE OR REPLACE FUNCTION handle_logout()
RETURNS void AS $$
BEGIN
  -- Revogar todas as sessões do usuário atual
  DELETE FROM auth.sessions
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que apenas usuários autenticados podem executar a função
REVOKE EXECUTE ON FUNCTION handle_logout() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION handle_logout() TO authenticated;
