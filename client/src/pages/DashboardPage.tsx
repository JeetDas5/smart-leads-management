/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store/auth";
import { useLeadStore } from "@/src/store/lead";
import type { Lead, FetchLeadsParams } from "@/src/store/lead";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  LogOut,
  User,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Mail,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const {
    leads,
    pagination,
    stats,
    salespersons,
    currentLead,
    loading,
    fetchLeads,
    fetchStats,
    fetchSalespersons,
    createLead,
    updateLead,
    deleteLead,
    setCurrentLead,
  } = useLeadStore();

  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [salespersonFilter, setSalespersonFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leadToDeleteId, setLeadToDeleteId] = useState<string | null>(null);

  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState("new");
  const [leadSource, setLeadSource] = useState("instagram");
  const [editLeadId, setEditLeadId] = useState("");

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out!");
    navigate({ to: "/login" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    fetchStats();
    if (user?.role === "admin") {
      fetchSalespersons();
    }
  }, [user]);

  const loadLeads = () => {
    const params: FetchLeadsParams = {
      page: currentPage,
      limit: 10,
      sort: sortOrder,
    };

    if (debouncedSearch.trim()) {
      params.search = debouncedSearch;
    }
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    if (sourceFilter !== "all") {
      params.source = sourceFilter;
    }
    if (user?.role === "admin" && salespersonFilter !== "all") {
      params.createdBy = salespersonFilter;
    }

    fetchLeads(params);
  };

  useEffect(() => {
    loadLeads();
  }, [
    currentPage,
    statusFilter,
    sourceFilter,
    salespersonFilter,
    sortOrder,
    user,
    debouncedSearch,
  ]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSourceFilter("all");
    setSalespersonFilter("all");
    setSortOrder("latest");
    setCurrentPage(1);
  };

  const refreshAll = (isManual: boolean = false) => {
    fetchStats();
    loadLeads();
    if (user?.role === "admin") {
      fetchSalespersons();
    }
    if (isManual) {
      toast.success("Data refreshed successfully!");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName || !leadEmail) {
      toast.error("Please enter a name and email.");
      return;
    }

    try {
      if (formMode === "create") {
        await createLead({
          name: leadName,
          email: leadEmail,
          status: leadStatus,
          source: leadSource,
        });
        toast.success("Lead created successfully!");
      } else {
        await updateLead(editLeadId, {
          name: leadName,
          email: leadEmail,
          status: leadStatus,
          source: leadSource,
        });
        toast.success("Lead updated successfully!");
      }
      setIsFormOpen(false);
      refreshAll();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to submit form.");
      } else {
        toast.error("Failed to submit form.");
      }
    }
  };

  const openCreateModal = () => {
    setFormMode("create");
    setLeadName("");
    setLeadEmail("");
    setLeadStatus("new");
    setLeadSource("instagram");
    setIsFormOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setFormMode("edit");
    setEditLeadId(lead._id);
    setLeadName(lead.name);
    setLeadEmail(lead.email);
    setLeadStatus(lead.status);
    setLeadSource(lead.source);
    setIsFormOpen(true);
  };

  const openDetailsModal = (lead: Lead) => {
    setCurrentLead(lead);
    setIsDetailsOpen(true);
  };

  const handleDeleteLead = async () => {
    if (!leadToDeleteId) return;
    try {
      await deleteLead(leadToDeleteId);
      toast.success("Lead deleted successfully!");
      refreshAll();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to delete lead.");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsDeleteDialogOpen(false);
      setLeadToDeleteId(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get("/leads/export/csv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `leads_export_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("CSV export downloaded successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to export leads.");
    }
  };

  const getSalespersonName = (createdById: string) => {
    const sp = salespersons.find((s) => s._id === createdById);
    return sp ? sp.name : "Unknown Salesperson";
  };

  const totalStats =
    user?.role === "sales" ? stats?.total : stats?.overall?.total;
  const newStats = user?.role === "sales" ? stats?.new : stats?.overall?.new;
  const contactedStats =
    user?.role === "sales" ? stats?.contacted : stats?.overall?.contacted;
  const qualifiedStats =
    user?.role === "sales" ? stats?.qualified : stats?.overall?.qualified;
  const lostStats = user?.role === "sales" ? stats?.lost : stats?.overall?.lost;
  const conversionRateStats =
    user?.role === "sales"
      ? stats?.conversionRate
      : stats?.overall?.conversionRate;

  return (
    <div className='relative min-h-screen w-full bg-background transition-colors duration-300 overflow-hidden scroll-smooth'>
      <div className='absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none' />
      <div className='absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none' />

      <header className='sticky top-0 z-40 w-full border-b border-border/45 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-all duration-300'>
        <div className='flex items-center gap-2'>
          <span className='text-xl font-extrabold tracking-tight text-foreground'>
            Smart Leads
          </span>
        </div>

        <div className='flex items-center gap-4'>
          <div className='hidden md:flex items-center gap-3 bg-secondary/35 border border-border/50 rounded-full px-4 py-1.5 transition-all'>
            <Avatar className='h-6 w-6'>
              <AvatarFallback className='text-[10px] font-bold bg-primary text-primary-foreground'>
                {user ? getInitials(user.name) : "SL"}
              </AvatarFallback>
            </Avatar>
            <div className='text-xs'>
              <span className='font-semibold text-foreground mr-1.5'>
                {user?.name}
              </span>
              <Badge
                variant={user?.role === "admin" ? "destructive" : "secondary"}
                className='text-[9px] uppercase px-1.5 py-0'
              >
                {user?.role}
              </Badge>
            </div>
          </div>

          <Button
            variant='outline'
            size='icon'
            onClick={() => refreshAll(true)}
            className='rounded-xl border-border/50 hover:bg-secondary/40 transition-colors'
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          <ModeToggle />

          <Button
            variant='ghost'
            size='icon'
            onClick={handleLogout}
            className='rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors'
          >
            <LogOut className='h-5 w-5' />
          </Button>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-6 py-8 space-y-8 animate-fade-in'>
        <section className='bg-card/45 backdrop-blur-md border border-border/50 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 text-primary font-semibold text-sm'>
              <Sparkles className='h-4 w-4' />
              <span>Workspace Active</span>
            </div>
            <h2 className='text-3xl font-extrabold tracking-tight'>
              Welcome back, <span className='text-primary'>{user?.name}</span>!
            </h2>
            <p className='text-sm text-muted-foreground max-w-xl'>
              {user?.role === "sales"
                ? "Here is what is happening with your lead pipe today. Connect with prospects, log conversations, and win deals."
                : "System Administrator Control Panel. Oversee and orchestrate operations, monitor sales rep activity, and manage all leads."}
            </p>
          </div>

          <div className='flex items-center gap-4'>
            {user?.role === "admin" && (
              <Button
                onClick={handleExportCSV}
                variant='outline'
                className='rounded-2xl border-border/50 hover:bg-secondary/30 transition-colors gap-2'
              >
                Export to CSV
              </Button>
            )}
            <Button
              onClick={openCreateModal}
              className='rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/10 gap-2 hover:opacity-90'
            >
              <Plus className='h-4 w-4' /> Add Lead
            </Button>
          </div>
        </section>

        <section className='grid grid-cols-2 lg:grid-cols-5 gap-4'>
          <Card className='border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                Total Leads
              </span>
              <Target className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-extrabold'>{totalStats ?? 0}</div>
              <p className='text-[10px] text-muted-foreground mt-1'>
                Platform lead count
              </p>
            </CardContent>
          </Card>

          <Card className='border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                Conversion
              </span>
              <TrendingUp className='h-4 w-4 text-emerald-500' />
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-extrabold text-emerald-600 dark:text-emerald-400'>
                {conversionRateStats ?? 0}%
              </div>
              <p className='text-[10px] text-muted-foreground mt-1'>
                Qualified leads conversion
              </p>
            </CardContent>
          </Card>

          <Card className='border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                Qualified
              </span>
              <Sparkles className='h-4 w-4 text-purple-500' />
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-extrabold text-purple-600 dark:text-purple-400'>
                {qualifiedStats ?? 0}
              </div>
              <p className='text-[10px] text-muted-foreground mt-1'>
                Ready for closing
              </p>
            </CardContent>
          </Card>

          <Card className='border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                In Progress
              </span>
              <User className='h-4 w-4 text-amber-500' />
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-extrabold text-amber-600 dark:text-amber-400'>
                {(newStats ?? 0) + (contactedStats ?? 0)}
              </div>
              <p className='text-[10px] text-muted-foreground mt-1'>
                New & contacted prospects
              </p>
            </CardContent>
          </Card>

          <Card className='border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-md col-span-2 lg:col-span-1'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                Lost Leads
              </span>
              <SlidersHorizontal className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-3xl font-extrabold text-red-600 dark:text-red-400'>
                {lostStats ?? 0}
              </div>
              <p className='text-[10px] text-muted-foreground mt-1'>
                Disengaged contacts
              </p>
            </CardContent>
          </Card>
        </section>

        {user?.role === "admin" &&
          stats?.salespersons &&
          stats.salespersons.length > 0 && (
            <section className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-bold tracking-tight flex items-center gap-2'>
                  <Users className='h-5 w-5 text-blue-500' />
                  <span>Sales Team Performance Breakdown</span>
                </h3>
                <Badge variant='outline' className='rounded-lg bg-secondary/20'>
                  {stats.salespersons.length} agents active
                </Badge>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {stats.salespersons.map((spData) => (
                  <Card
                    key={spData.salesperson.id}
                    className='border-border/50 bg-card/40 backdrop-blur-xs transition-all hover:border-blue-500/50 hover:shadow-sm'
                  >
                    <CardHeader className='pb-3 flex flex-row items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarFallback className='bg-blue-600/10 text-blue-500 text-xs font-bold'>
                          {getInitials(spData.salesperson.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='space-y-0.5'>
                        <h4 className='text-sm font-bold truncate max-w-[150px]'>
                          {spData.salesperson.name}
                        </h4>
                        <p className='text-[10px] text-muted-foreground truncate max-w-[150px]'>
                          {spData.salesperson.email}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-2 pt-0'>
                      <div className='grid grid-cols-3 gap-2 text-center text-xs'>
                        <div className='bg-secondary/20 rounded-lg py-1'>
                          <p className='text-[10px] font-semibold text-muted-foreground uppercase'>
                            Leads
                          </p>
                          <p className='font-extrabold text-foreground'>
                            {spData.stats.total}
                          </p>
                        </div>
                        <div className='bg-emerald-500/10 rounded-lg py-1'>
                          <p className='text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase'>
                            Qual
                          </p>
                          <p className='font-extrabold text-emerald-600 dark:text-emerald-400'>
                            {spData.stats.qualified}
                          </p>
                        </div>
                        <div className='bg-purple-500/10 rounded-lg py-1'>
                          <p className='text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase'>
                            Conv
                          </p>
                          <p className='font-extrabold text-purple-600 dark:text-purple-400'>
                            {spData.stats.conversionRate}%
                          </p>
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setSalespersonFilter(spData.salesperson.id);
                          setCurrentPage(1);
                          toast.info(
                            `Filtered table to show leads by ${spData.salesperson.name}`
                          );
                        }}
                        className='w-full text-[10px] py-1 h-6 rounded-md hover:bg-secondary/40 text-blue-500 font-semibold'
                      >
                        View Rep Leads
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

        <section className='bg-card/45 backdrop-blur-md border border-border/50 rounded-3xl p-6 space-y-6 shadow-xs'>
          <div className='flex flex-col gap-4 border-b border-border/40 pb-6'>
            <h3 className='text-lg font-bold flex items-center gap-2'>
              <SlidersHorizontal className='h-4 w-4 text-blue-500' />
              <span>Lead Workspace & Pipeline Filters</span>
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3'>
              <div className='relative flex items-center lg:col-span-2 mt-6'>
                <div className='relative w-full'>
                  <Search className='absolute left-3 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='text'
                    placeholder='Search by Name or Email...'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className='pl-9 rounded-xl border-border/50 bg-background/50 focus:bg-background transition-colors placeholder:text-muted-foreground/60'
                  />
                </div>
              </div>

              <div className='space-y-1'>
                <label className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1'>
                  Pipeline Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className='flex h-9 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-1.5 text-xs focus:bg-background transition-colors focus-visible:outline-hidden'
                >
                  <option value='all'>All Statuses</option>
                  <option value='new'>New</option>
                  <option value='contacted'>Contacted</option>
                  <option value='qualified'>Qualified</option>
                  <option value='lost'>Lost</option>
                </select>
              </div>

              <div className='space-y-1'>
                <label className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1'>
                  Lead Source
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) => {
                    sourceFilter === "all"
                      ? setSourceFilter(e.target.value)
                      : setSourceFilter(e.target.value);
                    setSourceFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className='flex h-9 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-1.5 text-xs focus:bg-background transition-colors focus-visible:outline-hidden'
                >
                  <option value='all'>All Sources</option>
                  <option value='instagram'>Instagram</option>
                  <option value='referral'>Referral</option>
                  <option value='website'>Website</option>
                </select>
              </div>

              <div className='space-y-1'>
                <label className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1'>
                  Created Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    setCurrentPage(1);
                  }}
                  className='flex h-9 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-1.5 text-xs focus:bg-background transition-colors focus-visible:outline-hidden'
                >
                  <option value='latest'>Latest First</option>
                  <option value='oldest'>Oldest First</option>
                </select>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2'>
              {user?.role === "admin" ? (
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-bold text-muted-foreground whitespace-nowrap'>
                    Filter by Rep:
                  </span>
                  <select
                    value={salespersonFilter}
                    onChange={(e) => {
                      setSalespersonFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className='flex h-8 rounded-lg border border-border/50 bg-background/50 px-2 py-1 text-xs focus:bg-background transition-all focus-visible:outline-hidden min-w-[160px]'
                  >
                    <option value='all'>All Sales Persons</option>
                    {salespersons.map((sp) => (
                      <option key={sp._id} value={sp._id}>
                        {sp.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div />
              )}

              <Button
                variant='ghost'
                onClick={handleResetFilters}
                className='text-xs h-8 hover:bg-secondary/40 text-blue-500 font-semibold rounded-lg self-end'
              >
                Clear Workspace Filters
              </Button>
            </div>
          </div>

          <div className='rounded-2xl border border-border/40 overflow-hidden bg-background/30 backdrop-blur-xs'>
            <Table>
              <TableHeader className='bg-secondary/30'>
                <TableRow className='border-border/45'>
                  <TableHead className='text-xs font-bold text-muted-foreground/80 py-4 pl-6'>
                    Prospect Name
                  </TableHead>
                  <TableHead className='text-xs font-bold text-muted-foreground/80 py-4'>
                    Email Address
                  </TableHead>
                  <TableHead className='text-xs font-bold text-muted-foreground/80 py-4'>
                    Source
                  </TableHead>
                  <TableHead className='text-xs font-bold text-muted-foreground/80 py-4'>
                    Status
                  </TableHead>
                  {user?.role === "admin" && (
                    <TableHead className='text-xs font-bold text-muted-foreground/80 py-4'>
                      Acquired By
                    </TableHead>
                  )}
                  <TableHead className='text-xs font-bold text-muted-foreground/80 py-4'>
                    Acquisition Date
                  </TableHead>
                  <TableHead className='text-xs font-bold text-muted-foreground/80 py-4 text-right pr-6'>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={user?.role === "admin" ? 7 : 6}
                      className='h-32 text-center'
                    >
                      <div className='flex flex-col items-center justify-center gap-2'>
                        <Loader2 className='h-6 w-6 animate-spin text-blue-500' />
                        <span className='text-xs text-muted-foreground font-semibold'>
                          Querying pipeline data...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={user?.role === "admin" ? 7 : 6}
                      className='h-32 text-center'
                    >
                      <p className='text-sm font-semibold text-muted-foreground'>
                        No leads found matching current filter options.
                      </p>
                      <Button
                        variant='link'
                        onClick={handleResetFilters}
                        className='text-xs text-blue-500 font-bold p-0 mt-1'
                      >
                        Reset active filters
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow
                      key={lead._id}
                      className='border-border/45 hover:bg-secondary/15 transition-colors'
                    >
                      <TableCell className='font-bold py-3.5 pl-6'>
                        {lead.name}
                      </TableCell>
                      <TableCell className='text-muted-foreground py-3.5 font-medium'>
                        {lead.email}
                      </TableCell>
                      <TableCell className='py-3.5'>
                        <Badge
                          variant='outline'
                          className='text-[10px] font-semibold bg-secondary/10 uppercase border-border/50 py-0.5 px-2'
                        >
                          {lead.source}
                        </Badge>
                      </TableCell>
                      <TableCell className='py-3.5'>
                        <Badge
                          className={`text-[9px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-full ${
                            lead.status === "new"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : lead.status === "contacted"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : lead.status === "qualified"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                          }`}
                        >
                          {lead.status}
                        </Badge>
                      </TableCell>
                      {user?.role === "admin" && (
                        <TableCell className='py-3.5 font-semibold text-xs text-foreground'>
                          {getSalespersonName(lead.createdBy)}
                        </TableCell>
                      )}
                      <TableCell className='text-muted-foreground text-xs font-semibold py-3.5'>
                        {new Date(lead.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className='py-3.5 text-right pr-6'>
                        <div className='flex items-center justify-end gap-1.5'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => openDetailsModal(lead)}
                            className='h-8 w-8 rounded-lg hover:bg-secondary/40 text-muted-foreground hover:text-foreground'
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => openEditModal(lead)}
                            className='h-8 w-8 rounded-lg hover:bg-secondary/40 text-blue-500'
                          >
                            <Edit2 className='h-4 w-4' />
                          </Button>
                          {user?.role === "admin" && (
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => {
                                setLeadToDeleteId(lead._id);
                                setIsDeleteDialogOpen(true);
                              }}
                              className='h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive hover:text-destructive'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.totalPages > 1 && (
            <div className='flex items-center justify-between border-t border-border/30 pt-4 px-2'>
              <span className='text-xs text-muted-foreground font-semibold'>
                Showing {leads.length} of {pagination.total} leads (Page{" "}
                {pagination.page} of {pagination.totalPages})
              </span>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={pagination.page === 1}
                  className='rounded-lg border-border/50 h-8 gap-1'
                >
                  <ChevronLeft className='h-4 w-4' /> Previous
                </Button>

                {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <Button
                      key={pNum}
                      variant={pagination.page === pNum ? "default" : "outline"}
                      size='sm'
                      onClick={() => setCurrentPage(pNum)}
                      className={`h-8 w-8 rounded-lg border-border/50 text-xs font-bold`}
                    >
                      {pNum}
                    </Button>
                  );
                })}

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(p + 1, pagination.totalPages)
                    )
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className='rounded-lg border-border/50 h-8 gap-1'
                >
                  Next <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </section>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='max-w-md rounded-2xl bg-card border-border/50'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold tracking-tight'>
              {formMode === "create"
                ? "Add Prospect Lead"
                : "Edit Lead Details"}
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Provide necessary lead data below. Leads can be updated at any
              point inside the workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label
                htmlFor='form-name'
                className='text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1'
              >
                Full Name
              </label>
              <Input
                id='form-name'
                type='text'
                placeholder='Jane Smith'
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                disabled={loading}
                required
                className='rounded-xl border-border/50 bg-background/50 focus:bg-background transition-colors mt-1'
              />
            </div>

            <div className='space-y-2'>
              <label
                htmlFor='form-email'
                className='text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1'
              >
                Email Address
              </label>
              <Input
                id='form-email'
                type='email'
                placeholder='jane.smith@example.com'
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                disabled={loading}
                required
                className='rounded-xl border-border/50 bg-background/50 focus:bg-background transition-colors mt-1'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <label
                  htmlFor='form-source'
                  className='text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1'
                >
                  Source
                </label>
                <select
                  id='form-source'
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  disabled={loading}
                  className='flex h-9 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-1.5 text-xs focus:bg-background transition-colors focus-visible:outline-hidden mt-1'
                >
                  <option value='instagram'>Instagram</option>
                  <option value='referral'>Referral</option>
                  <option value='website'>Website</option>
                </select>
              </div>

              <div className='space-y-1'>
                <label
                  htmlFor='form-status'
                  className='text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1'
                >
                  Pipeline Status
                </label>
                <select
                  id='form-status'
                  value={leadStatus}
                  onChange={(e) => setLeadStatus(e.target.value)}
                  disabled={loading}
                  className='flex h-9 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-1.5 text-xs focus:bg-background transition-colors focus-visible:outline-hidden mt-1'
                >
                  <option value='new'>New</option>
                  <option value='contacted'>Contacted</option>
                  <option value='qualified'>Qualified</option>
                  <option value='lost'>Lost</option>
                </select>
              </div>
            </div>

            <DialogFooter className='pt-4 border-t border-border/30'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setIsFormOpen(false)}
                className='rounded-xl hover:bg-secondary/40'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={loading}
                className='rounded-xl bg-linear-to-r dark:from-primary dark:via-blue-100 dark:to-blue-200 text-primary-foreground font-semibold shadow-md shadow-primary/10 gap-2'
              >
                {loading && <Loader2 className='h-4 w-4 animate-spin' />}
                {formMode === "create" ? "Create Lead" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className='max-w-md rounded-2xl bg-card border-border/50'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold tracking-tight flex items-center gap-2'>
              <Target className='h-5 w-5 text-blue-500' />
              <span>Prospect Lead Insights</span>
            </DialogTitle>
          </DialogHeader>

          {currentLead && (
            <div className='space-y-5 pt-3'>
              <div className='flex items-center gap-4 border-b border-border/30 pb-4'>
                <Avatar className='h-14 w-14 shadow-md'>
                  <AvatarFallback className='text-lg font-extrabold dark:bg-linear-to-tr dark:from-primary dark:via-blue-100 dark:to-blue-200 dark:text-primary-foreground'>
                    {getInitials(currentLead.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className='text-lg font-extrabold'>{currentLead.name}</h4>
                  <p className='text-xs text-muted-foreground font-semibold flex items-center gap-1.5 mt-0.5'>
                    <Mail className='h-3.5 w-3.5 text-muted-foreground/80' />
                    <span>{currentLead.email}</span>
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='bg-secondary/15 rounded-2xl p-3 border border-border/40'>
                  <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                    Pipeline Status
                  </p>
                  <div className='mt-1'>
                    <Badge
                      className={`text-[9px] font-bold uppercase tracking-wider py-0.5 px-2.5 rounded-full ${
                        currentLead.status === "new"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                          : currentLead.status === "contacted"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : currentLead.status === "qualified"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                      }`}
                    >
                      {currentLead.status}
                    </Badge>
                  </div>
                </div>

                <div className='bg-secondary/15 rounded-2xl p-3 border border-border/40'>
                  <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                    Acquisition Source
                  </p>
                  <div className='mt-1'>
                    <Badge
                      variant='outline'
                      className='text-[10px] font-semibold bg-secondary/10 uppercase border-border/50 py-0.5 px-2'
                    >
                      {currentLead.source}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className='space-y-2 text-xs bg-secondary/15 border border-border/40 rounded-2xl p-4'>
                <div className='flex items-center justify-between border-b border-border/20 pb-2'>
                  <span className='font-semibold text-muted-foreground'>
                    Acquired By
                  </span>
                  <span className='font-bold text-foreground flex items-center gap-1'>
                    <UserCheck className='h-3.5 w-3.5 text-blue-500' />
                    {user?.role === "admin"
                      ? getSalespersonName(currentLead.createdBy)
                      : user?.name}
                  </span>
                </div>
                <div className='flex items-center justify-between pt-1'>
                  <span className='font-semibold text-muted-foreground'>
                    Acquisition Date
                  </span>
                  <span className='font-bold text-foreground flex items-center gap-1'>
                    <Calendar className='h-3.5 w-3.5 text-blue-500' />
                    {new Date(currentLead.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <DialogFooter className='pt-3 border-t border-border/30'>
                <Button
                  type='button'
                  onClick={() => setIsDetailsOpen(false)}
                  className='rounded-xl dark:bg-linear-to-r dark:from-primary dark:via-blue-100 dark:to-blue-200 dark:text-primary-foreground font-semibold shadow-md shadow-primary/10 w-full'
                >
                  Close Insights
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className='max-w-md rounded-2xl bg-card border-border/50'>
          <AlertDialogHeader className='flex flex-col items-center text-center sm:items-center sm:text-center'>
            <AlertDialogTitle className='text-xl flex items-center gap-2 justify-center font-bold tracking-tight text-foreground mb-1'>
              <div className='inline-flex size-6 items-center justify-center rounded-full bg-destructive/10 text-destructive'>
                <Trash2 className='h-5 w-5' />
              </div>
              Delete Lead
            </AlertDialogTitle>
            <AlertDialogDescription className='text-sm text-muted-foreground text-left'>
              Are you sure you want to delete this prospect lead? This action
              cannot be undone and the lead's information will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='flex flex-col-reverse sm:flex-row gap-2 mt-1'>
            <AlertDialogCancel
              variant='ghost'
              className='rounded-xl hover:bg-secondary/40'
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={handleDeleteLead}
              className='rounded-xl bg-destructive text-destructive-foreground font-semibold shadow-md shadow-destructive/10 gap-2 hover:bg-destructive/90'
            >
              Delete Lead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardPage;
