
"use client";

import { useState, useEffect } from "react";
import { Service, Professional, Appointment } from "@/lib/data";
import { useAppointments } from "@/hooks/use-appointments";
import { useServices } from "@/hooks/use-services";
import { useProfessionals } from "@/hooks/use-professionals";
import { adminUsers } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, differenceInHours } from "date-fns";
import { es } from "date-fns/locale";
import { Trash2, RotateCw, User, Clock, Loader2, MessageSquare } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PopulatedAppointment extends Omit<Appointment, 'serviceIds' | 'professionalId'> {
  services: Service[];
  professional: Professional | undefined;
}

interface UserAppointmentsProps {
    tenantId: string;
}

export function UserAppointments({ tenantId }: UserAppointmentsProps) {
  const { appointments: allAppointments, cancelAppointment, loading: appointmentsLoading, customerId } = useAppointments(tenantId);
  const { services, loading: servicesLoading } = useServices(tenantId);
  const { professionals, loading: professionalsLoading } = useProfessionals(tenantId);

  const [appointments, setAppointments] = useState<PopulatedAppointment[]>([]);
  const [now, setNow] = useState(new Date());

  const loading = appointmentsLoading || servicesLoading || professionalsLoading;
  const business = adminUsers.find(admin => admin.tenantId === tenantId);

  useEffect(() => {
    if (!loading && allAppointments) {
      const populated = allAppointments
        .filter(apt => apt.customerId === customerId)
        .map(apt => ({
        ...apt,
        services: (apt.serviceIds || []).map(id => services.find(s => s.id === id)).filter(Boolean) as Service[],
        professional: professionals.find(p => p.id === apt.professionalId)
      }));
      setAppointments(populated);
    }
  }, [allAppointments, services, professionals, loading, customerId]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  const notifyCancellation = (appointment: PopulatedAppointment) => {
    if (!business) return;

    const formattedDate = format(new Date(appointment.startTime), "eeee dd 'de' MMMM 'a las' HH:mm'hs'", { locale: es });
    const serviceNames = appointment.services.map(s => s.name).join(', ');
    
    const message = `¡Cancelación de Turno!
Cliente: ${appointment.customerName}
Turno: ${formattedDate}
Servicios: ${serviceNames}
Profesional: ${appointment.professional?.name || 'N/A'}`;

    const url = `https://wa.me/${business.phone.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleCancel = (appointment: PopulatedAppointment) => {
      cancelAppointment(appointment.id);
      notifyCancellation(appointment);
  }

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'confirmed' && new Date(apt.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const pastAppointments = appointments
    .filter(apt => new Date(apt.startTime) <= now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  if (loading) {
    return (
        <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Cargando tus turnos...</p>
        </div>
    )
  }
    
  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Próximas Citas</h3>
          {upcomingAppointments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingAppointments.map(apt => {
                const canCancel = differenceInHours(new Date(apt.startTime), now) >= 12;
                return (
                  <Card key={apt.id}>
                    <CardHeader>
                      <CardTitle className="text-xl capitalize">
                        {format(new Date(apt.startTime), "eeee, dd 'de' MMMM", { locale: es })}
                      </CardTitle>
                      <CardDescription>
                        a las {format(new Date(apt.startTime), "HH:mm")}hs
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                       <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{apt.professional?.name}</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{apt.services.map(s => s.name).join(', ')}</span>
                       </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full">
                            <Button variant="outline" className="w-full" disabled>
                              <RotateCw className="w-4 h-4 mr-2" />
                              Reprogramar
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent><p>Función de reprogramar no disponible.</p></TooltipContent>
                      </Tooltip>
                      <AlertDialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                               <div className="w-full">
                                <Button variant="destructive" className="w-full" disabled={!canCancel}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Cancelar
                                </Button>
                              </div>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          {!canCancel && <TooltipContent><p>No se puede cancelar con menos de 12hs de antelación.</p></TooltipContent>}
                        </Tooltip>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro de que quieres cancelar?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se notificará al negocio sobre la cancelación.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Volver</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancel(apt)}>Sí, Cancelar y Notificar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No tienes próximas citas.</p>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Citas Anteriores</h3>
          {pastAppointments.length > 0 ? (
            <div className="space-y-3">
              {pastAppointments.map(apt => (
                <Card key={apt.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold capitalize">{format(new Date(apt.startTime), "PPP", { locale: es })}</p>
                    <p className="text-sm text-muted-foreground">{apt.services.map(s => s.name).join(', ')} con {apt.professional?.name}</p>
                  </div>
                  <Badge variant={apt.status === 'completed' ? 'secondary' : apt.status === 'confirmed' ? 'outline' : 'destructive'}>{
                    {
                      completed: 'Completado',
                      confirmed: 'Confirmado',
                      cancelled: 'Cancelado'
                    }[apt.status] ?? apt.status
                  }</Badge>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No tienes citas anteriores.</p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
