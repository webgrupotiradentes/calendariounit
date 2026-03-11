import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Macro } from '@/types/calendar';

interface MacroFormProps {
    macro?: Macro;
    onSubmit: (data: Omit<Macro, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

export function MacroForm({ macro, onSubmit, onCancel }: MacroFormProps) {
    const [name, setName] = useState(macro?.name || '');

    useEffect(() => {
        if (macro) {
            setName(macro.name);
        }
    }, [macro]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome do Macro (IES)</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: UFPE, UFRPE, Auditorio Principal..."
                    required
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit">
                    {macro ? 'Atualizar' : 'Criar'} Macro
                </Button>
            </div>
        </form>
    );
}
