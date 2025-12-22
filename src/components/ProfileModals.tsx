'use client';

import { useState } from 'react';

interface ProfileModalsProps {
  showQuestionModal: boolean;
  setShowQuestionModal: (show: boolean) => void;
  showAllQuestions: boolean;
  setShowAllQuestions: (show: boolean) => void;
}

export default function ProfileModals({
  showQuestionModal,
  setShowQuestionModal,
  showAllQuestions,
  setShowAllQuestions,
}: ProfileModalsProps) {
  const [question, setQuestion] = useState('');

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle question submission
    setQuestion('');
    setShowQuestionModal(false);
  };

  return (
    <>
      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Fazer uma pergunta</h3>
              <button 
                onClick={() => setShowQuestionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmitQuestion}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sua pergunta
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={4}
                  placeholder="Digite sua pergunta aqui..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
                >
                  Enviar Pergunta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* All Questions Modal */}
      {showAllQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Todas as Perguntas</h3>
              <button 
                onClick={() => setShowAllQuestions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-l-4 border-pink-600 pl-4">
                <p className="font-medium text-gray-900">Qual é o seu horário de atendimento?</p>
                <p className="text-gray-600 text-sm mt-1">Resposta: Atendo de segunda a sábado, das 10h às 22h.</p>
                <span className="text-xs text-gray-500">há 2 dias</span>
              </div>
              
              <div className="border-l-4 border-pink-600 pl-4">
                <p className="font-medium text-gray-900">Atende em hotéis?</p>
                <p className="text-gray-600 text-sm mt-1">Resposta: Sim, atendo em hotéis e também tenho local próprio.</p>
                <span className="text-xs text-gray-500">há 5 dias</span>
              </div>
              
              <div className="border-l-4 border-pink-600 pl-4">
                <p className="font-medium text-gray-900">Aceita cartão de crédito?</p>
                <p className="text-gray-600 text-sm mt-1">Resposta: Sim, aceito cartão de crédito e débito.</p>
                <span className="text-xs text-gray-500">há 1 semana</span>
              </div>
              
              <div className="border-l-4 border-pink-600 pl-4">
                <p className="font-medium text-gray-900">Qual é a duração mínima do atendimento?</p>
                <p className="text-gray-600 text-sm mt-1">Resposta: A duração mínima é de 1 hora.</p>
                <span className="text-xs text-gray-500">há 2 semanas</span>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAllQuestions(false)}
                className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 