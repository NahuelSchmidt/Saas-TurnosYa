
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirestore, useAuth as useFirebaseAuth } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Store, Loader2, CheckCircle2, ShieldCheck, Globe, Calendar } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const router = useRouter();

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')     // Reemplaza espacios con -
      .replace(/[^\w-]+/g, '')  // Elimina caracteres no alfanuméricos
      .replace(/--+/g, '-');    // Reemplaza múltiples - con uno solo
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !businessName) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Generamos un ID basado en el nombre del negocio + sufijo corto de UID (8 caracteres)
      const slug = slugify(businessName) || 'biz';
      const salonId = `${slug}-${uid.slice(0, 8)}`;

      // Guardamos el salón
      setDocumentNonBlocking(doc(db, "salons", salonId), {
        id: salonId,
        name: businessName,
        adminMembers: { [uid]: true },
        createdAt: serverTimestamp(),
        timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        primaryColor: '#673AB7' // Color por defecto según lineamientos
      }, { merge: true });

      // Guardamos el perfil
      setDocumentNonBlocking(doc(db, "userProfiles", uid), {
        id: uid,
        email,
        role: "admin",
        firstName: businessName,
        lastName: "(Admin)",
        externalAuthId: uid,
        createdAt: serverTimestamp()
      }, { merge: true });

      setIsSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Este email ya está registrado.");
      } else {
        setError("Error al registrar el negocio. Intenta de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-10 pb-10">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">¡Negocio Registrado!</h2>
              <p className="text-muted-foreground">Estamos preparando tu panel de administración personalizado...</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:block space-y-6">
            <h1 className="text-4xl font-bold font-headline text-primary">Haz crecer tu negocio con TurnosYa</h1>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Globe className="text-blue-500 mt-1" />
                <div>
                  <p className="font-bold">Tu propia URL de reserva</p>
                  <p className="text-sm text-muted-foreground">Un link con el nombre de tu marca para compartir en Instagram y WhatsApp.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="text-primary mt-1" />
                <div>
                  <p className="font-bold">Agenda 24/7</p>
                  <p className="text-sm text-muted-foreground">Tus clientes agendan cuando quieran, tú solo recibes las notificaciones.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="text-green-500 mt-1" />
                <div>
                  <p className="font-bold">Pagos Integrados</p>
                  <p className="text-sm text-muted-foreground">Reduce ausencias cobrando señas o el total mediante Mercado Pago.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <Card className="w-full shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-2">
                <Store className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">Comienza Gratis</CardTitle>
              <CardDescription>Crea tu cuenta de administrador ahora.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre de tu Negocio / Marca</Label>
                  <Input 
                    id="businessName" 
                    placeholder="Ej: Barbería Don Juan, Estética Zen, etc." 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                  <p className="text-[10px] text-muted-foreground px-1">
                    Esto generará tu link: turnosya.com/book/<strong>{businessName ? businessName.toLowerCase().replace(/\s+/g, '-') : 'nombre-del-negocio'}</strong>-...
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email de Acceso</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="admin@tu-negocio.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña (mínimo 6 caracteres)</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Crear mi Espacio de Reservas"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm">
                <p className="text-muted-foreground">
                  ¿Ya tienes cuenta? <a href="/dashboard" className="text-primary font-bold hover:underline">Inicia Sesión</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
