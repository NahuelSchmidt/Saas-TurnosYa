"use client";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

interface TimeSlotPickerProps {
  timeSlots: string[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

export default function TimeSlotPicker({
  timeSlots,
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
}: TimeSlotPickerProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 font-headline">Elige Fecha y Hora</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex justify-center">
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={onSelectDate}
                className="rounded-md border"
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
            />
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold mb-3">Horarios Disponibles</h3>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot}
                variant={selectedTime === slot ? "default" : "outline"}
                onClick={() => onSelectTime(slot)}
              >
                {slot}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
