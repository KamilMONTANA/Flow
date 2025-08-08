"use client"
import { useEffect, useMemo, useState } from "react"
import { IconClock, IconPlus, IconUserPlus, IconUsersGroup, IconCalendar, IconChecklist, IconTrash, IconPencil } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

type Role = "owner" | "manager" | "employee"

type MemberId = string
type TaskId = string
type ShiftId = string

type Member = {
  id: MemberId
  name: string
  email: string
  role: Role
  active: boolean
}

type Task = {
  id: TaskId
  memberId: MemberId
  title: string
  date: string
  done: boolean
}

type Shift = {
  id: ShiftId
  memberId: MemberId
  date: string
  start?: string
  end?: string
}

type StoreShape = {
  members: Member[]
  tasks: Task[]
  shifts: Shift[]
}

const STORAGE_KEY = "flow_team_store_v1"

const useTeamStore = () => {
  const [store, setStore] = useState<StoreShape>({ members: [], tasks: [], shifts: [] })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as StoreShape
      setStore(parsed)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch {}
  }, [store])

  const addMember = (member: Omit<Member, "id">) => {
    setStore((s) => ({ ...s, members: [...s.members, { ...member, id: crypto.randomUUID() }] }))
  }
  const updateMember = (id: MemberId, patch: Partial<Member>) => {
    setStore((s) => ({ ...s, members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
  }
  const removeMember = (id: MemberId) => {
    setStore((s) => ({
      ...s,
      members: s.members.filter((m) => m.id !== id),
      tasks: s.tasks.filter((t) => t.memberId !== id),
      shifts: s.shifts.filter((sh) => sh.memberId !== id),
    }))
  }

  const assignTask = (task: Omit<Task, "id">) => {
    setStore((s) => ({ ...s, tasks: [...s.tasks, { ...task, id: crypto.randomUUID() }] }))
  }
  const toggleTask = (id: TaskId) => {
    setStore((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }))
  }
  const removeTask = (id: TaskId) => {
    setStore((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }))
  }

  const clockIn = (memberId: MemberId, dateISO: string, time: string) => {
    setStore((s) => ({
      ...s,
      shifts: [
        ...s.shifts,
        { id: crypto.randomUUID(), memberId, date: dateISO, start: time },
      ],
    }))
  }
  const clockOut = (memberId: MemberId, dateISO: string, time: string) => {
    setStore((s) => ({
      ...s,
      shifts: s.shifts.map((sh) => (sh.memberId === memberId && sh.date === dateISO && !sh.end ? { ...sh, end: time } : sh)),
    }))
  }

  return {
    store,
    addMember,
    updateMember,
    removeMember,
    assignTask,
    toggleTask,
    removeTask,
    clockIn,
    clockOut,
  }
}

const formatHM = (d = new Date()) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
const toISODate = (d = new Date()) => d.toISOString().slice(0, 10)

