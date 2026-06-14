import { createServiceClient } from '@/lib/supabase/server';
import type { Department, Position, ChecklistTemplate, UserOnboarding, AdditionalCategory, TeamMember } from '@/types';

function db() {
  return createServiceClient();
}

// ── Departments ──────────────────────────────────────────────────────────────

export async function getDepartments(): Promise<Department[]> {
  const { data } = await db().from('departments').select('*').order('created_at');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({ id: r.id, name: r.name, description: r.description ?? '', createdAt: r.created_at }));
}

export async function saveDepartment(dept: Department): Promise<void> {
  await db().from('departments').upsert({ id: dept.id, name: dept.name, description: dept.description, created_at: dept.createdAt });
}

export async function deleteDepartment(id: string): Promise<void> {
  await db().from('departments').delete().eq('id', id);
}

// ── Positions ─────────────────────────────────────────────────────────────────

export async function getPositions(): Promise<Position[]> {
  const { data } = await db().from('positions').select('*').order('created_at');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({ id: r.id, departmentId: r.department_id, departmentName: r.department_name, name: r.name, createdAt: r.created_at }));
}

export async function getPositionsByDept(departmentId: string): Promise<Position[]> {
  const { data } = await db().from('positions').select('*').eq('department_id', departmentId).order('created_at');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((r: any) => ({ id: r.id, departmentId: r.department_id, departmentName: r.department_name, name: r.name, createdAt: r.created_at }));
}

export async function getPosition(id: string): Promise<Position | null> {
  const { data } = await db().from('positions').select('*').eq('id', id).single();
  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: any = data;
  return { id: r.id, departmentId: r.department_id, departmentName: r.department_name, name: r.name, createdAt: r.created_at };
}

export async function savePosition(pos: Position): Promise<void> {
  await db().from('positions').upsert({ id: pos.id, department_id: pos.departmentId, department_name: pos.departmentName, name: pos.name, created_at: pos.createdAt });
}

export async function deletePosition(id: string): Promise<void> {
  await db().from('positions').delete().eq('id', id);
}

// ── Checklists ────────────────────────────────────────────────────────────────

export async function getChecklists(): Promise<ChecklistTemplate[]> {
  const { data } = await db().from('checklists').select('*').order('created_at');
  return (data ?? []).map(mapChecklist);
}

export async function getChecklist(positionId: string): Promise<ChecklistTemplate | null> {
  const { data } = await db().from('checklists').select('*').eq('position_id', positionId).single();
  if (!data) return null;
  return mapChecklist(data);
}

export async function saveChecklist(c: ChecklistTemplate): Promise<void> {
  await db().from('checklists').upsert({
    id: c.id,
    position_id: c.positionId,
    position_name: c.positionName,
    department_id: c.departmentId,
    department_name: c.departmentName,
    replacing_person: c.replacingPerson ?? null,
    onboarding_type: c.onboardingType,
    additional_categories: c.additionalCategories,
    items: c.items,
    generated_from: c.generatedFrom ?? null,
    model: c.model ?? null,
    wiki_revisions: c.wikiRevisions ?? 1,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  });
}

export async function deleteChecklist(positionId: string): Promise<void> {
  await db().from('checklists').delete().eq('position_id', positionId);
}

function mapChecklist(r: Record<string, unknown>): ChecklistTemplate {
  return {
    id: r.id as string,
    positionId: r.position_id as string,
    positionName: r.position_name as string,
    departmentId: r.department_id as string,
    departmentName: r.department_name as string,
    replacingPerson: r.replacing_person as string | undefined,
    onboardingType: r.onboarding_type as 'replacement' | 'new-hire',
    additionalCategories: (r.additional_categories as AdditionalCategory[]) ?? [],
    items: (r.items as ChecklistTemplate['items']) ?? [],
    generatedFrom: r.generated_from as string | undefined,
    model: r.model as string | undefined,
    wikiRevisions: r.wiki_revisions as number | undefined,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<UserOnboarding[]> {
  const { data } = await db().from('onboarding_users').select('*').order('created_at', { ascending: false });
  return (data ?? []).map(mapUser);
}

export async function getUser(id: string): Promise<UserOnboarding | null> {
  const { data } = await db().from('onboarding_users').select('*').eq('id', id).single();
  if (!data) return null;
  return mapUser(data);
}

export async function getUserByAuthId(authUserId: string): Promise<UserOnboarding | null> {
  const { data } = await db().from('onboarding_users').select('*').eq('auth_user_id', authUserId).maybeSingle();
  if (!data) return null;
  return mapUser(data);
}

export async function saveUser(user: UserOnboarding): Promise<void> {
  await db().from('onboarding_users').upsert({
    id: user.id,
    auth_user_id: user.authUserId ?? null,
    name: user.name,
    position_id: user.positionId,
    position_name: user.positionName,
    department_id: user.departmentId,
    department_name: user.departmentName,
    replacing_person: user.replacingPerson ?? null,
    onboarding_type: user.onboardingType,
    start_date: user.startDate,
    items: user.items,
    created_at: user.createdAt,
  });
}

export async function deleteUser(id: string): Promise<void> {
  await db().from('onboarding_users').delete().eq('id', id);
}

// ── Team Members ──────────────────────────────────────────────────────────────

export async function getTeamMembers(departmentId: string): Promise<TeamMember[]> {
  const { data } = await db().from('team_members').select('*').eq('department_id', departmentId).order('created_at');
  return (data ?? []).map(mapTeamMember);
}

export async function saveTeamMember(m: TeamMember): Promise<void> {
  await db().from('team_members').upsert({
    id: m.id, department_id: m.departmentId, department_name: m.departmentName,
    name: m.name, role: m.role, photo_url: m.photoUrl ?? null, created_at: m.createdAt,
  });
}

export async function deleteTeamMember(id: string): Promise<void> {
  await db().from('team_members').delete().eq('id', id);
}

function mapTeamMember(r: Record<string, unknown>): TeamMember {
  return {
    id: r.id as string, departmentId: r.department_id as string,
    departmentName: r.department_name as string, name: r.name as string,
    role: r.role as string, photoUrl: r.photo_url as string | undefined,
    createdAt: r.created_at as string,
  };
}

function mapUser(r: Record<string, unknown>): UserOnboarding {
  return {
    id: r.id as string,
    authUserId: r.auth_user_id as string | undefined,
    name: r.name as string,
    positionId: r.position_id as string,
    positionName: r.position_name as string,
    departmentId: r.department_id as string,
    departmentName: r.department_name as string,
    replacingPerson: r.replacing_person as string | undefined,
    onboardingType: r.onboarding_type as 'replacement' | 'new-hire',
    startDate: r.start_date as string,
    items: (r.items as UserOnboarding['items']) ?? [],
    createdAt: r.created_at as string,
  };
}
