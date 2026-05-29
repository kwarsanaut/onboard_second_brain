# OnboardKit — Roadmap

## v1.0 — Current (Hackathon)

**Core: Employee Handover Onboarding**

Upload dokumen handover dari karyawan yang pergi → AI generate checklist per posisi → karyawan pengganti checkin dan track progress.

- HR portal: manage departments, positions, generate/update wiki per posisi
- Employee portal: access checklist, centang progress, tambah catatan
- LLM Wiki: merge dokumen baru ke checklist yang sudah ada (tidak overwrite)
- Supabase Auth: role-based (hr / employee)
- AI: Groq Llama 3.3 70B (primary), Qwen fallback

---

## v2.0 — Innovation Challenge Roadmap

### Use Case 1: Client Onboarding

**Problem:** Tim CS/Sales kesulitan onboarding client baru secara konsisten. Setiap account executive punya "cara sendiri" yang tidak terdokumentasi — ketika mereka resign, knowledge hilang.

**Solution:** HR/CS Lead upload playbook onboarding client (PDF/doc dari AE terbaik) → AI generate checklist onboarding client per product/tier → AE baru punya template yang terbukti efektif.

**Diferensiasi dari v1:**
- Checklist ditujukan ke AE (internal user), bukan ke client
- Context bukan "siapa yang digantikan" tapi "client type" (enterprise, SMB, startup)
- Kolom tambahan: nama client, industry, deal size
- Timeline view: minggu 1, 30 hari, 60 hari

**Contoh checklist items yang dihasilkan:**
- Kirim welcome email dan jadwal kickoff call (hari 1)
- Setup akses dashboard client (hari 2-3)
- Walkthrough fitur core sesuai use case mereka (minggu 1)
- Check-in 2 minggu: review adoption metrics
- QBR pertama: 30 hari setelah go-live

---

### Use Case 2: Sales Training

**Problem:** Sales manager susah mendokumentasikan "cara jualan yang berhasil" dari top performer. Training sales baru masih manual, inconsistent, dan terlalu bergantung pada buddy system.

**Solution:** Upload call recordings transcript, win/loss notes, dan playbook dari top AE → AI distill ke structured training checklist → sales baru punya guided path yang reproducible.

**Diferensiasi dari v1:**
- Source document: call transcripts, CRM notes, win/loss analysis (bukan handover doc)
- Checklist bersifat skills-based, bukan task-based
- Progress tracking: per milestone sales skills (discovery, demo, objection handling, closing)
- Manager bisa assign dan pantau progress setiap sales baru

**Contoh checklist items yang dihasilkan:**
- Shadow 3 discovery call dengan senior AE
- Role-play skenario objection: "harganya terlalu mahal"
- Presentasi solo demo pertama (direkam, di-review manager)
- Close deal pertama dengan nilai > Rp 50jt (milestone)

---

## Scope & Feasibility

| Aspek | v1 (sekarang) | v2.0 |
|---|---|---|
| Target user | HR internal | HR, CS Lead, Sales Manager |
| Source document | Handover doc | Handover + playbook + transcripts |
| Checklist context | Orang yang digantikan | Client type / sales stage |
| Portal | HR + Employee | HR + Employee + CS/Sales |
| DB changes | Minimal | Tambah `context_type`, `timeline` fields |
| AI prompt | General onboarding | Domain-specific (client onboarding / sales) |

**Kenapa feasible untuk Innovation Challenge:**
1. Core engine (LLM Wiki + generate) sudah jalan — tinggal custom prompt per use case
2. DB schema sudah flexible (JSONB items) — tidak perlu migration besar
3. UI pattern sudah ada — tinggal duplikasi dengan context berbeda
4. Bisa demo dengan real dokumen (playbook sales, customer success template)
