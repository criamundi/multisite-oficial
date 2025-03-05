import React, { useState, useRef } from 'react';
import { Save, Plus, ArrowLeft, Eye, Trash2, GripVertical } from 'lucide-react';

interface BlockEditorProps {
  block: any;
  onUpdate: (updatedBlock: any) => void;
}

export function BlockEditor({ block, onUpdate }: BlockEditorProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleContentChange = (path: string, value: any) => {
    const newBlock = { ...block };
    const pathParts = path.split('.');
    let current = newBlock;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;
    
    onUpdate(newBlock);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItemIndex(index);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedItemIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const items = block.items ? [...block.items] : [];
    const [draggedItem] = items.splice(draggedItemIndex, 1);
    items.splice(index, 0, draggedItem);

    handleContentChange('items', items);
    setDraggedItemIndex(index);
  };

  const renderEditor = () => {
    if (!block || !block.type) {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Bloco inválido ou tipo não especificado
        </div>
      );
    }

    switch (block.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Conteúdo</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={block.content?.title || ''}
                    onChange={(e) => handleContentChange('content.title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={block.content?.subtitle || ''}
                    onChange={(e) => handleContentChange('content.subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={block.content?.button?.text || ''}
                    onChange={(e) => handleContentChange('content.button.text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL do Botão
                  </label>
                  <input
                    type="text"
                    value={block.content?.button?.url || ''}
                    onChange={(e) => handleContentChange('content.button.url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Configurações</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Altura
                  </label>
                  <input
                    type="text"
                    value={block.settings?.height || '600px'}
                    onChange={(e) => handleContentChange('settings.height', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="600px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alinhamento
                  </label>
                  <select
                    value={block.settings?.alignment || 'center'}
                    onChange={(e) => handleContentChange('settings.alignment', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="left">Esquerda</option>
                    <option value="center">Centro</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={block.settings?.overlay || false}
                    onChange={(e) => handleContentChange('settings.overlay', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Usar overlay
                  </label>
                </div>
                {block.settings?.overlay && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cor do Overlay
                    </label>
                    <input
                      type="text"
                      value={block.settings?.overlayColor || 'rgba(0,0,0,0.5)'}
                      onChange={(e) => handleContentChange('settings.overlayColor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="rgba(0,0,0,0.5)"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Background</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL da Imagem
                  </label>
                  <input
                    type="text"
                    value={block.background?.url || ''}
                    onChange={(e) => handleContentChange('background.url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posição
                  </label>
                  <select
                    value={block.background?.position || 'center'}
                    onChange={(e) => handleContentChange('background.position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="center">Centro</option>
                    <option value="top">Topo</option>
                    <option value="bottom">Base</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tamanho
                  </label>
                  <select
                    value={block.background?.size || 'cover'}
                    onChange={(e) => handleContentChange('background.size', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Configurações</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Colunas
                  </label>
                  <select
                    value={block.settings?.columns || 3}
                    onChange={(e) => handleContentChange('settings.columns', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="2">2 Colunas</option>
                    <option value="3">3 Colunas</option>
                    <option value="4">4 Colunas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Espaçamento
                  </label>
                  <input
                    type="text"
                    value={block.settings?.gap || '2rem'}
                    onChange={(e) => handleContentChange('settings.gap', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="2rem"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700">Recursos</h3>
                <button
                  onClick={() => {
                    const newItems = [...(block.items || [])];
                    newItems.push({
                      icon: 'Star',
                      title: 'Novo Recurso',
                      description: 'Descrição do recurso'
                    });
                    handleContentChange('items', newItems);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar Recurso
                </button>
              </div>

              {(block.items || []).map((item: any, index: number) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-gray-50 rounded-lg"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  ref={(el) => (blockRefs.current[index] = el)}
                >
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ícone
                      </label>
                      <input
                        type="text"
                        value={item.icon}
                        onChange={(e) => {
                          const newItems = [...block.items];
                          newItems[index].icon = e.target.value;
                          handleContentChange('items', newItems);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const newItems = [...block.items];
                          newItems[index].title = e.target.value;
                          handleContentChange('items', newItems);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...block.items];
                          newItems[index].description = e.target.value;
                          handleContentChange('items', newItems);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        const newItems = [...block.items];
                        newItems.splice(index, 1);
                        handleContentChange('items', newItems);
                      }}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Configurações</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={block.settings?.autoplay || false}
                    onChange={(e) => handleContentChange('settings.autoplay', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Reprodução automática
                  </label>
                </div>
                {block.settings?.autoplay && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intervalo (ms)
                    </label>
                    <input
                      type="number"
                      value={block.settings?.interval || 5000}
                      onChange={(e) => handleContentChange('settings.interval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="1000"
                      step="1000"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700">Depoimentos</h3>
                <button
                  onClick={() => {
                    const newItems = [...(block.items || [])];
                    newItems.push({
                      name: 'Nome do Cliente',
                      role: 'Cargo',
                      company: 'Empresa',
                      image: '',
                      text: 'Depoimento do cliente'
                    });
                    handleContentChange('items', newItems);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar Depoimento
                </button>
              </div>

              {(block.items || []).map((item: any, index: number) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-gray-50 rounded-lg"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  ref={(el) => (blockRefs.current[index] = el)}
                >
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const newItems = [...block.items];
                          newItems[index].name = e.target.value;
                          handleContentChange('items', newItems);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cargo
                        </label>
                        <input
                          type="text"
                          value={item.role}
                          onChange={(e) => {
                            const newItems = [...block.items];
                            newItems[index].role = e.target.value;
                            handleContentChange('items', newItems);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Empresa
                        </label>
                        <input
                          type="text"
                          value={item.company}
                          onChange={(e) => {
                            const newItems = [...block.items];
                            newItems[index].company = e.target.value;
                            handleContentChange('items', newItems);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL da Foto
                      </label>
                      <input
                        type="text"
                        value={item.image}
                        onChange={(e) => {
                          const newItems = [...block.items];
                          newItems[index].image = e.target.value;
                          handleContentChange('items', newItems);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Depoimento
                      </label>
                      <textarea
                        value={item.text}
                        onChange={(e) => {
                          const newItems = [...block.items];
                          newItems[index].text = e.target.value;
                          handleContentChange('items', newItems);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        const newItems = [...block.items];
                        newItems.splice(index, 1);
                        handleContentChange('items', newItems);
                      }}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Configurações do Formulário</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Layout
                  </label>
                  <select
                    value={block.settings?.layout || 'stacked'}
                    onChange={(e) => handleContentChange('settings.layout', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="stacked">Empilhado</option>
                    <option value="inline">Em linha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={block.settings?.submitButton?.text || 'Enviar'}
                    onChange={(e) => handleContentChange('settings.submitButton.text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estilo do Botão
                  </label>
                  <select
                    value={block.settings?.submitButton?.style || 'primary'}
                    onChange={(e) => handleContentChange('settings.submitButton.style', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="primary">Primário</option>
                    <option value="secondary">Secundário</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700">Campos do Formulário</h3>
                <button
                  onClick={() => {
                    const newFields = [...(block.fields || [])];
                    newFields.push({
                      type: 'text',
                      name: `field_${newFields.length + 1}`,
                      label: 'Novo Campo',
                      required: false
                    });
                    handleContentChange('fields', newFields);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar Campo
                </button>
              </div>

              {(block.fields || []).map((field: any, index: number) => (
                <div
                  key={index}
                  className="mb-4 p-4 bg-gray-50 rounded-lg"
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  ref={(el) => (blockRefs.current[index] = el)}
                >
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => {
                            const newFields = [...block.fields];
                            newFields[index].type = e.target.value;
                            handleContentChange('fields', newFields);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="text">Texto</option>
                          <option value="email">E-mail</option>
                          <option value="tel">Telefone</option>
                          <option value="textarea">Área de texto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Campo
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => {
                            const newFields = [...block.fields];
                            newFields[index].name = e.target.value;
                            handleContentChange('fields', newFields);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rótulo
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const newFields = [...block.fields];
                          newFields[index].label = e.target.value;
                          handleContentChange('fields', newFields);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => {
                          const newFields = [...block.fields];
                          newFields[index].required = e.target.checked;
                          handleContentChange('fields', newFields);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Campo obrigatório
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        const newFields = [...block.fields];
                        newFields.splice(index, 1);
                        handleContentChange('fields', newFields);
                      }}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'slide':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Configurações</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Altura
                  </label>
                  <input
                    type="text"
                    value={block.settings?.height || '500px'}
                    onChange={(e) => handleContentChange('settings.height', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="500px"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={block.settings?.autoplay || false}
                    onChange={(e) => handleContentChange('settings.autoplay', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Reprodução automática
                  </label>
                </div>
                {block.settings?.autoplay && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intervalo (ms)
                    </label>
                    <input
                      type="number"
                      value={block.settings?.interval || 5000}
                      onChange={(e) => handleContentChange('settings.interval', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="1000"
                      step="1000"
                    />
                  </div>
                )}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={block.settings?.overlay || false}
                    onChange={(e) => handleContentChange('settings.overlay', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Usar overlay
                  </label>
                </div>
                {block.settings?.overlay && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cor do Overlay
                    </label>
                    <input
                      type="text"
                      value={block.settings?.overlayColor || 'rgba(0,0,0,0.3)'}
                      onChange={(e) => handleContentChange('settings.overlayColor', e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="rgba(0,0,0,0.3)"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700">Slides</h3>
                <button
                  onClick={() => {
                    const newSlides = [...(block.slides || [])];
                    newSlides.push({
                      id: crypto.randomUUID(),
                      image_url: '',
                      title: 'Novo Slide',
                      subtitle: 'Descrição do slide',
                      button_text: 'Saiba Mais',
                      button_url: '#'
                    });
                    handleContentChange('slides', newSlides);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar Slide
                </button>
              </div>

              {(block.slides || []).map((slide: any, index: number) => (
                <div
                  key={slide.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  ref={(el) => (blockRefs.current[index] = el)}
                  className="mb-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="cursor-move text-gray-400">
                      <GripVertical size={20} />
                    </div>
                    <span className="text-sm text-gray-500">Arraste para reordenar</span>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL da Imagem
                      </label>
                      <input
                        type="text"
                        value={slide.image_url}
                        onChange={(e) => {
                          const newSlides = [...block.slides];
                          newSlides[index].image_url = e.target.value;
                          handleContentChange('slides', newSlides);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => {
                          const newSlides = [...block.slides];
                          newSlides[index].title = e.target.value;
                          handleContentChange('slides', newSlides);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtítulo
                      </label>
                      <input
                        type="text"
                        value={slide.subtitle}
                        onChange={(e) => {
                          const newSlides = [...block.slides];
                          newSlides[index].subtitle = e.target.value;
                          handleContentChange('slides', newSlides);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Texto do Botão
                        </label>
                        <input
                          type="text"
                          value={slide.button_text}
                          onChange={(e) => {
                            const newSlides = [...block.slides];
                            newSlides[index].button_text = e.target.value;
                            handleContentChange('slides', newSlides);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          URL do Botão
                        </label>
                        <input
                          type="text"
                          value={slide.button_url}
                          onChange={(e) => {
                            const newSlides = [...block.slides];
                            newSlides[index].button_url = e.target.value;
                            handleContentChange('slides', newSlides);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        const newSlides = [...block.slides];
                        newSlides.splice(index, 1);
                        handleContentChange('slides', newSlides);
                      }}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'menu':
        return (
          <div className="space-y-4">
            {/* Configurações do Menu */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Configurações do Menu</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posição
                  </label>
                  <select
                    value={block.settings?.position || 'top'}
                    onChange={(e) => handleContentChange('settings.position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="top">Topo</option>
                    <option value="left">Esquerda</option>
                    <option value="right">Direita</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estilo
                  </label>
                  <select
                    value={block.settings?.style || 'fixed'}
                    onChange={(e) => handleContentChange('settings.style', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="fixed">Fixo</option>
                    <option value="absolute">Absoluto</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alinhamento dos Links
                </label>
                <select
                  value={block.settings?.alignment || 'left'}
                  onChange={(e) => handleContentChange('settings.alignment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                </select>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor de Fundo
                  </label>
                  <input
                    type="text"
                    value={block.settings?.backgroundColor || 'white'}
                    onChange={(e) => handleContentChange('settings.backgroundColor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="white ou #ffffff"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor do Texto
                  </label>
                  <input
                    type="text"
                    value={block.settings?.textColor || 'gray-800'}
                    onChange={(e) => handleContentChange('settings.textColor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="gray-800 ou #1f2937"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor do Hover
                </label>
                <input
                  type="text"
                  value={block.settings?.hoverColor || 'blue-600'}
                  onChange={(e) => handleContentChange('settings.hoverColor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="blue-600 ou #2563eb"
                />
              </div>
            </div>

            {/* Itens do Menu */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700">Itens do Menu</h3>
                <button
                  onClick={() => {
                    const newItems = [...(block.items || [])];
                    newItems.push({
                      id: crypto.randomUUID(),
                      label: 'Novo Item',
                      url: '#',
                      isAnchor: true
                    });
                    handleContentChange('items', newItems);
                  }}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar Item
                </button>
              </div>

              {(block.items || []).map((item: any, index: number) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  ref={(el) => (blockRefs.current[index] = el)}
                  className="mb-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="cursor-move text-gray-400">
                      <GripVertical size={20} />
                    </div>
                    <span className="text-sm text-gray-500">Arraste para reordenar</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Texto
                      </label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const newItems = [...block.items];
                          newItems[index].label = e.target.value;
                          handleContentChange('items', newItems);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL
                      </label>
                      <input
                        type="text"
                        value={item.url}
                        onChange={(e) => {
                          const newItems = [...block.items];
                          newItems[index].url = e.target.value;
                          handleContentChange('items', newItems);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="# para âncoras ou URL completa"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.isAnchor}
                        onChange={(e) => {
                          const newItems = [...block.items];
                          newItems[index].isAnchor = e.target.checked;
                          handleContentChange('items', newItems);
                        }}
                        className="rounded border-gray-300 text-blue-600 mr-2"
                      />
                      <span className="text-sm text-gray-700">Link Âncora</span>
                    </label>

                    <button
                      onClick={() => {
                        const newItems = [...block.items];
                        newItems.splice(index, 1);
                        handleContentChange('items', newItems);
                      }}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remover Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            Tipo de bloco não suportado: {block.type}
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'content'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Conteúdo
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Configurações
          </button>
        </nav>
      </div>
      <div className="p-6">
        {renderEditor()}
      </div>
    </div>
  );
}