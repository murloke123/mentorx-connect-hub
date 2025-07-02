import { Course } from '@/types/database';
import { supabase } from '../utils/supabase';
import {
    createStripeProductWithPrice,
    syncCourseWithStripe,
    updateProductPrice,
    updateStripeProduct,
    type CourseStripeData
} from './stripeProductService';

// Fetches a single course by its ID and returns it as a Course object.
export async function getCourseById(courseId: string): Promise<Course | null> {
  try {
    const { data, error } = await supabase
      .from("cursos")
      .select("*, category_info:categories(id, name), mentor_info:profiles(full_name, avatar_url)")
      .eq("id", courseId)
      .single();

    if (error) {
      console.error(`Error fetching course ${courseId}:`, error);
      throw error;
    }

    return data as Course | null;
  } catch (error) {
    console.error('Exception in getCourseById:', error);
    throw error;
  }
}

// Updates a course with partial data.
export async function updateCourse(courseId: string, courseData: Partial<Course>) {
  try {
    const { error } = await supabase
      .from("cursos")
      .update(courseData) // Use provided course data directly
      .eq("id", courseId);

    if (error) {
      console.error(`Error updating course ${courseId}:`, error);
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Exception in updateCourse:', error);
    throw error;
  }
}

// Creates a new course.
export async function createCourse(courseData: Partial<Course>, mentorId: string): Promise<Course> {
  try {
    const { data, error } = await supabase
      .from("cursos")
      .insert({ ...courseData, mentor_id: mentorId })
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      throw error;
    }
    return data as Course;
  } catch (error) {
    console.error('Exception in createCourse:', error);
    throw error;
  }
}

// Fetches all public and published courses.
export async function getPublicCourses(): Promise<Course[]> {
  try {
    const { data, error } = await supabase
      .from('cursos')
      .select(`
        *,
        category_info:categories(id, name),
        mentor_info:profiles(full_name, avatar_url)
      `)
      .eq('is_public', true)
      .eq('is_published', true);

    if (error) {
      console.error('Error fetching public courses:', error);
      throw error;
    }

    return (data as Course[]) || [];
  } catch (error) {
    console.error('Exception in getPublicCourses:', error);
    throw error;
  }
}

// Fetches all courses for a specific mentor.
export async function getMentorCourses(mentorId?: string): Promise<Course[]> {
  try {
    let finalMentorId = mentorId;
    if (!finalMentorId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      finalMentorId = user.id;
    }

    console.log('📚 Buscando cursos do mentor (courseService):', finalMentorId);

    // Buscar cursos do mentor
    const { data: courses, error } = await supabase
      .from('cursos')
      .select(`
        *,
        category_info:categories(id, name),
        mentor_info:profiles(full_name, avatar_url)
      `)
      .eq('mentor_id', finalMentorId);

    if (error) {
      console.error(`Error fetching courses for mentor ${finalMentorId}:`, error);
      throw error;
    }

    if (!courses || courses.length === 0) {
      console.log('📝 Nenhum curso encontrado para o mentor');
      return [];
    }

    console.log(`📋 ${courses.length} cursos encontrados, buscando contagem de matrículas...`);

    // Para cada curso, buscar a contagem de matrículas ativas
    const coursesWithEnrollments = await Promise.all(
      courses.map(async (course) => {
        // Buscar contagem de matrículas ativas para este curso usando course_owner_id
        const { count: enrollmentsCount, error: countError } = await supabase
          .from("matriculas")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)
          .eq("course_owner_id", finalMentorId) // Usar course_owner_id para garantir que é do mentor atual
          .eq("status", "active"); // Apenas matrículas ativas

        if (countError) {
          console.error(`❌ Erro ao contar matrículas do curso ${course.id}:`, countError);
          return { ...course, enrollments_count: 0 };
        }

        const finalCount = enrollmentsCount || 0;
        console.log(`📊 Curso "${course.title}" (${course.id}): ${finalCount} matrículas ativas`);

        return { ...course, enrollments_count: finalCount };
      })
    );

    console.log('✅ Busca de cursos com contagem de matrículas concluída');
    return coursesWithEnrollments as Course[];
  } catch (error) {
    console.error('Exception in getMentorCourses:', error);
    throw error;
  }
}

