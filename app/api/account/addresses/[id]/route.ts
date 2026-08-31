import { NextResponse } from 'next/server';
import { updateSavedAddress, deleteSavedAddress, setDefaultAddress } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

// Shared reference to in-memory state (imported dynamically or managed via global routing)
// Next.js dev server hot-reloads modules, but a global object on globalThis survives hot reloads
const globalStore = (globalThis as any);
if (!globalStore.inMemoryAddresses) {
  globalStore.inMemoryAddresses = {};
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { customerId, action, ...updatedFields } = body;

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    try {
      let addresses;
      if (action === 'set-default') {
        addresses = await setDefaultAddress(customerId, id);
      } else {
        addresses = await updateSavedAddress(customerId, id, updatedFields);
      }

      if (addresses && addresses.length > 0) {
        globalStore.inMemoryAddresses[customerId] = addresses;
        return NextResponse.json(addresses);
      }
    } catch (supabaseError) {
      console.warn('Supabase address update failed, falling back to in-memory:', supabaseError);
    }

    // In-memory fallback logic
    let addressesList = globalStore.inMemoryAddresses[customerId] || [];
    
    if (action === 'set-default') {
      addressesList = addressesList.map((addr: any) => ({
        ...addr,
        isDefault: addr.id === id,
      }));
    } else {
      if (updatedFields.isDefault) {
        addressesList = addressesList.map((addr: any) => ({
          ...addr,
          isDefault: false,
        }));
      }
      addressesList = addressesList.map((addr: any) => {
        if (addr.id === id) {
          return {
            ...addr,
            ...updatedFields,
          };
        }
        return addr;
      });
    }

    globalStore.inMemoryAddresses[customerId] = addressesList;
    return NextResponse.json(addressesList);

  } catch (error: any) {
    console.error('API PUT /api/account/addresses/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId') || request.headers.get('x-customer-id');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    try {
      const addresses = await deleteSavedAddress(customerId, id);
      // If supabase execution succeeded, it returns updated address list
      // Note: if the table was empty, it returns [] which is also correct
      const checkAddresses = await updateSavedAddress(customerId, id, {}); // dry run check
      if (checkAddresses && checkAddresses.length > 0) {
        globalStore.inMemoryAddresses[customerId] = addresses;
        return NextResponse.json(addresses);
      }
    } catch (supabaseError) {
      console.warn('Supabase address delete failed, falling back to in-memory:', supabaseError);
    }

    // In-memory fallback logic
    let addressesList = globalStore.inMemoryAddresses[customerId] || [];
    addressesList = addressesList.filter((addr: any) => addr.id !== id);
    
    globalStore.inMemoryAddresses[customerId] = addressesList;
    return NextResponse.json(addressesList);

  } catch (error: any) {
    console.error('API DELETE /api/account/addresses/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