export default function TeamPage() {
  const { store, addMember, updateMember, removeMember, assignTask, toggleTask, removeTask, clockIn, clockOut } = useTeamStore()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("employee")

  const membersById = useMemo(() => Object.fromEntries(store.members.map((m) => [m.id, m])), [store.members])
  const today = toISODate()

  const handleAddMember = () => {
    if (!name.trim() || !email.trim()) return
    addMember({ name: name.trim(), email: email.trim(), role, active: true })
    setName("")
    setEmail("")
    setRole("employee")
  }

  const handleClockIn = (memberId: MemberId) => {
    clockIn(memberId, today, formatHM())
  }
  const handleClockOut = (memberId: MemberId) => {
    clockOut(memberId, today, formatHM())
  }

  const [taskTitle, setTaskTitle] = useState("")
  const [taskDate, setTaskDate] = useState(today)
  const [taskMember, setTaskMember] = useState<MemberId | "">("")

  const handleAssignTask = () => {
    if (!taskTitle.trim() || !taskDate || !taskMember) return
    assignTask({ memberId: taskMember, title: taskTitle.trim(), date: taskDate, done: false })
    setTaskTitle("")
    setTaskDate(today)
    setTaskMember("")
  }

  return (
    <div className="p-4 md:p-6">
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid grid-cols-5 gap-2 w-full">
          <TabsTrigger value="members" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <IconUsersGroup className="mr-2 size-4" /> Członkowie
          </TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <IconUserPlus className="mr-2 size-4" /> Role
          </TabsTrigger>
          <TabsTrigger value="time" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <IconClock className="mr-2 size-4" /> Czas pracy
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <IconCalendar className="mr-2 size-4" /> Harmonogram
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <IconChecklist className="mr-2 size-4" /> Zadania
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dodaj członka</CardTitle>
              <CardDescription>Właściciel może dodać pracownika i przydzielić mu rolę.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="name">Imię i nazwisko</Label>
                <Input id="name" placeholder="np. Jan Kowalski" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="jan@firma.pl" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rola</Label>
                <select id="role" className="h-9 w-full rounded-md border px-3 text-sm" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                  <option value="employee">Pracownik</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Właściciel</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={handleAddMember}>
                  <IconPlus className="mr-2 size-4" /> Dodaj
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista członków</CardTitle>
              <CardDescription>Zarządzaj aktywnością i rolami.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {store.members.length === 0 && (
                <p className="text-sm text-muted-foreground">Brak członków. Dodaj pierwszą osobę powyżej.</p>
              )}
              {store.members.map((m) => (
                <div key={m.id} className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{m.name} <span className="ml-2 rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{m.role}</span></p>
                    <p className="truncate text-sm text-muted-foreground">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => updateMember(m.id, { active: !m.active })}>
                      {m.active ? "Dezaktywuj" : "Aktywuj"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateMember(m.id, { role: m.role === "employee" ? "manager" : m.role === "manager" ? "owner" : "employee" })}>
                      Zmień rolę
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => removeMember(m.id)}>
                      <IconTrash className="mr-2 size-4" /> Usuń
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role i uprawnienia</CardTitle>
              <CardDescription>Przykładowy model ról do dalszej integracji z backendem.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 rounded-md border p-3">
                <p className="font-medium">Właściciel</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Pełny dostęp do wszystkich modułów.</p>
                  <p>Zarządzanie rolami i użytkownikami.</p>
                </div>
              </div>
              <div className="space-y-2 rounded-md border p-3">
                <p className="font-medium">Manager</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Dostęp do rezerwacji, zespołu, inwentarza.</p>
                  <p>Brak dostępu do ustawień właściciela.</p>
                </div>
              </div>
              <div className="space-y-2 rounded-md border p-3">
                <p className="font-medium">Pracownik</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Podgląd przydzielonych zadań i grafik.</p>
                  <p>Rejestrowanie czasu pracy.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejestr czasu pracy (odbicie)</CardTitle>
              <CardDescription>Pracownicy odbijają start i koniec pracy. Dane zapisywane lokalnie.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {store.members.length === 0 && (
                <p className="text-sm text-muted-foreground">Brak członków do rejestrowania czasu.</p>
              )}
              {store.members.map((m) => (
                <div key={m.id} className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{m.name}</p>
                    <p className="text-sm text-muted-foreground">Dzisiejsza data: {today}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleClockIn(m.id)}>
                      Start
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleClockOut(m.id)}>
                      Koniec
                    </Button>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Dzisiejsze zmiany</p>
                {store.shifts.filter((s) => s.date === today).length === 0 && (
                  <p className="text-sm text-muted-foreground">Brak zarejestrowanych zmian.</p>
                )}
                <div className="grid gap-2">
                  {store.shifts
                    .filter((s) => s.date === today)
                    .map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-md border p-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm">{membersById[s.memberId]?.name || "?"}</p>
                          <p className="text-xs text-muted-foreground">{s.start ?? "—"} — {s.end ?? "—"}</p>
                        </div>
                        <IconClock className="size-4 text-muted-foreground" />
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Harmonogram pracy</CardTitle>
              <CardDescription>Prosty układ dnia. Rozszerz do widoku tygodnia/miesiąca w kolejnych iteracjach.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2">
                  <Label htmlFor="sched-date">Data</Label>
                  <Input id="sched-date" type="date" defaultValue={today} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sched-member">Pracownik</Label>
                  <select id="sched-member" className="h-9 rounded-md border px-3 text-sm">
                    {store.members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sched-start">Start</Label>
                  <Input id="sched-start" type="time" defaultValue="09:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sched-end">Koniec</Label>
                  <Input id="sched-end" type="time" defaultValue="17:00" />
                </div>
                <Button disabled><IconPencil className="mr-2 size-4" /> Planowanie (demo)</Button>
              </div>
              <p className="text-sm text-muted-foreground">Ta sekcja jest szkieletem UI — gotowa pod spięcie z backendem (np. Supabase/DB) i walidacją.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Przydziel zadanie</CardTitle>
              <CardDescription>Jednorazowe lub na konkretny dzień.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="task-title">Zadanie</Label>
                <Input id="task-title" placeholder="np. Przygotować kajaki" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-date">Data</Label>
                <Input id="task-date" type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-member">Pracownik</Label>
                <select id="task-member" className="h-9 w-full rounded-md border px-3 text-sm" value={taskMember} onChange={(e) => setTaskMember(e.target.value)}>
                  <option value="">Wybierz</option>
                  {store.members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={handleAssignTask}>
                  <IconPlus className="mr-2 size-4" /> Przydziel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista zadań</CardTitle>
              <CardDescription>Odhaczaj wykonane zadania.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {store.tasks.length === 0 && (
                <p className="text-sm text-muted-foreground">Brak zadań.</p>
              )}
              {store.tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">{t.date} • {membersById[t.memberId]?.name || "?"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox id={`done-${t.id}`} checked={t.done} onCheckedChange={() => toggleTask(t.id)} />
                      <Label htmlFor={`done-${t.id}`} className="text-xs">Wykonane</Label>
                    </div>
                    <Button variant="destructive" size="icon" onClick={() => removeTask(t.id)}>
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


