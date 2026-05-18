import { useAuthStore } from "@/src/store/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { LogOut, User, ShieldAlert, Sparkles, TrendingUp, Users, Target } from "lucide-react";

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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

  return (
    <div className="relative min-h-screen w-full bg-background transition-colors duration-300 overflow-x-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Modern Premium Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-linear-to-tr from-primary to-blue-600 flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
            SL
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">
            Smart Leads
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 bg-secondary/30 border border-border/50 rounded-full px-4 py-1.5 transition-all">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] font-bold bg-primary text-primary-foreground">
                {user ? getInitials(user.name) : "SL"}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs">
              <span className="font-semibold text-foreground mr-1.5">{user?.name}</span>
              <Badge variant={user?.role === "admin" ? "destructive" : "secondary"} className="text-[9px] uppercase px-1.5 py-0">
                {user?.role}
              </Badge>
            </div>
          </div>

          <ModeToggle />
          
          <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Welcome Section */}
        <section className="bg-card/45 backdrop-blur-md border border-border/50 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Workspace Active</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600 dark:from-primary dark:to-blue-400">{user?.name}</span>!
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              Here is what is happening with your lead pipe today. Connect with prospects, log conversations, and win deals.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-background border border-border/50 rounded-2xl p-4 shadow-xs">
            {user?.role === "admin" ? (
              <ShieldAlert className="h-5 w-5 text-red-500" />
            ) : (
              <User className="h-5 w-5 text-blue-500" />
            )}
            <div className="text-xs">
              <p className="font-semibold text-muted-foreground uppercase text-[10px]">Access Level</p>
              <p className="text-foreground font-bold">{user?.role === "admin" ? "Administrator" : "Sales Representative"}</p>
            </div>
          </div>
        </section>

        {/* Quick Analytics Widgets */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">124</div>
              <p className="text-xs text-muted-foreground">+12% from last week</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.8%</div>
              <p className="text-xs text-muted-foreground">+2.3% since yesterday</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Active sales agents</p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;