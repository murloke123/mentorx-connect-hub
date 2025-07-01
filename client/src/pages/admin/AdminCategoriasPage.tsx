import React, { useState } from 'react';
import { useCategories, Category } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Palette, Tag } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const CategoriesManagementPage = () => {
  const { categories, loading, fetchAllCategories, createCategory, updateCategory, deleteCategory, toggleCategoryStatus } = useCategories();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#8B5CF6',
    icon: 'User'
  });

  React.useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const handleCreateCategory = async () => {
    try {
      await createCategory({
        ...formData,
        is_active: true
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', color: '#8B5CF6', icon: 'User' });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;
    
    try {
      await updateCategory(editingCategory.id, formData);
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', color: '#8B5CF6', icon: 'User' });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.')) {
      try {
        await deleteCategory(id);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleToggleStatus = async (category: Category) => {
    try {
      await toggleCategoryStatus(category.id, category.is_active);
    } catch (error) {
      // Error handled in hook
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#8B5CF6',
      icon: category.icon || 'User'
    });
    setIsEditDialogOpen(true);
  };

  const colorOptions = [
    '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#F97316',
    '#EC4899', '#6366F1', '#84CC16', '#F43F5E', '#06B6D4', '#8B5A2B'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Categorias</h1>
          <p className="text-gray-600 mt-2">
            Configure as categorias disponíveis na plataforma
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Desenvolvimento Pessoal"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da categoria..."
                />
              </div>
              <div>
                <Label htmlFor="color">Cor</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="icon">Ícone</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="Ex: User, Code, TrendingUp"
                />
              </div>
              <Button onClick={handleCreateCategory} className="w-full">
                Criar Categoria
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Switch
                    checked={category.is_active}
                    onCheckedChange={() => handleToggleStatus(category)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                {category.description || "Sem descrição"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para editar categoria */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome da Categoria</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Desenvolvimento Pessoal"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da categoria..."
              />
            </div>
            <div>
              <Label htmlFor="edit-color">Cor</Label>
              <div className="flex gap-2 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-icon">Ícone</Label>
              <Input
                id="edit-icon"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="Ex: User, Code, TrendingUp"
              />
            </div>
            <Button onClick={handleEditCategory} className="w-full">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesManagementPage; 