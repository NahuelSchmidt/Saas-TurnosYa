import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Share2, Settings, BarChart3, CheckCircle2, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import BookingFlow from "@/components/booking/BookingFlow";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const demoTenantId = 'admin-tenant-1';

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-grow">
        {/* Hero Section - Centrada verticalmente */}
        <section className="relative w-full min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden border-b py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,120,120,0.05),transparent)] pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center space-y-10">
              <Badge variant="outline" className="py-1.5 px-4 border-primary/20 bg-primary/5 text-primary text-sm font-medium">
                La herramienta definitiva para profesionales independientes
              </Badge>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight font-headline max-w-6xl leading-[0.85] text-balance text-foreground">
                Agenda llena, <br />
                <span className="opacity-30">sin complicaciones.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-muted-foreground text-xl md:text-2xl leading-relaxed">
                Deja de coordinar citas por WhatsApp. Crea tu página de reservas en minutos y permite que tus clientes agenden 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 w-full justify-center pt-6">
                <Button size="lg" className="h-16 px-12 text-xl font-bold rounded-2xl shadow-2xl transition-transform hover:scale-105 active:scale-95" asChild>
                  <Link href="/register">
                    Empezar Gratis <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-12 text-xl font-bold rounded-2xl border-2 transition-transform hover:scale-105 active:scale-95" asChild>
                  <a href="#demo-section">Ver Demo en Vivo</a>
                </Button>
              </div>
              <div className="flex items-center gap-5 pt-10 text-sm text-muted-foreground">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                      <img src={`https://picsum.photos/seed/${i + 20}/40/40`} alt="user" />
                    </div>
                  ))}
                </div>
                <p className="text-lg">Únete a +500 profesionales que ya automatizaron su agenda</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-28 border-b">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-10 md:grid-cols-3">
              {[
                {
                  title: "Tu Marca, Tu Link",
                  desc: "Recibe un enlace profesional personalizado para tu bio de Instagram o WhatsApp.",
                  icon: Share2,
                },
                {
                  title: "Control Total",
                  desc: "Configura servicios, precios, duración y horarios según tu conveniencia.",
                  icon: Settings,
                },
                {
                  title: "Crecimiento Real",
                  desc: "Analiza tus ingresos y ocupación semanal con reportes visuales automáticos.",
                  icon: BarChart3,
                },
              ].map((f, i) => (
                <div key={i} className="group p-10 rounded-[2.5rem] bg-card border transition-all hover:border-primary/20">
                  <div className={`p-4 w-fit rounded-2xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-8`}>
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold font-headline mb-4 text-foreground">{f.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="w-full py-28">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-bold font-headline mb-6 tracking-tight text-foreground">Lanza tu sistema en 3 pasos</h2>
              <p className="text-muted-foreground text-xl">Sin configuraciones difíciles. Diseñado para ser simple.</p>
            </div>
            <div className="grid gap-16 md:grid-cols-3">
              {[
                { step: "1", title: "Crea tu Cuenta", desc: "Regístrate con tu email y el nombre de tu marca personal.", icon: CheckCircle2 },
                { step: "2", title: "Carga tus Servicios", desc: "Define qué ofreces, cuánto dura y qué precio tiene cada cita.", icon: Zap },
                { step: "3", title: "Comparte y Gana", desc: "Pon tu link en redes sociales y empieza a recibir turnos.", icon: ShieldCheck },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-3xl mb-8 shadow-xl">
                    {s.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 font-headline text-foreground">{s.title}</h3>
                  <p className="text-muted-foreground text-lg max-w-[280px]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo-section" className="w-full py-32 bg-muted/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center mb-20">
              <h2 className="text-4xl md:text-7xl font-bold mb-8 font-headline tracking-tighter text-foreground">
                La experiencia de tus clientes
              </h2>
              <p className="text-muted-foreground text-xl">
                Así es como verán tu página de reservas. Rápida, intuitiva y optimizada para cualquier celular.
              </p>
            </div>
            
            <div className="relative max-w-6xl mx-auto px-4">
              {/* Browser Window Mockup */}
              <div className="relative bg-card rounded-[2rem] md:rounded-[3rem] shadow-2xl border overflow-hidden ring-1 ring-white/10 shadow-[0_0_80px_-20px_rgba(255,255,255,0.15)]">
                {/* Browser Toolbar */}
                <div className="bg-muted p-4 md:p-6 border-b flex items-center gap-4">
                  {/* macOS Windows Buttons */}
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-inner" />
                  </div>
                  {/* Address Bar */}
                  <div className="mx-auto bg-background border px-4 md:px-8 py-1.5 rounded-xl text-[10px] md:text-xs text-muted-foreground font-mono truncate max-w-[200px] md:max-w-[400px]">
                    turnosya.com/book/tu-marca
                  </div>
                </div>
                {/* Browser Content Area */}
                <div className="p-4 md:p-16 lg:p-20 bg-background">
                  <div className="max-w-4xl mx-auto">
                    <BookingFlow tenantId={demoTenantId} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="w-full py-32 relative overflow-hidden bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <h2 className="text-5xl md:text-8xl font-black mb-10 font-headline tracking-tighter bg-background text-foreground p-4 inline-block transform -skew-x-2">
              Automatiza tu Agenda hoy
            </h2>
            <p className="text-primary-foreground/80 mt-8 mb-16 text-2xl max-w-3xl mx-auto font-medium">
              Únete a los profesionales que ya automatizaron su agenda y están ganando más cada día con menos esfuerzo.
            </p>
            <button className="h-20 px-16 text-2xl font-black rounded-[2rem] shadow-2xl transition-all hover:scale-105 bg-background text-foreground border-none cursor-pointer">
              <Link href="/register">Crear mi Agenda Gratis</Link>
            </button>
            <p className="mt-10 opacity-60 text-sm font-bold uppercase tracking-widest">Sin tarjetas de crédito. Sin contratos.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
