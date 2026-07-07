import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, limit, query } from 'firebase/firestore';

// Robust helper to get milliseconds
function getMillis(item: any): number {
  if (!item) return 0;
  const val = item.timestamp ?? item.date ?? item.createdAt;
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val.seconds === 'number') return val.seconds * 1000;
  if (val instanceof Date) return val.getTime();
  if (typeof val === 'string') {
    const parsed = Date.parse(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// GET: Fetch user history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const q = query(
      collection(db, 'users', userId, 'history'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    const history: any[] = [];
    querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() });
    });

    // Sort by timestamp desc
    history.sort((a, b) => getMillis(b) - getMillis(a));

    return NextResponse.json({ history });
  } catch (err: any) {
    console.error('[API History GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Save image to history
export async function POST(request: Request) {
  try {
    const { item, userId } = await request.json();

    if (!item || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Write directly to subcollection
    const historyRef = doc(collection(db, 'users', userId, 'history'), item.id);
    await setDoc(historyRef, item);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API History POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove image from history or clear everything
export async function DELETE(request: Request) {
  try {
    const { id, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    if (id) {
      // Delete single item
      const historyRef = doc(collection(db, 'users', userId, 'history'), id);
      await deleteDoc(historyRef);
    } else {
      // Wipe entire history
      const q = query(collection(db, 'users', userId, 'history'));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, 'users', userId, 'history', d.id)));
      await Promise.all(deletePromises);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API History DELETE] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
