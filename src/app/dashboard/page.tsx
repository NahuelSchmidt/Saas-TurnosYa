
"use client";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAppointments } from "@/components/dashboard/UserAppointments";
import { AdminSettings } from "@/components/dashboard/AdminSettings";
import { ProfessionalAgenda } from "@/components/dashboard/ProfessionalAgenda";
import { SubscriptionPaywall } from "@/components/dashboard/SubscriptionPaywall";
import { DollarSign, Calendar, Users, Activity, LogIn, LogOut, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUser, useAuth as useFirebaseAuth, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, query, where } from "firebase/firestore";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const chartData = [
  { month: "Enero", Ingresos: 1860, Turnos: 80 },
  { month: "Febrero", Ingresos: 3050, Turnos: 200 },
  { month: "Marzo", Ingresos: 2370, Turnos: 120 },
  { month: "Abril", Ingresos: 730, Turnos: 190 },
  { month: "Mayo", Ingresos: 2090, Turnos: 130 },
  { month: "Junio", Ingresos: 2140, Turnos: 140 },
];

const chartConfig = {
  Ingresos: { label: "Ingresos", color: "hsl(var(--primary))" },
  Turnos: { label: "Turnos", color: "hsl(var(--accent))" },
};

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const db = useFirestore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const salonsQuery = useMemoFirebase(() => {
    if (!db || !user?.uid || user.isAnonymous) return null;
    return query(
      collection(db, "salons"),
      where(`adminMembers.${user.uid}`, "==", true)
    );
  }, [db, user?.uid, user?.isAnonymous]);

  const { data: userSalons, isLoading: isSalonsLoading } = useCollection(salonsQuery);
  
  const currentSalon = userSalons?.[0];
  const tenantId = currentSalon?.id;

  // Verificación de suscripción
  const isSubscriptionActive = currentSalon?.subscriptionStatus === 'active';

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setIsLoggingIn(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setError("Credenciales inválidas o error de conexión. Reintenta.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => signOut(auth);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const isRealUser = user && !user.isAnonymous;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold mb-8 font-headline">Panel de Control</h1>
        
        <Tabs defaultValue={isRealUser ? "professional" : "customer"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="customer">Mis Turnos (Como Cliente)</TabsTrigger>
            <TabsTrigger value="professional">Administrar mi Negocio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customer">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Citas</CardTitle>
                <CardDescription>Aquí puedes ver los turnos que has reservado como cliente.</CardDescription>
              </CardHeader>
              <CardContent>
                <UserAppointments tenantId="admin-tenant-1" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional">
            {!isRealUser ? (
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>Acceso para Dueños de Salón</CardTitle>
                  <CardDescription>Gestiona tu negocio, empleados y agenda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@tu-negocio.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                  </div>
                  {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4"/><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                  <div className="flex flex-col gap-3">
                    <Button onClick={handleLogin} disabled={isLoggingIn} className="w-full">
                      {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                      Ingresar
                    </Button>
                    <div className="relative py-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">¿Nuevo en TurnosYa?</span></div></div>
                    <Button asChild variant="outline" className="w-full"><Link href="/register">Registrar mi Negocio Ahora</Link></Button>
                  </div>
                </CardContent>
              </Card>
            ) : isSalonsLoading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : !tenantId ? (
              <Card className="max-w-md mx-auto text-center">
                 <CardHeader><CardTitle>¡Hola!</CardTitle><CardDescription>Aún no tienes un salón vinculado a tu cuenta.</CardDescription></CardHeader>
                 <CardContent><Button asChild className="w-full"><Link href="/register">Configurar mi Salón</Link></Button></CardContent>
              </Card>
            ) : (
                <div className="space-y-6 relative">
                    {/* BLOQUEO POR SUSCRIPCIÓN */}
                    {!isSubscriptionActive && (
                      <SubscriptionPaywall salonId={tenantId} salonName={currentSalon?.name} />
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-muted/30 p-4 rounded-lg border">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold font-headline">{currentSalon?.name}</h2>
                          {isSubscriptionActive && <ShieldCheck className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground uppercase">ID de Salón: {tenantId}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive"><LogOut className="mr-2 h-4 w-4"/>Cerrar Sesión</Button>
                    </div>
                    
                    <Tabs defaultValue="agenda">
                        <TabsList className="mb-4">
                            <TabsTrigger value="agenda">Agenda</TabsTrigger>
                            <TabsTrigger value="stats">Métricas</TabsTrigger>
                            <TabsTrigger value="settings">Ajustes y Link</TabsTrigger>
                        </TabsList>
                        <TabsContent value="agenda"><ProfessionalAgenda tenantId={tenantId} /></TabsContent>
                        <TabsContent value="stats">
                            <div className="grid gap-6">
                                <Card>
                                  <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
                                    <div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary"/><div className="text-sm font-bold">$12,450</div></div>
                                    <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary"/><div className="text-sm font-bold">720 Turnos</div></div>
                                    <div className="flex items-center gap-2"><Users className="w-5 h-5 text-primary"/><div className="text-sm font-bold">58 Clientes</div></div>
                                    <div className="flex items-center gap-2"><Activity className="w-5 h-5 text-primary"/><div className="text-sm font-bold">85% Ocupación</div></div>
                                  </CardContent>
                                </Card>
                                <Card><CardHeader><CardTitle>Tendencias del Semestre</CardTitle></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-[300px] w-full"><BarChart data={chartData}><CartesianGrid vertical={false}/><XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(v) => v.slice(0, 3)}/><YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))"/><ChartTooltip content={<ChartTooltipContent/>}/><Bar dataKey="Ingresos" fill="var(--color-Ingresos)" radius={4} yAxisId="left"/><Bar dataKey="Turnos" fill="var(--color-Turnos)" radius={4} yAxisId="left"/></BarChart></ChartContainer></CardContent></Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="settings"><AdminSettings tenantId={tenantId} /></TabsContent>
                    </Tabs>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