// Updates the publication status of a course.
export async function updateCoursePublicationStatus(courseId: string, isPublished: boolean) {
  try {
    const { error } = await supabase
      .from("cursos")
      .update({ is_published: isPublished })
      .eq("id", courseId);

    if (error) {
      console.error(`Error updating publication status for course ${courseId}:`, error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Exception in updateCoursePublicationStatus:', error);
    throw error;
  }
}

/**
 * Cria um curso e automaticamente cria o produto correspondente no Stripe
 */
export async function createCourseWithStripe(
  courseData: Partial<Course>, 
  mentorId: string
): Promise<{ course: Course; stripeData?: CourseStripeData }> {
  try {
    console.log('🔄 Criando curso com integração Stripe...', { courseData, mentorId });

    // Primeiro cria o curso no banco de dados
    const course = await createCourse(courseData, mentorId);
    console.log('✅ Curso criado no banco:', course.id);

    let stripeData: CourseStripeData | undefined;

    // Sempre tenta criar produto no Stripe (mesmo para cursos gratuitos)
    try {
      // Busca os dados do mentor para obter o stripe_account_id
      const { data: mentorProfile, error: mentorError } = await supabase
        .from('profiles')
        .select('stripe_account_id')
        .eq('id', mentorId)
        .single();

      if (mentorError || !mentorProfile?.stripe_account_id) {
        console.warn('⚠️ Mentor não tem conta Stripe configurada. Produto não será criado no Stripe.');
        return { course };
      }

      // Determina o preço (0 para cursos gratuitos)
      const priceInCents = course.is_paid && course.price ? Math.round(course.price * 100) : 0;
      
      console.log('💰 Criando produto no Stripe com preço:', {
        is_paid: course.is_paid,
        price: course.price,
        priceInCents
      });

      // Cria produto e preço no Stripe
      stripeData = await createStripeProductWithPrice(
        mentorProfile.stripe_account_id,
        {
          name: course.title,
          description: course.description || undefined,
          images: course.image_url ? [course.image_url] : undefined,
          metadata: {
            course_id: course.id,
            mentor_id: mentorId,
            is_free: (!course.is_paid).toString(),
          },
        },
        {
          unitAmount: priceInCents, // 0 para cursos gratuitos
          currency: 'brl',
        }
      );

      // Atualiza o curso com os IDs do Stripe
      const { error: updateError } = await supabase
        .from('cursos')
        .update({
          stripe_product_id: stripeData.stripeProductId,
          stripe_price_id: stripeData.stripePriceId,
        })
        .eq('id', course.id);

      if (updateError) {
        console.error('❌ Erro ao salvar IDs do Stripe no curso:', updateError);
        // Não falha a operação, apenas loga o erro
      } else {
        console.log('✅ IDs do Stripe salvos no curso');
      }

    } catch (stripeError) {
      console.error('❌ Erro ao criar produto no Stripe:', stripeError);
      // Não falha a criação do curso, apenas loga o erro
      console.log('⚠️ Curso criado sem integração Stripe devido ao erro acima');
    }

    return { course, stripeData };
  } catch (error) {
    console.error('❌ Exception in createCourseWithStripe:', error);
    throw error;
  }
}

/**
 * Atualiza um curso e sincroniza as alterações com o Stripe
 */
export async function updateCourseWithStripe(
  courseId: string, 
  courseData: Partial<Course>
): Promise<{ success: boolean; stripeData?: CourseStripeData }> {
  try {
    console.log('🔄 Atualizando curso com sincronização Stripe...', { courseId, courseData });

    // Busca os dados ATUAIS do curso ANTES de atualizar (para comparar preços)
    const currentCourse = await getCourseById(courseId);
    if (!currentCourse) {
      throw new Error('Curso não encontrado');
    }

    // Primeiro atualiza o curso no banco
    await updateCourse(courseId, courseData);
    console.log('✅ Curso atualizado no banco');

    // Busca os dados atualizados do curso
    const course = await getCourseById(courseId);
    if (!course) {
      throw new Error('Curso não encontrado após atualização');
    }

    let stripeData: CourseStripeData | undefined;

    // Busca os dados do mentor para obter o stripe_account_id
    const { data: mentorProfile, error: mentorError } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', course.mentor_id)
      .single();

    if (mentorError || !mentorProfile?.stripe_account_id) {
      console.warn('⚠️ Mentor não tem conta Stripe configurada. Sincronização com Stripe não realizada.');
      return { success: true };
    }

    try {
      // Se já tem produto no Stripe
      if (course.stripe_product_id) {
        // Atualiza informações do produto (nome, descrição, imagens)
        await updateStripeProduct(
          mentorProfile.stripe_account_id,
          course.stripe_product_id,
          {
            name: course.title,
            description: course.description || undefined,
            images: course.image_url ? [course.image_url] : undefined,
            metadata: {
              course_id: course.id,
              mentor_id: course.mentor_id,
              is_free: (!course.is_paid).toString(),
            },
          }
        );
        console.log('✅ Produto Stripe atualizado');

        // Verifica se o preço mudou OU se mudou de pago para gratuito (ou vice-versa)
        const oldPrice = currentCourse.is_paid ? (currentCourse.price || 0) : 0;
        const newPrice = course.is_paid ? (course.price || 0) : 0;
        const priceChanged = oldPrice !== newPrice;
        const typeChanged = currentCourse.is_paid !== course.is_paid;

        if ((priceChanged || typeChanged) && course.stripe_product_id) {
          console.log('💰 Preço ou tipo mudou:', {
            oldPrice,
            newPrice,
            oldType: currentCourse.is_paid ? 'pago' : 'gratuito',
            newType: course.is_paid ? 'pago' : 'gratuito',
            priceChanged,
            typeChanged
          });
          
          // Cria novo preço no Stripe
          const newPriceId = await updateProductPrice(
            mentorProfile.stripe_account_id,
            course.stripe_product_id,
            course.stripe_price_id,
            Math.round(newPrice * 100) // converte para centavos (0 para gratuito)
          );

          // Atualiza o banco com o novo ID de preço
          const { error: priceUpdateError } = await supabase
            .from('cursos')
            .update({
              stripe_price_id: newPriceId,
            })
            .eq('id', courseId);

          if (priceUpdateError) {
            console.error('❌ Erro ao salvar novo ID de preço no curso:', priceUpdateError);
          } else {
            console.log('✅ Novo ID de preço salvo no curso');
          }

          stripeData = {
            stripeProductId: course.stripe_product_id,
            stripePriceId: newPriceId,
          };
        } else {
          stripeData = {
            stripeProductId: course.stripe_product_id,
            stripePriceId: course.stripe_price_id || '',
          };
        }
      } else {
        // Se não tem produto no Stripe, cria um novo
        console.log('🆕 Curso não tem produto no Stripe. Criando novo produto e preço...');
        
        // Determina o preço (0 para cursos gratuitos)
        const priceInCents = course.is_paid && course.price ? Math.round(course.price * 100) : 0;
        
        stripeData = await createStripeProductWithPrice(
          mentorProfile.stripe_account_id,
          {
            name: course.title,
            description: course.description || undefined,
            images: course.image_url ? [course.image_url] : undefined,
            metadata: {
              course_id: course.id,
              mentor_id: course.mentor_id,
              is_free: (!course.is_paid).toString(),
            },
          },
          {
            unitAmount: priceInCents, // 0 para cursos gratuitos
            currency: 'brl',
          }
        );

        // Atualiza o curso com os IDs do Stripe
        const { error: updateError } = await supabase
          .from('cursos')
          .update({
            stripe_product_id: stripeData.stripeProductId,
            stripe_price_id: stripeData.stripePriceId,
          })
          .eq('id', course.id);

        if (updateError) {
          console.error('❌ Erro ao salvar IDs do Stripe no curso:', updateError);
        } else {
          console.log('✅ IDs do Stripe salvos no curso');
        }
      }

    } catch (stripeError) {
      console.error('❌ Erro ao sincronizar com Stripe:', stripeError);
      // Não falha a atualização do curso, apenas loga o erro
      console.log('⚠️ Curso atualizado sem sincronização Stripe devido ao erro acima');
    }

    return { success: true, stripeData };
  } catch (error) {
    console.error('❌ Exception in updateCourseWithStripe:', error);
    throw error;
  }
}

/**
 * Sincroniza um curso existente com o Stripe (útil para cursos criados antes da integração)
 */
export async function syncExistingCourseWithStripe(courseId: string): Promise<{ success: boolean; stripeData?: CourseStripeData }> {
  try {
    console.log('🔄 Sincronizando curso existente com Stripe...', { courseId });

    // Busca os dados do curso
    const course = await getCourseById(courseId);
    if (!course) {
      throw new Error('Curso não encontrado');
    }

    // Se já está sincronizado, retorna os dados existentes
    if (course.stripe_product_id && course.stripe_price_id) {
      console.log('ℹ️ Curso já sincronizado com Stripe');
      return {
        success: true,
        stripeData: {
          stripeProductId: course.stripe_product_id,
          stripePriceId: course.stripe_price_id,
        },
      };
    }

    // Busca os dados do mentor
    const { data: mentorProfile, error: mentorError } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', course.mentor_id)
      .single();

    if (mentorError || !mentorProfile?.stripe_account_id) {
      throw new Error('Mentor não tem conta Stripe configurada');
    }

    // Sincroniza com Stripe (mesmo cursos gratuitos)
    const stripeResult = await syncCourseWithStripe(mentorProfile.stripe_account_id, {
      courseId: course.id,
      mentorId: course.mentor_id,
      name: course.title,
      description: course.description || undefined,
      images: course.image_url ? [course.image_url] : undefined,
      category: course.category || undefined,
      price: course.is_paid && course.price ? course.price : 0
    });

    if (!stripeResult.success || !stripeResult.product || !stripeResult.price) {
      throw new Error(`Erro ao sincronizar com Stripe: ${stripeResult.error}`);
    }

    // Atualizar o curso com os IDs do Stripe
    const { error: updateError } = await supabase
      .from('cursos')
      .update({
        stripe_product_id: stripeResult.product.id,
        stripe_price_id: stripeResult.price.id,
      })
      .eq('id', course.id);

    if (updateError) {
      console.error('❌ Erro ao salvar IDs do Stripe no curso:', updateError);
      throw new Error('Erro ao salvar IDs do Stripe no curso');
    }

    const stripeData = {
      stripeProductId: stripeResult.product.id,
      stripePriceId: stripeResult.price.id,
    };

    console.log('✅ Curso sincronizado com Stripe');

    return { success: true, stripeData };
  } catch (error) {
    console.error('❌ Exception in syncExistingCourseWithStripe:', error);
    throw error;
  }
}

/**
 * Função para criar matrícula em curso gratuito com todos os campos obrigatórios
 */
export async function createFreeEnrollment(courseId: string, studentId: string) {
  try {
    console.log('🆓 Criando matrícula para curso gratuito:', { courseId, studentId });

    // Buscar dados do curso
    const { data: course, error: courseError } = await supabase
      .from('cursos')
      .select('id, title, mentor_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      throw new Error('Curso não encontrado');
    }

    // Buscar dados do mentor
    const { data: mentor, error: mentorError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', course.mentor_id)
      .single();

    // Buscar dados do estudante
    const { data: student, error: studentError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      throw new Error('Usuário não encontrado');
    }

    const studentName = student.full_name || 'Nome não informado';
    const courseOwnerName = mentor?.full_name || 'Mentor não informado';

    console.log('📋 Dados para matrícula:', {
      courseId,
      studentId,
      studentName,
      courseOwnerId: course.mentor_id,
      courseOwnerName
    });

    // Verificar se já existe matrícula
    const { data: existingEnrollment } = await supabase
      .from('matriculas')
      .select('*')
      .eq('course_id', courseId)
      .eq('student_id', studentId)
      .single();

    if (existingEnrollment) {
      if (existingEnrollment.status === 'active') {
        throw new Error('Você já está matriculado neste curso');
      } else {
        // Se existe mas está inativa, ativar
        const { error: updateError } = await supabase
          .from('matriculas')
          .update({
            status: 'active',
            enrolled_at: new Date().toISOString(),
            studant_name: studentName,
            course_owner_id: course.mentor_id,
            course_owner_name: courseOwnerName
          })
          .eq('course_id', courseId)
          .eq('student_id', studentId);

        if (updateError) throw updateError;

        console.log('✅ Matrícula existente ativada com sucesso');
        return { success: true, action: 'updated' };
      }
    }

    // Criar nova matrícula com todos os campos obrigatórios
    const { error: insertError } = await supabase
      .from('matriculas')
      .insert({
        course_id: courseId,
        student_id: studentId,
        status: 'active',
        enrolled_at: new Date().toISOString(),
        progress_percentage: 0,
        studant_name: studentName,
        course_owner_id: course.mentor_id,
        course_owner_name: courseOwnerName
      });

    if (insertError) throw insertError;

    console.log('✅ Nova matrícula criada com sucesso');
    return { success: true, action: 'created' };

  } catch (error) {
    console.error('❌ Erro ao criar matrícula gratuita:', error);
    throw error;
  }
}

/**
 * Função para redirecionar baseado no role do usuário após matrícula
 */
export async function redirectAfterEnrollment(userId: string, navigate: (path: string) => void) {
  try {
    // Buscar role do usuário
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar role do usuário:', error);
      // Fallback para mentorado
      navigate('/mentorado/cursos');
      return;
    }

    const userRole = profile?.role;
    console.log('👤 Role do usuário:', userRole);

    // Redirecionar baseado no role
    if (userRole === 'mentor') {
      navigate('/mentor/cursos-adquiridos');
    } else {
      navigate('/mentorado/cursos');
    }
  } catch (error) {
    console.error('❌ Erro ao redirecionar:', error);
    // Fallback padrão
    navigate('/mentorado/cursos');
  }
}
