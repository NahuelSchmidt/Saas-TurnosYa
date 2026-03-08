
"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, query, orderBy } from "firebase/firestore";
import { Loader2, Store, Users, ExternalLink, Calendar, Search, ShieldCheck, Copy, Check, Mail, Info } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Referencia al documento de permisos globales
  const globalAdminRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "globalAdmins", user.uid);
  }, [db, user?.uid]);

  const { data: globalAdminData, isLoading: isAdminChecking } = useDoc(globalAdminRef);

  // Obtenemos todos los negocios del sistema solo si tenemos acceso
  const salonsQuery = useMemoFirebase(() => {
    if (!db || !globalAdminData) return null;
    return query(collection(db, "salons"), orderBy("createdAt", "desc"));
  }, [db, globalAdminData]);

  const { data: allSalons, isLoading: isSalonsLoading } = useCollection(salonsQuery);

  const filteredSalons = allSalons?.filter(salon => 
    salon.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salon.id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const copyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      toast({ title: "ID Copiado", description: "Pégalo en la colección globalAdmins." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isUserLoading || isAdminChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si no se encuentra el documento de permisos en Firestore
  if (!globalAdminData) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="max-w-lg w-full text-center shadow-2xl border-primary/20 bg-card overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="pt-10">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-black font-headline tracking-tighter">Acceso de Creador</CardTitle>
              <CardDescription className="text-lg">
                Tu usuario actual no tiene permisos de administrador global.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-10">
              <div className="bg-muted/50 p-6 rounded-2xl border border-dashed border-primary/20 text-left">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Sesión Iniciada como:</span>
                </div>
                <p className="font-mono text-sm mb-6 bg-background p-2 rounded border truncate">{user?.email || 'Anónimo / Desconocido'}</p>

                <div className="flex items-center gap-2 mb-2 text-primary">
                  <Info className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">ID de Usuario (UID):</span>
                </div>
                <div className="flex items-center gap-3 bg-background border rounded-xl p-3 font-mono text-sm mb-8">
                  <span className="truncate flex-1 text-primary font-bold">{user?.uid}</span>
                  <button onClick={copyUid} className="shrink-0 p-2 hover:bg-muted rounded-lg transition-colors">
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-bold">Cómo activar tu acceso:</p>
                  <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-2">
                    <li>Copia tu <strong>UID</strong> (el código azul arriba).</li>
                    <li>Entra a <strong>Firebase Console &gt; Firestore</strong>.</li>
                    <li>Si no existe, crea una colección: <code>globalAdmins</code>.</li>
                    <li>Crea un documento con tu <strong>UID</strong> como ID del documento.</li>
                    <li><strong>IMPORTANTE:</strong> Añade un campo (ej: <code>active: true</code>).</li>
                    <li>Vuelve aquí y refresca la página.</li>
                  </ol>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full h-12 rounded-xl">
                <Link href="/">Volver al Inicio</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Vista del Panel si el usuario ES administrador
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-black font-headline tracking-tighter mb-2">Panel Global</h1>
            <p className="text-muted-foreground text-lg">Administración centralizada de todos los negocios.</p>
          </div>
          <div className="flex items-center gap-4 bg-primary/10 px-6 py-3 rounded-full border border-primary/20">
            <Store className="w-6 h-6 text-primary" />
            <div className="flex flex-col">
              <span className="font-black text-2xl leading-none">{allSalons?.length || 0}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary/70">Negocios</span>
            </div>
          </div>
        </div>

        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
          <Input 
            placeholder="Buscar por nombre o ID de negocio..." 
            className="pl-14 h-16 bg-card border-2 rounded-2xl text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isSalonsLoading ? (
          <div className="flex flex-col items-center justify-center p-32 space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
            <p className="text-muted-foreground font-medium">Cargando datos globales...</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredSalons.map((salon) => (
              <Card key={salon.id} className="group hover:border-primary transition-all duration-300 shadow-sm rounded-2xl overflow-hidden border-muted bg-card">
                <CardHeader className="pb-4 bg-muted/5 group-hover:bg-primary/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Store className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] py-1 px-3 uppercase font-black tracking-widest border-primary/20 bg-background text-foreground">
                      ID: {salon.id}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-black font-headline leading-tight group-hover:text-primary transition-colors">{salon.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4 text-primary" />
                    Desde {salon.createdAt?.toDate ? format(salon.createdAt.toDate(), "dd MMM yyyy", { locale: es }) : 'Reciente'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-2 gap-4 py-6 border-y border-border/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Color Marca</span>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border shadow-inner" style={{ backgroundColor: salon.primaryColor || '#000' }} />
                        <span className="text-xs font-mono font-bold">{salon.primaryColor || '#000000'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Capacidad</span>
                      <div className="flex items-center gap-2">
                         <span className="text-xl font-black">{salon.timeSlots?.length || 0}</span>
                         <span className="text-[10px] font-bold text-muted-foreground">TURNOS</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="lg" className="w-full rounded-xl font-bold hover:bg-primary hover:text-primary-foreground" asChild>
                    <Link href={`/book/${salon.id}`} target="_blank">
                      <ExternalLink className="mr-2 h-5 w-5" /> Abrir Página
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
            {filteredSalons.length === 0 && (
              <div className="md:col-span-3 text-center py-32 bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
                <h3 className="text-2xl font-black text-muted-foreground">Sin resultados</h3>
                <p className="text-muted-foreground">No hay negocios que coincidan con tu búsqueda.</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
