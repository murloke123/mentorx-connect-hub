import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testGoogleMeetConfig() {
  try {
    // Configurar autenticação
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ]
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // 1. Testar conexão básica
    console.log('1. Testando conexão básica...');
    const calendarList = await calendar.calendarList.list();
    console.log('✅ Conexão OK, calendários encontrados:', calendarList.data.items?.length);

    // 2. Verificar configurações do calendário principal
    console.log('\n2. Verificando configurações do calendário...');
    const calendarInfo = await calendar.calendars.get({
      calendarId: 'primary'
    });
    console.log('📅 Calendário:', calendarInfo.data.summary);
    console.log('🔧 Propriedades de conferência:', JSON.stringify(calendarInfo.data.conferenceProperties, null, 2));

    // 3. Tentar criar evento SEM Google Meet primeiro
    console.log('\n3. Criando evento básico (sem Google Meet)...');
    const eventoBasico = {
      summary: 'Teste sem Google Meet',
      start: {
        dateTime: '2025-07-09T23:00:00.000Z',
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: '2025-07-09T23:30:00.000Z',
        timeZone: 'America/Sao_Paulo'
      }
    };

    const responseBasico = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventoBasico
    });
    console.log('✅ Evento básico criado:', responseBasico.data.id);

    // 4. Tentar criar evento COM Google Meet
    console.log('\n4. Criando evento com Google Meet...');
    const eventoComMeet = {
      summary: 'Teste COM Google Meet',
      start: {
        dateTime: '2025-07-09T23:30:00.000Z',
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: '2025-07-10T00:00:00.000Z',
        timeZone: 'America/Sao_Paulo'
      },
      conferenceData: {
        createRequest: {
          requestId: 'debug-test-' + Date.now(),
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };

    const responseComMeet = await calendar.events.insert({
      calendarId: 'primary',
      resource: eventoComMeet,
      conferenceDataVersion: 1
    });
    console.log('✅ Evento com Meet criado:', responseComMeet.data.id);
    console.log('🎥 Conference Data:', JSON.stringify(responseComMeet.data.conferenceData, null, 2));

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('📊 Response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
  }
}

// Executar teste
testGoogleMeetConfig();
