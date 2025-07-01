import { createCourseWithStripe, updateCourseWithStripe } from '../services/courseService';
import { Course } from '../types/database';

// Script de teste para verificar a integração com Stripe
async function testStripeIntegration() {
  console.log('🧪 Iniciando teste de integração Stripe...\n');

  // Dados de teste
  const mentorId = 'seu-mentor-id-aqui'; // Substitua pelo ID real
  
  // Teste 1: Criar curso gratuito
  console.log('📝 Teste 1: Criando curso gratuito...');
  const cursoGratuito: Partial<Course> = {
    title: 'Curso Gratuito de Teste',
    description: 'Este é um curso gratuito para testar a integração',
    is_public: true,
    is_paid: false,
    price: null,
    is_published: false,
  };

  try {
    const result1 = await createCourseWithStripe(cursoGratuito, mentorId);
    console.log('✅ Curso gratuito criado:', {
      courseId: result1.course.id,
      stripeProductId: result1.stripeData?.stripeProductId,
      stripePriceId: result1.stripeData?.stripePriceId,
    });
  } catch (error) {
    console.error('❌ Erro ao criar curso gratuito:', error);
  }

  // Teste 2: Criar curso pago
  console.log('\n📝 Teste 2: Criando curso pago...');
  const cursoPago: Partial<Course> = {
    title: 'Curso Pago de Teste',
    description: 'Este é um curso pago para testar a integração',
    is_public: true,
    is_paid: true,
    price: 99.90,
    is_published: false,
  };

  try {
    const result2 = await createCourseWithStripe(cursoPago, mentorId);
    console.log('✅ Curso pago criado:', {
      courseId: result2.course.id,
      price: result2.course.price,
      stripeProductId: result2.stripeData?.stripeProductId,
      stripePriceId: result2.stripeData?.stripePriceId,
    });

    // Teste 3: Atualizar preço do curso
    console.log('\n📝 Teste 3: Atualizando preço do curso...');
    const novosDados: Partial<Course> = {
      price: 149.90,
    };

    const result3 = await updateCourseWithStripe(result2.course.id, novosDados);
    console.log('✅ Preço atualizado:', {
      success: result3.success,
      newPriceId: result3.stripeData?.stripePriceId,
    });

    // Teste 4: Transformar curso pago em gratuito
    console.log('\n📝 Teste 4: Transformando curso pago em gratuito...');
    const dadosGratuito: Partial<Course> = {
      is_paid: false,
      price: null,
    };

    const result4 = await updateCourseWithStripe(result2.course.id, dadosGratuito);
    console.log('✅ Curso transformado em gratuito:', {
      success: result4.success,
      newPriceId: result4.stripeData?.stripePriceId,
    });

    // Teste 5: Transformar curso gratuito em pago
    console.log('\n📝 Teste 5: Transformando curso gratuito em pago...');
    const dadosPago: Partial<Course> = {
      is_paid: true,
      price: 199.90,
    };

    const result5 = await updateCourseWithStripe(result2.course.id, dadosPago);
    console.log('✅ Curso transformado em pago:', {
      success: result5.success,
      newPriceId: result5.stripeData?.stripePriceId,
    });

  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  }

  console.log('\n✅ Testes concluídos!');
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testStripeIntegration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

export { testStripeIntegration };
