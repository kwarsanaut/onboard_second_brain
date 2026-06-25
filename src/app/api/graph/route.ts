import { NextResponse } from 'next/server';
import { getDepartments, getPositions, getChecklists, getUsers, getTeamMembers } from '@/lib/storage';

type NodeType = 'department' | 'position' | 'checklist' | 'item' | 'category' | 'employee' | 'team';

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  href?: string;
  meta?: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

export async function GET() {
  try {
    const [departments, positions, checklists, users] = await Promise.all([
      getDepartments(),
      getPositions(),
      getChecklists(),
      getUsers(),
    ]);
    const teamLists = await Promise.all(departments.map(d => getTeamMembers(d.id)));

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const seen = new Set<string>();

    const addNode = (n: GraphNode) => {
      if (!seen.has(n.id)) { seen.add(n.id); nodes.push(n); }
    };
    const addEdge = (source: string, target: string) => {
      if (source !== target && seen.has(source) && seen.has(target)) edges.push({ source, target });
    };

    const deptId = (id: string) => `dept:${id}`;
    const posId = (id: string) => `pos:${id}`;
    const clId = (id: string) => `cl:${id}`;
    const itemId = (clKey: string, id: string) => `item:${clKey}:${id}`;
    const catId = (name: string) => `cat:${name.trim().toLowerCase()}`;
    const empId = (id: string) => `emp:${id}`;
    const teamNodeId = (id: string) => `team:${id}`;

    // ── Departments ──
    for (const d of departments) {
      addNode({ id: deptId(d.id), label: d.name, type: 'department', href: `/hr/checklist/${d.id}`, meta: 'Departemen' });
    }

    // ── Positions ──
    for (const p of positions) {
      addNode({ id: posId(p.id), label: p.name, type: 'position', href: `/hr/checklist/${p.departmentId}`, meta: p.departmentName });
      addEdge(deptId(p.departmentId), posId(p.id));
    }

    const ensureCategory = (name?: string): string | null => {
      if (!name || !name.trim()) return null;
      const id = catId(name);
      addNode({ id, label: name.trim(), type: 'category', meta: 'Kategori knowledge' });
      return id;
    };

    // ── Checklists (wiki) + item knowledge ──
    for (const c of checklists) {
      addNode({
        id: clId(c.id),
        label: `Wiki · ${c.positionName}`,
        type: 'checklist',
        href: `/hr/checklist/${c.departmentId}`,
        meta: `v${c.wikiRevisions ?? 1} · ${c.items.length} item`,
      });
      // checklist menempel ke posisinya (fallback ke departemen)
      if (seen.has(posId(c.positionId))) addEdge(posId(c.positionId), clId(c.id));
      else addEdge(deptId(c.departmentId), clId(c.id));

      for (const it of c.items) {
        const iid = itemId(c.id, it.id);
        addNode({ id: iid, label: it.title, type: 'item', meta: it.category });
        addEdge(clId(c.id), iid);
        const cid = ensureCategory(it.category);
        if (cid) addEdge(iid, cid);
      }
    }

    // ── Employees (onboarding) ──
    for (const u of users) {
      addNode({ id: empId(u.id), label: u.name, type: 'employee', href: `/hr/employees/${u.id}`, meta: u.positionName });
      let linked = false;
      if (u.positionId && seen.has(posId(u.positionId))) { addEdge(posId(u.positionId), empId(u.id)); linked = true; }
      if (!linked && u.departmentId && seen.has(deptId(u.departmentId))) addEdge(deptId(u.departmentId), empId(u.id));
    }

    // ── Team members ──
    departments.forEach((d, idx) => {
      for (const m of teamLists[idx]) {
        addNode({ id: teamNodeId(m.id), label: m.name, type: 'team', meta: m.role || 'Anggota tim' });
        addEdge(deptId(d.id), teamNodeId(m.id));
      }
    });

    const stats = {
      departments: departments.length,
      positions: positions.length,
      checklists: checklists.length,
      employees: users.length,
      nodes: nodes.length,
      edges: edges.length,
    };

    return NextResponse.json({ nodes, edges, stats });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
