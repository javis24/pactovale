import { NextResponse } from 'next/server';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    const body = await request.json();

    const { name, email, password, address, zipCode, whatsapp, gender } = body;

    
    const exists = await User.findOne({ where: { email } });
    if (exists) return NextResponse.json({ message: 'Email ocupado' }, { status: 400 });

   
    const hashedPassword = await bcrypt.hash(password, 10);

   
    const user = await User.create({
      name, email, password: hashedPassword, address, zipCode, whatsapp, gender
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error server' }, { status: 500 });
  }
}