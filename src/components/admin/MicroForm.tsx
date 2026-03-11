import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Micro, Macro } from '@/types/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MicroFormProps {
    micro?: Micro;
    macros: Macro[];
    onSubmit: (data: Omit<Micro, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

export function MicroForm({ micro, macros, onSubmit, onCancel }: MicroFormProps) {
    const [name, setName] = useState(micro?.name || '');
    const [macroId, setMacroId] = useState(micro?.macroId || '');

    useEffect(() => {
        if (micro) {
            setName(micro.name);
            setMacroId(micro.macroId);
        }
    }, [micro]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!macroId) return;
        onSubmit({ name, macroId });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="macro">IES (Macro)</Label>
                <Select value={macroId} onValueChange={setMacroId} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a IES associada" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                        {macros.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Nome do Local (Micro)</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Sala 101, Auditório Principal..."
                    required
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={!name || !macroId}>
                    {micro ? 'Atualizar' : 'Criar'} Local
                </Button>
            </div>
        </form>
    );
}
