import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Plus, ArrowLeft, Eye, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { BlockRenderer } from '../components/blocks/BlockRenderer';
import { BlockEditor } from '../components/blocks/BlockEditor';

interface PageBlock {
  id: string;
  type: string;
  content?: any;
  settings?: any;
  background?: any;
  items?: any[];
  fields?: any[];
  slides?: any[];
}

interface Page {
  id: string;
  title: string;
  slug: string;
  blocks: PageBlock[];
  is_published: boolean;
}

export function PageEditor() {
  const { siteId, pageId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [showBlocksModal, setShowBlocksModal] = useState(false);
  const [availableBlocks, setAvailableBlocks] = useState<any[]>([]);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    loadPage();
    loadAvailableBlocks();
  }, [pageId]);

  async function loadPage() {
    try {
      const { data: page, error } = await supabase
        .from('site_pages')
        .select('*')
        .eq('id', pageId)
        .single();

      if (error) throw error;
      setPage(page);
    } catch (err) {
      console.error('Erro ao carregar página:', err);
      setError('Erro ao carregar página. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAvailableBlocks() {
    try {
      const { data: blocks, error } = await supabase
        .from('page_blocks')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setAvailableBlocks(blocks || []);
    } catch (err) {
      console.error('Erro ao carregar blocos:', err);
    }
  }

  const handleSave = async () => {
    if (!page) return;
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('site_pages')
        .update({
          blocks: page.blocks,
          updated_at: new Date().toISOString()
        })
        .eq('id', page.id);

      if (error) throw error;

      setSuccessMessage('Página salva com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar página:', err);
      setError('Erro ao salvar página. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlock = (blockTemplate: any) => {
    if (!page) return;

    const newBlock = {
      id: crypto.randomUUID(),
      type: blockTemplate.content.type,
      settings: blockTemplate.content.settings || {},
      content: blockTemplate.content.content || {},
      items: blockTemplate.content.items || [],
      background: blockTemplate.content.background || {},
      fields: blockTemplate.content.fields || [],
      slides: blockTemplate.content.slides || []
    };

    setPage({
      ...page,
      blocks: [...page.blocks, newBlock]
    });

    setShowBlocksModal(false);
  };

  const handleRemoveBlock = (index: number) => {
    if (!page) return;

    const newBlocks = [...page.blocks];
    newBlocks.splice(index, 1);

    setPage({
      ...page,
      blocks: newBlocks
    });

    setSelectedBlockIndex(null);
  };

  const handleUpdateBlock = (index: number, updatedBlock: PageBlock) => {
    if (!page) return;

    const newBlocks = [...page.blocks];
    newBlocks[index] = updatedBlock;

    setPage({
      ...page,
      blocks: newBlocks
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedBlockIndex(index);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedBlockIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedBlockIndex === null || draggedBlockIndex === index) return;

    const draggedBlock = page?.blocks[draggedBlockIndex];
    const targetBlock = page?.blocks[index];

    if (!draggedBlock || !targetBlock || !page) return;

    const newBlocks = [...page.blocks];
    newBlocks.splice(draggedBlockIndex, 1);
    newBlocks.splice(index, 0, draggedBlock);

    setPage({
      ...page,
      blocks: newBlocks
    });
    setDraggedBlockIndex(index);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Carregando página...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Página não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/sites/${siteId}/pages`)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{page.title}</h1>
            <p className="text-gray-600">/{page.slug}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.open(`/sites/${siteId}/p/${page.slug}`, '_blank')}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Eye size={20} />
            <span>Visualizar</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Área de Visualização */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-100">
              <button
                onClick={() => setShowBlocksModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Adicionar Bloco</span>
              </button>
            </div>
            <div className="p-6">
              {page.blocks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    Nenhum bloco adicionado. Clique em "Adicionar Bloco" para começar.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {page.blocks.map((block, index) => (
                    <div
                      key={block.id}
                      ref={el => blockRefs.current[index] = el}
                      draggable
                      onDragStart={e => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={e => handleDragOver(e, index)}
                      className={`relative border-2 rounded-lg transition-all ${
                        selectedBlockIndex === index ? 'border-blue-500' : 'border-transparent'
                      } ${draggedBlockIndex === index ? 'opacity-50' : ''}`}
                      onClick={() => setSelectedBlockIndex(index)}
                    >
                      <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
                        <div 
                          className="cursor-move p-1 bg-white rounded border border-gray-200 text-gray-600 hover:text-gray-900"
                          title="Arrastar para reordenar"
                        >
                          <GripVertical size={16} />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveBlock(index);
                          }}
                          className="p-1 bg-white rounded border border-gray-200 text-gray-600 hover:text-red-600"
                          title="Remover bloco"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <BlockRenderer block={block} siteId={siteId || ''} isEditing={true} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Área de Edição */}
        <div>
          {selectedBlockIndex !== null && page.blocks[selectedBlockIndex] && (
            <BlockEditor
              block={page.blocks[selectedBlockIndex]}
              onUpdate={(updatedBlock) => handleUpdateBlock(selectedBlockIndex, updatedBlock)}
            />
          )}
        </div>
      </div>

      {/* Modal de Blocos */}
      {showBlocksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Bloco</h3>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer p-4"
                    onClick={() => handleAddBlock(block)}
                  >
                    <h4 className="font-medium text-gray-900">{block.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{block.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowBlocksModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
