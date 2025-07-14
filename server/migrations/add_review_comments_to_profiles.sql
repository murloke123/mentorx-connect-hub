-- Adicionar campo review_comments à tabela profiles
ALTER TABLE profiles 
ADD COLUMN review_comments JSONB DEFAULT '{
  "photo_1": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "name_1": "João Silva",
  "profession_1": "Empresário",
  "comment_1": "Excelente mentor! Transformou completamente minha visão de negócios e me ajudou a aumentar o faturamento em 300% em apenas 6 meses.",
  "photo_2": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  "name_2": "Maria Santos",
  "profession_2": "Consultora de Marketing",
  "comment_2": "Metodologia incrível! As estratégias ensinadas são práticas e realmente funcionam. Recomendo para qualquer pessoa que queira crescer profissionalmente.",
  "photo_3": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "name_3": "Carlos Oliveira",
  "profession_3": "Diretor Comercial",
  "comment_3": "Investimento que vale cada centavo! O conhecimento compartilhado é de altíssimo nível e os resultados aparecem rapidamente."
}'::jsonb;

-- Atualizar perfis existentes de mentores com valores padrão
UPDATE profiles 
SET review_comments = '{
  "photo_1": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "name_1": "João Silva",
  "profession_1": "Empresário",
  "comment_1": "Excelente mentor! Transformou completamente minha visão de negócios e me ajudou a aumentar o faturamento em 300% em apenas 6 meses.",
  "photo_2": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  "name_2": "Maria Santos",
  "profession_2": "Consultora de Marketing",
  "comment_2": "Metodologia incrível! As estratégias ensinadas são práticas e realmente funcionam. Recomendo para qualquer pessoa que queira crescer profissionalmente.",
  "photo_3": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "name_3": "Carlos Oliveira",
  "profession_3": "Diretor Comercial",
  "comment_3": "Investimento que vale cada centavo! O conhecimento compartilhado é de altíssimo nível e os resultados aparecem rapidamente."
}'::jsonb 
WHERE role = 'mentor' AND review_comments IS NULL;