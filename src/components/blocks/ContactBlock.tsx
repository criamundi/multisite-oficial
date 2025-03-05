import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Field {
  type: string;
  name: string;
  label: string;
  required: boolean;
}

interface ContactBlockProps {
  settings: {
    layout: string;
    submitButton: {
      text: string;
      style: string;
    };
  };
  fields: Field[];
  siteId: string;
}

export function ContactBlock({ settings, fields, siteId }: ContactBlockProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Primeiro, carregar as configurações de leads do site
      const { data: leadSettings, error: settingsError } = await supabase
        .from('lead_settings')
        .select('*')
        .eq('site_id', siteId)
        .single();

      if (settingsError) throw settingsError;

      // Criar o lead
      const { error: leadError } = await supabase
        .from('leads')
        .insert([{
          site_id: siteId,
          data: formData,
          source_url: window.location.href
        }]);

      if (leadError) throw leadError;

      setSuccess(true);
      setFormData({});

      // Mostrar mensagem de sucesso por 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Erro ao enviar formulário:', err);
      setError('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 px-4">
      <div className="max-w-lg mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
            Mensagem enviada com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              settings.submitButton.style === 'primary'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Enviando...' : settings.submitButton.text}
          </button>
        </form>
      </div>
    </div>
  );
}