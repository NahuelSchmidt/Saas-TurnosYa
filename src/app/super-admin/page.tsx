
"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc, query, orderBy } from "firebase/firestore";
import { Loader2, Store, Users, ExternalLink, Calendar, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function SuperAdminPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState("");

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

  if (isUserLoading || isAdminChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!globalAdminData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
              <CardDescription>No tienes permisos de Super Administrador para ver esta página.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/" className="text-primary hover:underline font-bold">Volver al inicio</Link>
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
            <h1 className="text-4xl font-black font-headline tracking-tighter mb-2">Panel Global</h1>
            <p className="text-muted-foreground">Administra y monitorea todos los negocios registrados en TurnosYa.</p>
          </div>
          <div className="flex items-center gap-4 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
            <Store className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">{allSalons?.length || 0} Negocios</span>
          </div>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            placeholder="Buscar por nombre de negocio o ID..." 
            className="pl-10 h-12 bg-card border-2 rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isSalonsLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSalons.map((salon) => (
              <Card key={salon.id} className="group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Store className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest">
                      ID: {salon.id}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-headline group-hover:text-primary transition-colors">{salon.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    Registrado: {salon.createdAt?.toDate ? format(salon.createdAt.toDate(), "dd MMM yyyy", { locale: es }) : 'N/A'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Colores</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: salon.primaryColor || '#000' }} />
                        <span className="text-xs font-mono">{salon.primaryColor || 'Default'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Horarios</span>
                      <span className="text-xs font-bold mt-1">{salon.timeSlots?.length || 0} Slots</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="w-full rounded-xl hover:bg-primary hover:text-primary-foreground" asChild>
                      <Link href={`/book/${salon.id}`} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" /> Ver Reservas
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredSalons.length === 0 && (
              <div className="md:col-span-3 text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed">
                <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-xl font-bold text-muted-foreground">No se encontraron negocios con ese criterio.</p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
