import { Edit2, Trash2 } from 'lucide-react';
import { Category, getCategoryStyles } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoriesTable({ categories, onEdit, onDelete }: CategoriesTableProps) {
  if (categories.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center shadow-apple">
        <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl shadow-apple overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="font-semibold">Cor</TableHead>
            <TableHead className="font-semibold">Nome</TableHead>
            <TableHead className="font-semibold hidden sm:table-cell">Prévia</TableHead>
            <TableHead className="font-semibold text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow 
              key={category.id} 
              className="border-border/30 hover:bg-secondary/30 transition-colors"
            >
              <TableCell>
                <div 
                  className="w-6 h-6 rounded-lg"
                  style={{ backgroundColor: `hsl(${category.color})` }}
                />
              </TableCell>
              <TableCell className="font-medium">{category.name}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <span 
                  className="px-3 py-1.5 rounded-lg text-sm font-medium"
                  style={{ 
                    backgroundColor: `hsl(${category.color} / 0.15)`,
                    color: `hsl(${category.color})`
                  }}
                >
                  {category.name}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(category)}
                    className="h-8 w-8 rounded-lg hover:bg-secondary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(category.id)}
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
