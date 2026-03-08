
"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, query, orderBy } from "firebase/firestore";
import { Loader2, Store, Users, ExternalLink, Calendar, Search, ShieldCheck, Copy, Check } from "lucide-react";
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

  // Check global admin status
  const globalAdminRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, "globalAdmins", user.uid);
  }, [db, user?.uid]);

  const { data: globalAdminData, isLoading: isAdminChecking } = useDoc(globalAdminRef);

  // Fetch all salons
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
      toast({ title: "ID Copiado", description: "Pégalo en la colección globalAdmins de tu consola Firebase." });
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

  if (!globalAdminData) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="max-w-lg w-full text-center shadow-2xl border-primary/20 bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="pt-10">
              <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-black font-headline tracking-tighter">Acceso de Creador</CardTitle>
              <CardDescription className="text-lg">
                Para ingresar a este panel centralizado, tu ID de usuario debe estar autorizado en la base de datos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pb-10">
              <div className="bg-muted/50 p-6 rounded-2xl border border-dashed border-primary/20">
                <p className="text-xs uppercase font-black tracking-widest text-muted-foreground mb-4">Tu Identificador Único (UID)</p>
                <div className="flex items-center gap-3 bg-background border rounded-xl p-3 font-mono text-sm overflow-hidden">
                  <span className="truncate flex-1 text-primary">{user?.uid || 'No identificado'}</span>
                  <Button size="icon" variant="ghost" onClick={copyUid} className="shrink-0 h-8 w-8">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
                  Copia este ID y crea un documento con este nombre en la colección <strong>globalAdmins</strong> dentro de tu Consola de Firebase para obtener acceso total.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full h-14 rounded-2xl font-bold text-lg">
                <Link href="/">Volver al Inicio</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 md:px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-black font-headline tracking-tighter mb-2">Panel Global</h1>
            <p className="text-muted-foreground text-lg">Monitoreo centralizado de todos los negocios en TurnosYa.</p>
          </div>
          <div className="flex items-center gap-4 bg-primary/10 px-6 py-3 rounded-[2rem] border border-primary/20 shadow-inner">
            <Store className="w-6 h-6 text-primary" />
            <div className="flex flex-col">
              <span className="font-black text-2xl leading-none">{allSalons?.length || 0}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary/70">Negocios Totales</span>
            </div>
          </div>
        </div>

        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
          <Input 
            placeholder="Buscar por nombre de marca o ID de negocio..." 
            className="pl-14 h-16 bg-card border-2 rounded-[1.5rem] text-lg shadow-sm focus:ring-primary focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isSalonsLoading ? (
          <div className="flex flex-col items-center justify-center p-32 space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
            <p className="text-muted-foreground font-medium animate-pulse">Consultando base de datos global...</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredSalons.map((salon) => (
              <Card key={salon.id} className="group hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden rounded-[2rem] border-muted/50">
                <CardHeader className="pb-4 bg-muted/5 transition-colors group-hover:bg-primary/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Store className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] py-1 px-3 uppercase font-black tracking-widest border-primary/20 bg-background/50">
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
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Color de Marca</span>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full border shadow-inner" style={{ backgroundColor: salon.primaryColor || '#000' }} />
                        <span className="text-xs font-mono font-bold">{salon.primaryColor || '#000000'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Capacidad</span>
                      <div className="flex items-center gap-2">
                         <span className="text-xl font-black">{salon.timeSlots?.length || 0}</span>
                         <span className="text-[10px] font-bold text-muted-foreground">TURNOS / DÍA</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-2">
                    <Button variant="outline" size="lg" className="flex-1 rounded-2xl font-bold hover:bg-primary hover:text-primary-foreground group-hover:border-primary/50" asChild>
                      <Link href={`/book/${salon.id}`} target="_blank">
                        <ExternalLink className="mr-2 h-5 w-5" /> Explorar
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredSalons.length === 0 && (
              <div className="md:col-span-3 text-center py-32 bg-muted/10 rounded-[3rem] border-2 border-dashed border-muted">
                <Store className="w-24 h-24 text-muted-foreground mx-auto mb-6 opacity-10" />
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
