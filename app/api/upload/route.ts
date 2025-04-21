import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

export async function POST(request: NextRequest) {
  try {
    // Ensure the upload directory exists
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (err) {
      console.error('Error creating uploads directory:', err);
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create a unique filename
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(UPLOAD_DIR, filename);
      
      // Save the file
      await writeFile(filePath, buffer);
      
      // Add to uploaded files list with URL path
      uploadedFiles.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles 
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
} 