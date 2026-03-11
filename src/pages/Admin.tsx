import { useState, useEffect } from 'react';
import { Plus, Tags, Users, Map, MapPin, Filter, ClipboardList } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { AdminStats } from '@/components/admin/AdminStats';
import { EventsTable } from '@/components/admin/EventsTable';
import { EventForm } from '@/components/admin/EventForm';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { CategoriesTable } from '@/components/admin/CategoriesTable';
import { UsersTable, UserWithRole } from '@/components/admin/UsersTable';
import { UserForm } from '@/components/admin/UserForm';
import { MacroForm } from '@/components/admin/MacroForm';
import { MacrosTable } from '@/components/admin/MacrosTable';
import { MicroForm } from '@/components/admin/MicroForm';
import { MicrosTable } from '@/components/admin/MicrosTable';
import { LogsTable } from '@/components/admin/LogsTable';
import { SearchBar } from '@/components/calendar/SearchBar';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCategories } from '@/hooks/useCategories';
import { useMacros } from '@/hooks/useMacros';
import { useMicros } from '@/hooks/useMicros';
import { useAuth } from '@/hooks/useAuth';
import { useLogs } from '@/hooks/useLogs';
import { CalendarEvent, Category, Macro, Micro } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const { events, addEvent, updateEvent, deleteEvent, filterEvents, refetch: refetchEvents } = useCalendarEvents();
  const { categories, addCategory, updateCategory, deleteCategory, refetch: refetchCategories } = useCategories();
  const { macros, addMacro, updateMacro, deleteMacro } = useMacros();
  const { micros, addMicro, updateMicro, deleteMicro } = useMicros();
  const { logs, isLoading: isLoadingLogs } = useLogs();
  const { isAdmin, isSuperAdmin, user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const [isMacroFormOpen, setIsMacroFormOpen] = useState(false);
  const [editingMacro, setEditingMacro] = useState<Macro | null>(null);
  const [deletingMacroId, setDeletingMacroId] = useState<string | null>(null);

  const [isMicroFormOpen, setIsMicroFormOpen] = useState(false);
  const [editingMicro, setEditingMicro] = useState<Micro | null>(null);
  const [deletingMicroId, setDeletingMicroId] = useState<string | null>(null);

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [filterMacro, setFilterMacro] = useState<string>('all');
  const [filterMicro, setFilterMicro] = useState<string>('all');

  const filteredEvents = filterEvents(
    [],
    searchQuery,
    filterMacro !== 'all' ? [filterMacro] : [],
    filterMicro !== 'all' ? filterMicro : undefined
  );

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at,
          role: (userRole?.role as 'admin' | 'user' | 'superadmin') || 'user',
        };
      });
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // ── Event handlers ──────────────────────────────────────────
  const handleCreateEvent = async (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addEvent(data);
      setIsEventFormOpen(false);
      toast.success('Evento criado com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar evento');
    }
  };

  const handleUpdateEvent = async (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingEvent) return;
    try {
      await updateEvent(editingEvent.id, data);
      setEditingEvent(null);
      toast.success('Evento atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao atualizar evento');
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEventId) return;
    try {
      await deleteEvent(deletingEventId);
      setDeletingEventId(null);
      toast.success('Evento excluído com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao excluir evento');
    }
  };

  // ── Category handlers ────────────────────────────────────────
  const handleCreateCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addCategory(data);
      setIsCategoryFormOpen(false);
      toast.success('Categoria criada com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar categoria');
    }
  };

  const handleUpdateCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingCategory) return;
    try {
      await updateCategory(editingCategory.id, data);
      setEditingCategory(null);
      toast.success('Categoria atualizada com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao atualizar categoria');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategoryId) return;
    const eventsWithCategory = events.filter(e => e.categoryId === deletingCategoryId);
    if (eventsWithCategory.length > 0) {
      toast.error(`Não é possível excluir: ${eventsWithCategory.length} evento(s) usam esta categoria.`);
      setDeletingCategoryId(null);
      return;
    }
    try {
      await deleteCategory(deletingCategoryId);
      setDeletingCategoryId(null);
      toast.success('Categoria excluída com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao excluir categoria');
    }
  };

  // ── Macro handlers ───────────────────────────────────────────
  const handleCreateMacro = async (data: Omit<Macro, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addMacro(data);
      setIsMacroFormOpen(false);
      toast.success('IES criada com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar IES');
    }
  };

  const handleUpdateMacro = async (data: Omit<Macro, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingMacro) return;
    try {
      await updateMacro(editingMacro.id, data);
      setEditingMacro(null);
      toast.success('IES atualizada com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao atualizar IES');
    }
  };

  const handleDeleteMacro = async () => {
    if (!deletingMacroId) return;
    const microsInMacro = micros.filter(m => m.macroId === deletingMacroId);
    if (microsInMacro.length > 0) {
      toast.error(`Não é possível excluir: existem ${microsInMacro.length} local(is) vinculado(s) a esta IES.`);
      setDeletingMacroId(null);
      return;
    }
    try {
      await deleteMacro(deletingMacroId);
      setDeletingMacroId(null);
      toast.success('IES excluída com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao excluir IES');
    }
  };

  // ── Micro handlers ───────────────────────────────────────────
  const handleCreateMicro = async (data: Omit<Micro, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addMicro(data);
      setIsMicroFormOpen(false);
      toast.success('Local criado com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao criar local');
    }
  };

  const handleUpdateMicro = async (data: Omit<Micro, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingMicro) return;
    try {
      await updateMicro(editingMicro.id, data);
      setEditingMicro(null);
      toast.success('Local atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao atualizar local');
    }
  };

  const handleDeleteMicro = async () => {
    if (!deletingMicroId) return;
    try {
      await deleteMicro(deletingMicroId);
      setDeletingMicroId(null);
      toast.success('Local excluído com sucesso!');
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao excluir local');
    }
  };

  // ── User handlers ─────────────────────────────────────────────
  const handleCreateUser = async (data: { email: string; password: string; fullName: string; isAdmin: boolean }) => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.fullName } },
      });

      if (signUpError) {
        toast.error(signUpError.message.includes('User already registered') ? 'Este email já está cadastrado.' : signUpError.message);
        return;
      }

      if (data.isAdmin && authData.user) {
        await supabase.from('user_roles').update({ role: 'admin' }).eq('user_id', authData.user.id);
      }

      toast.success('Usuário criado com sucesso!');
      setIsUserFormOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao criar usuário');
    }
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('user_id', userId);
      if (error) throw error;
      toast.success(newRole === 'admin' ? 'Usuário promovido a admin!' : 'Permissão de admin removida!');
      fetchUsers();
    } catch {
      toast.error('Erro ao alterar permissão');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', deletingUserId);
      if (error) throw error;
      toast.success('Usuário excluído com sucesso!');
      setDeletingUserId(null);
      fetchUsers();
    } catch {
      toast.error('Erro ao excluir usuário.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Administração</h1>
          <p className="text-muted-foreground">Gerencie os eventos, categorias, IES e locais do calendário</p>
        </div>

        <div className="mb-8">
          <AdminStats events={events} categories={categories} />
        </div>

        <Tabs defaultValue="events">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="events">Eventos</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
              <TabsTrigger value="ies">
                <Map className="w-3.5 h-3.5 mr-1.5" />IES
              </TabsTrigger>
              <TabsTrigger value="locais">
                <MapPin className="w-3.5 h-3.5 mr-1.5" />Locais
              </TabsTrigger>
              <TabsTrigger value="logs">
                <ClipboardList className="w-3.5 h-3.5 mr-1.5" />Logs
              </TabsTrigger>
              {isAdmin && <TabsTrigger value="users">Usuários</TabsTrigger>}
            </TabsList>
          </div>

          {/* ── Events ─────────────────────────────── */}
          <TabsContent value="events" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <SearchBar value={searchQuery} onChange={setSearchQuery} className="max-w-xs" />
                <Select value={filterMacro} onValueChange={(v) => { setFilterMacro(v); setFilterMicro('all'); }}>
                  <SelectTrigger className="h-9 w-[130px] rounded-xl text-xs">
                    <Filter className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="IES (Macro)" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-lg z-50">
                    <SelectItem value="all">Todas as IES</SelectItem>
                    {macros.map(opt => (
                      <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {micros.length > 0 && (
                  <Select value={filterMicro} onValueChange={setFilterMicro}>
                    <SelectTrigger className="h-9 w-[160px] rounded-xl text-xs">
                      <Filter className="w-3 h-3 mr-1" />
                      <SelectValue placeholder="Local (Micro)" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="all">Todos os locais</SelectItem>
                      {micros
                        .filter(loc => filterMacro === 'all' || loc.macroId === filterMacro)
                        .map(loc => (
                          <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
                <span className="text-sm text-muted-foreground">
                  {filteredEvents.length} evento{filteredEvents.length !== 1 && 's'}
                </span>
              </div>
              <Button onClick={() => setIsEventFormOpen(true)} className="h-11 px-5 rounded-xl">
                <Plus className="w-4 h-4 mr-2" />Novo Evento
              </Button>
            </div>
            <EventsTable events={filteredEvents} categories={categories} onEdit={setEditingEvent} onDelete={setDeletingEventId} />
          </TabsContent>

          {/* ── Categories ─────────────────────────── */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {categories.length} categoria{categories.length !== 1 && 's'}
              </span>
              <Button onClick={() => setIsCategoryFormOpen(true)} className="h-11 px-5 rounded-xl">
                <Tags className="w-4 h-4 mr-2" />Nova Categoria
              </Button>
            </div>
            <CategoriesTable categories={categories} onEdit={setEditingCategory} onDelete={setDeletingCategoryId} />
          </TabsContent>

          {/* ── IES (Macros) ───────────────────────── */}
          <TabsContent value="ies" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {macros.length} IES cadastrada{macros.length !== 1 && 's'}
              </span>
              <Button onClick={() => setIsMacroFormOpen(true)} className="h-11 px-5 rounded-xl">
                <Map className="w-4 h-4 mr-2" />Nova IES
              </Button>
            </div>
            <MacrosTable macros={macros} onEdit={setEditingMacro} onDelete={setDeletingMacroId} />
          </TabsContent>

          {/* ── Locais (Micros) ────────────────────── */}
          <TabsContent value="locais" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {micros.length} local{micros.length !== 1 && 'is'} cadastrado{micros.length !== 1 && 's'}
              </span>
              <Button onClick={() => setIsMicroFormOpen(true)} className="h-11 px-5 rounded-xl" disabled={macros.length === 0}>
                <MapPin className="w-4 h-4 mr-2" />Novo Local
              </Button>
            </div>
            {macros.length === 0 && (
              <p className="text-sm text-amber-500 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                Cadastre pelo menos uma IES antes de criar locais.
              </p>
            )}
            <MicrosTable micros={micros} macros={macros} onEdit={setEditingMicro} onDelete={setDeletingMicroId} />
          </TabsContent>

          {/* ── Logs ────────────────────────────────── */}
          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Últimas {logs.length} atividades registradas
              </span>
            </div>
            <LogsTable logs={logs} isLoading={isLoadingLogs} />
          </TabsContent>

          {/* ── Users ──────────────────────────────── */}
          {isAdmin && (
            <TabsContent value="users" className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {users.length} usuário{users.length !== 1 && 's'}
                </span>
                <Button onClick={() => setIsUserFormOpen(true)} className="h-11 px-5 rounded-xl">
                  <Users className="w-4 h-4 mr-2" />Novo Usuário
                </Button>
              </div>
              <UsersTable users={users} onToggleAdmin={handleToggleAdmin} onDelete={setDeletingUserId} currentUserEmail={user?.email} />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* ── Event Dialogs ──────────────────────────── */}
      <Dialog open={isEventFormOpen} onOpenChange={setIsEventFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Novo Evento</DialogTitle></DialogHeader>
          <EventForm categories={categories} onSubmit={handleCreateEvent} onCancel={() => setIsEventFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Editar Evento</DialogTitle></DialogHeader>
          {editingEvent && (
            <EventForm event={editingEvent} categories={categories} onSubmit={handleUpdateEvent} onCancel={() => setEditingEvent(null)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingEventId} onOpenChange={() => setDeletingEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Evento</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Category Dialogs ───────────────────────── */}
      <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nova Categoria</DialogTitle></DialogHeader>
          <CategoryForm onSubmit={handleCreateCategory} onCancel={() => setIsCategoryFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar Categoria</DialogTitle></DialogHeader>
          {editingCategory && (
            <CategoryForm category={editingCategory} onSubmit={handleUpdateCategory} onCancel={() => setEditingCategory(null)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCategoryId} onOpenChange={() => setDeletingCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza? Só pode excluir categorias sem eventos associados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── IES (Macro) Dialogs ────────────────────── */}
      <Dialog open={isMacroFormOpen} onOpenChange={setIsMacroFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nova IES</DialogTitle></DialogHeader>
          <MacroForm onSubmit={handleCreateMacro} onCancel={() => setIsMacroFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMacro} onOpenChange={() => setEditingMacro(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar IES</DialogTitle></DialogHeader>
          {editingMacro && (
            <MacroForm macro={editingMacro} onSubmit={handleUpdateMacro} onCancel={() => setEditingMacro(null)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingMacroId} onOpenChange={() => setDeletingMacroId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir IES</AlertDialogTitle>
            <AlertDialogDescription>Esta IES será removida permanentemente. Locais vinculados a ela também serão excluídos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMacro} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Local (Micro) Dialogs ──────────────────── */}
      <Dialog open={isMicroFormOpen} onOpenChange={setIsMicroFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo Local</DialogTitle></DialogHeader>
          <MicroForm macros={macros} onSubmit={handleCreateMicro} onCancel={() => setIsMicroFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingMicro} onOpenChange={() => setEditingMicro(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar Local</DialogTitle></DialogHeader>
          {editingMicro && (
            <MicroForm micro={editingMicro} macros={macros} onSubmit={handleUpdateMicro} onCancel={() => setEditingMicro(null)} />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingMicroId} onOpenChange={() => setDeletingMicroId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Local</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este local?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMicro} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── User Dialogs ───────────────────────────── */}
      <Dialog open={isUserFormOpen} onOpenChange={setIsUserFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Novo Usuário</DialogTitle></DialogHeader>
          <UserForm onSubmit={handleCreateUser} onCancel={() => setIsUserFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir este usuário?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
