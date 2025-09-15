import { DocumentUploadTest } from './DocumentUploadTest';

export default function DocumentTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Teste de Upload de Documentos - Stripe Integration
        </h1>
        <DocumentUploadTest />
      </div>
    </div>
  );
}
