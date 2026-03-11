import { useState, useEffect } from 'react';
import { Category } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const COLOR_PRESETS = [
  { name: 'Azul', value: '217 91% 60%' },
  { name: 'Verde', value: '142 76% 36%' },
  { name: 'Amarelo', value: '47 96% 53%' },
  { name: 'Roxo', value: '262 83% 58%' },
  { name: 'Vermelho', value: '0 84% 60%' },
  { name: 'Rosa', value: '330 81% 60%' },
  { name: 'Laranja', value: '25 95% 53%' },
  { name: 'Ciano', value: '187 85% 43%' },
  { name: 'Índigo', value: '239 84% 67%' },
  { name: 'Esmeralda', value: '160 84% 39%' },
];

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || COLOR_PRESETS[0].value);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), color });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Categoria</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Eventos Especiais"
          className="rounded-xl"
          maxLength={50}
          required
        />
      </div>

      <div className="space-y-3">
        <Label>Cor</Label>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => setColor(preset.value)}
              className={`
                w-full aspect-square rounded-xl transition-all duration-200
                ${color === preset.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-95' : 'hover:scale-105'}
              `}
              style={{ backgroundColor: `hsl(${preset.value})` }}
              title={preset.name}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label>Prévia</Label>
        <div 
          className="p-3 rounded-xl text-sm font-medium"
          style={{ 
            backgroundColor: `hsl(${color} / 0.15)`,
            color: `hsl(${color})`
          }}
        >
          {name || 'Nome da categoria'}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl"
        >
          Cancelar
        </Button>
        <Button type="submit" className="rounded-xl" disabled={!name.trim()}>
          {category ? 'Salvar' : 'Criar'}
        </Button>
      </div>
    </form>
  );
}
