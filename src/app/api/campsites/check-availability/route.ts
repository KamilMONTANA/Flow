import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Equipment, Category } from '@/types/inventory';

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

    // Pobierz całkowitą liczbę dostępnych kajaków z inwentarza
    const { data: equipmentRows, error: equipmentError } = await supabase
      .from('inventory_equipment')
      .select('payload');

    const { data: categoryRows, error: categoryError } = await supabase
      .from('inventory_categories')
      .select('payload');

    if (equipmentError || categoryError) {
      throw new Error('Błąd podczas pobierania dostępnych kajaków');
    }

    const equipment = (equipmentRows ?? []).map(
      (r: { payload: Equipment }) => r.payload
    );
    const categories = (categoryRows ?? []).map(
      (r: { payload: Category }) => r.payload
    );

    const kayakCategoryIds = categories
      .filter((c) => c.name.toLowerCase().includes('kajak'))
      .map((c) => c.id);

    const totalKayaks = equipment
      .filter((e) => kayakCategoryIds.includes(e.categoryId))
      .reduce((sum, e) => sum + (e.quantity || 0), 0);
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
