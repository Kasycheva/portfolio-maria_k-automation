import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

let client;
async function db() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
  }
  const name = process.env.DB_NAME || 'portfolio';
  return client.db(name);
}

export async function GET(_req, { params }) {
  const path = (params?.path || []).join('/');
  if (path === 'health' || path === '') return NextResponse.json({ ok: true, service: 'maria-portfolio' });
  return NextResponse.json({ error: 'not found' }, { status: 404 });
}

export async function POST(req, { params }) {
  const path = (params?.path || []).join('/');
  if (path === 'contact') {
    try {
      const body = await req.json();
      const d = await db();
      await d.collection('contacts').insertOne({ ...body, createdAt: new Date(), id: crypto.randomUUID() });
      return NextResponse.json({ ok: true });
    } catch (e) {
      return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
    }
  }
  return NextResponse.json({ error: 'not found' }, { status: 404 });
}
