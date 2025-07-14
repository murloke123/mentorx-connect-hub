-- Adicionar campo cx_diferenciais à tabela profiles
ALTER TABLE profiles 
ADD COLUMN cx_diferenciais JSONB DEFAULT '{
  "dif_title_1": "🎯 Resultados Comprovados",
  "dif_description_1": "Mais de 1.250 vidas transformadas com metodologias testadas e aprovadas.",
  "dif_title_2": "🚀 Metodologia Exclusiva",
  "dif_description_2": "Sistema proprietário desenvolvido ao longo de 15 anos de experiência.",
  "dif_title_3": "💰 ROI Garantido",
  "dif_description_3": "Investimento retorna em até 90 dias ou seu dinheiro de volta."
}'::jsonb;

-- Atualizar perfis existentes de mentores com valores padrão
UPDATE profiles 
SET cx_diferenciais = '{
  "dif_title_1": "🎯 Resultados Comprovados",
  "dif_description_1": "Mais de 1.250 vidas transformadas com metodologias testadas e aprovadas.",
  "dif_title_2": "🚀 Metodologia Exclusiva",
  "dif_description_2": "Sistema proprietário desenvolvido ao longo de 15 anos de experiência.",
  "dif_title_3": "💰 ROI Garantido",
  "dif_description_3": "Investimento retorna em até 90 dias ou seu dinheiro de volta."
}'::jsonb 
WHERE role = 'mentor' AND cx_diferenciais IS NULL;