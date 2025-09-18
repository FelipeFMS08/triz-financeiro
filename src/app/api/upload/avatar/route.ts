import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validações
    if (file.size > 2 * 1024 * 1024) { // 2MB
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Máximo 2MB.' 
      }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'Apenas imagens são aceitas' 
      }, { status: 400 });
    }

    // Converter para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload para Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'avatars', // Organizar em pasta
          public_id: `user_${session.user.id}`, // ID único por usuário
          transformation: [
            { 
              width: 300, 
              height: 300, 
              crop: 'fill', 
              gravity: 'face' // Focar no rosto se detectar
            },
            { quality: 'auto:good' } // Otimização automática
          ],
          overwrite: true, // Sobrescrever imagem anterior
          invalidate: true, // Limpar cache do CDN
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const result = uploadResult as any;
    
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    }, { status: 200 });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// Endpoint para deletar imagem (opcional)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({ 
        error: 'Public ID é necessário' 
      }, { status: 400 });
    }

    // Deletar do Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ 
      message: 'Imagem removida com sucesso',
      result 
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}