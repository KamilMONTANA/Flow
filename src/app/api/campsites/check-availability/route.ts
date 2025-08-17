import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { checkIn, checkOut, numberOfPeople } = await request.json();

    // Pobierz wszystkie aktywne rezerwacje w danym przedziale czasowym
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .neq('status', 'cancelled')
      .lte('checkIn', checkOut)
      .gte('checkOut', checkIn);

    if (bookingsError) {
      throw new Error('Błąd podczas pobierania rezerwacji');
    }

    // Pobierz całkowitą liczbę dostępnych kajaków
    const { data: kayaks, error: kayaksError } = await supabase
      .from('inventory')
      .select('*')
      .eq('type', 'kayak')
      .eq('is_available', true);

    if (kayaksError) {
      throw new Error('Błąd podczas pobierania dostępnych kajaków');
    }

    const totalKayaks = kayaks?.length || 0;
    const totalPeopleInBookings = bookings.reduce((sum, booking) => sum + (booking.numberOfPeople || 0), 0);
    const availableKayaks = Math.max(0, totalKayaks - Math.ceil(totalPeopleInBookings / 2)); // Zakładamy 2 osoby na kajak

    // Sprawdź czy mamy wystarczającą liczbę kajaków dla nowej rezerwacji
    const requiredKayaks = Math.ceil(numberOfPeople / 2);
    const isAvailable = availableKayaks >= requiredKayaks;

    return NextResponse.json({
      isAvailable,
      availableKayaks,
      requiredKayaks,
      totalKayaks
    });

  } catch (error) {
    console.error('Błąd podczas sprawdzania dostępności:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Wewnętrzny błąd serwera' },
      { status: 500 }
    );
  }
}
