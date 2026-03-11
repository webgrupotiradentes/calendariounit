import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { z } from 'zod';
import { toast } from 'sonner';

const emailSchema = z.string().email('Email inválido');
const passwordSchema = z.string().min(6, 'Senha deve ter no mínimo 6 caracteres');

interface UserFormProps {
  onSubmit: (data: { email: string; password: string; fullName: string; isAdmin: boolean }) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({ onSubmit, onCancel }: UserFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
    } catch {
      toast.error('Por favor, insira um email válido');
      return false;
    }

    try {
      passwordSchema.parse(password);
    } catch {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return false;
    }

    if (!fullName.trim()) {
      toast.error('Por favor, insira o nome completo');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ email, password, fullName, isAdmin });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-name">Nome Completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="user-name"
            type="text"
            placeholder="Nome do usuário"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="pl-10 h-11 rounded-xl"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="user-email"
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-11 rounded-xl"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="user-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 h-11 rounded-xl"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between py-2">
        <Label htmlFor="user-admin" className="cursor-pointer">
          Tornar administrador
        </Label>
        <Switch
          id="user-admin"
          checked={isAdmin}
          onCheckedChange={setIsAdmin}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-11 rounded-xl"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 h-11 rounded-xl shadow-apple"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            'Criar Usuário'
          )}
        </Button>
      </div>
    </form>
  );
}