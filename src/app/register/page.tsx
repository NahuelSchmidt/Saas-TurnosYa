
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
import { setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Store, Loader2, CheckCircle2, ShieldCheck, Globe, Calendar, CreditCard, Zap } from "lucide-react";

type RegistrationStep = "form" | "payment" | "success";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [step, setStep] = useState<RegistrationStep>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdSalonId, setCreatedSalonId] = useState("");
  
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const router = useRouter();

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
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
      
      const slug = slugify(businessName) || 'biz';
      const salonId = `${slug}-${uid.slice(0, 8)}`;
      setCreatedSalonId(salonId);

      // Guardamos el salón con estado 'pending'
      setDocumentNonBlocking(doc(db, "salons", salonId), {
        id: salonId,
        name: businessName,
        adminMembers: { [uid]: true },
        subscriptionStatus: 'pending',
        createdAt: serverTimestamp(),
        timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        primaryColor: '#000000'
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

      setStep("payment");
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

  const handlePayment = () => {
    setIsLoading(true);
    // Simulación de integración con Mercado Pago
    setTimeout(() => {
      if (createdSalonId) {
        const salonRef = doc(db, "salons", createdSalonId);
        updateDocumentNonBlocking(salonRef, {
          subscriptionStatus: 'active',
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: serverTimestamp()
        });
      }
      setStep("success");
      setTimeout(() => router.push("/dashboard"), 2000);
    }, 2000);
  };

  if (step === "success") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center border-primary/20 shadow-2xl">
            <CardContent className="pt-10 pb-10">
              <div className="bg-green-100 rounded-full p-4 w-fit mx-auto mb-6">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-3xl font-black font-headline tracking-tighter uppercase italic mb-2">¡Cuenta Activada!</h2>
              <p className="text-muted-foreground">Tu suscripción ha sido confirmada. Redirigiendo a tu panel de control...</p>
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mt-6" />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4 bg-muted/30">
          <Card className="w-full max-w-lg shadow-2xl border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-2">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-black font-headline tracking-tighter uppercase italic">Activa tu Negocio</CardTitle>
              <CardDescription className="text-lg">Suscríbete para empezar a recibir reservas hoy mismo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-6 rounded-2xl border space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="font-bold">Plan Profesional Mensual</span>
                  <span className="text-2xl font-black text-primary">$4.999 / mes</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Agenda ilimitada</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Link de reserva personalizado</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Gestión de servicios y equipo</li>
                </ul>
              </div>
              
              <Button onClick={handlePayment} className="w-full h-16 text-xl font-black uppercase italic rounded-2xl shadow-xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <CreditCard className="mr-2 h-6 w-6" />}
                Pagar con Mercado Pago
              </Button>
              <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">Pago seguro procesado por Mercado Pago</p>
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
            <h1 className="text-6xl font-black font-headline tracking-tighter uppercase italic leading-[0.9] text-primary">
              Potencia tu <br /> negocio ahora.
            </h1>
            <ul className="space-y-4 pt-6">
              <li className="flex items-start gap-3">
                <Globe className="text-primary mt-1" />
                <div>
                  <p className="font-bold">Tu propia URL de reserva</p>
                  <p className="text-sm text-muted-foreground">Comparte tu link profesional en Instagram y WhatsApp.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="text-primary mt-1" />
                <div>
                  <p className="font-bold">Agenda Automática 24/7</p>
                  <p className="text-sm text-muted-foreground">Tus clientes agendan, tú solo te enfocas en atender.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <Card className="w-full shadow-2xl border-primary/10">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-2">
                <Store className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black font-headline tracking-tighter uppercase italic">Registrar Negocio</CardTitle>
              <CardDescription>Paso 1: Crea tu cuenta administrativa.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre de tu Marca</Label>
                  <Input 
                    id="businessName" 
                    placeholder="Ej: Barbería Estilo" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email de Acceso</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12"
                  />
                </div>
                {error && <p className="text-sm text-destructive font-bold">{error}</p>}
                <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Siguiente: Plan de Suscripción"}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm">
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
