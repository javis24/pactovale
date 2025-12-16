import { NextResponse } from 'next/server';
import User from '@/models/User';
import Document from '@/models/Document';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request) {
  console.log("🟢 INICIANDO PROCESO DE SUBIDA..."); // LOG 1

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
        console.log("🔴 No hay sesión válida");
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }
    console.log("✅ Usuario autenticado:", session.user.id); // LOG 2

    const formData = await request.formData();
    
    // 1. Guardar Datos Bancarios
    const bankUpdates = {};
    if (formData.get('bankName')) bankUpdates.bankName = formData.get('bankName');
    if (formData.get('accountNumber')) bankUpdates.accountNumber = formData.get('accountNumber');
    
    if (Object.keys(bankUpdates).length > 0) {
      console.log("🏦 Actualizando banco...", bankUpdates);
      await User.update(bankUpdates, { where: { id: session.user.id } });
    }

    // 2. Función auxiliar Base64
    const processDocument = async (fileOrText, docType, isFile = true) => {
      if (!fileOrText) {
          console.log(`⚠️ Campo ${docType} vacío o nulo`);
          return;
      }

      console.log(`📸 Procesando ${docType}...`); 
      let finalString = '';

      if (isFile) {
        // Validar que sea un archivo real
        if (fileOrText.size === 0) {
            console.log(`⚠️ Archivo ${docType} tiene tamaño 0`);
            return;
        }

        const bytes = await fileOrText.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString('base64');
        finalString = `data:${fileOrText.type};base64,${base64String}`;
        console.log(`🔹 ${docType} convertido a Base64 (Longitud: ${finalString.length})`);
      } else {
        finalString = fileOrText; 
      }

 
      try {

          await Document.destroy({ where: { userId: session.user.id, type: docType } });
          
          // Creamos nuevo
          const newDoc = await Document.create({
            userId: session.user.id,
            type: docType,
            url: finalString
          });
          console.log(` ${docType} GUARDADO EN DB con ID: ${newDoc.id}`); 
      } catch (dbError) {
          console.error(` ERROR DB guardando ${docType}:`, dbError); 
          throw dbError; 
      }
    };

    // 3. Ejecutar procesos
    const ineFront = formData.get('ineFront');
    if (ineFront) await processDocument(ineFront, 'ine_front');

    const ineBack = formData.get('ineBack');
    if (ineBack) await processDocument(ineBack, 'ine_back');

    const selfie = formData.get('selfie');
    if (selfie) await processDocument(selfie, 'selfie');

    const signature = formData.get('signature');
    if (signature) await processDocument(signature, 'signature', false);

    console.log("🏁 PROCESO TERMINADO CON ÉXITO");
    return NextResponse.json({ message: 'Perfil actualizado' });

  } catch (error) {
    console.error("🔥 ERROR FATAL EN API:", error);
    return NextResponse.json({ message: 'Error interno: ' + error.message }, { status: 500 });
  }
}