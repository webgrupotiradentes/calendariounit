import { useState } from 'react';
import { MoreHorizontal, Shield, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface UserWithRole {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  role: 'admin' | 'user' | 'superadmin';
}

interface UsersTableProps {
  users: UserWithRole[];
  onToggleAdmin: (userId: string, currentRole: string) => void;
  onDelete: (userId: string) => void;
  currentUserEmail?: string;
}

export function UsersTable({ users, onToggleAdmin, onDelete, currentUserEmail }: UsersTableProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Admin</Badge>;
      default:
        return <Badge variant="secondary">Usuário</Badge>;
    }
  };

  return (
    <div className="glass rounded-2xl border border-border/30 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/30">
            <TableHead className="text-muted-foreground font-medium">Nome</TableHead>
            <TableHead className="text-muted-foreground font-medium">Email</TableHead>
            <TableHead className="text-muted-foreground font-medium">Papel</TableHead>
            <TableHead className="text-muted-foreground font-medium">Cadastrado em</TableHead>
            <TableHead className="text-right text-muted-foreground font-medium">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isSuperAdmin = user.role === 'superadmin';
              const isCurrentUser = user.email === currentUserEmail;
              
              return (
                <TableRow key={user.id} className="border-border/30">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      {user.full_name || 'Sem nome'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(user.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-right">
                    {!isSuperAdmin && !isCurrentUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass border-border/30">
                          <DropdownMenuItem onClick={() => onToggleAdmin(user.id, user.role)}>
                            <Shield className="w-4 h-4 mr-2" />
                            {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(user.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}