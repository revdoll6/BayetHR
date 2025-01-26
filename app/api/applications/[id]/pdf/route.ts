import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
const PDFDocument = require('pdfkit');

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch application data
    const application = await db.application.findUnique({
      where: { id: params.id },
      include: {
        jobPosition: true,
        candidate: true,
      },
    });

    if (!application) {
      return new NextResponse('Application not found', { status: 404 });
    }

    // Create a PDF document
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    // Collect PDF chunks
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Handle PDF generation completion
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // Add content to PDF
    doc
      .fontSize(20)
      .text('Application Details', { align: 'center' })
      .moveDown();

    // Personal Information
    doc
      .fontSize(16)
      .text('Personal Information')
      .moveDown()
      .fontSize(12)
      .text(`Name: ${application.firstName} ${application.lastName}`)
      .text(`Email: ${application.email}`)
      .text(`Phone: ${application.mobile}`)
      .moveDown();

    // Job Position
    doc
      .fontSize(16)
      .text('Position Details')
      .moveDown()
      .fontSize(12)
      .text(`Position: ${application.jobPosition.name}`)
      .text(`Arabic Name: ${application.jobPosition.ar_name}`)
      .moveDown();

    // Languages
    const languages = typeof application.languages === 'string'
      ? JSON.parse(application.languages)
      : application.languages;

    doc
      .fontSize(16)
      .text('Languages')
      .moveDown()
      .fontSize(12);

    languages.forEach((lang: { name: string; level: string }) => {
      doc.text(`${lang.name} - ${lang.level}`);
    });
    doc.moveDown();

    // Education
    const education = typeof application.education === 'string'
      ? JSON.parse(application.education)
      : application.education;

    doc
      .fontSize(16)
      .text('Education')
      .moveDown()
      .fontSize(12);

    education.forEach((edu: {
      type: string;
      level?: string;
      institution: string;
      fieldOfStudy: string;
    }) => {
      doc
        .text(`${edu.type}${edu.level ? ` - ${edu.level}` : ''}`)
        .text(`${edu.fieldOfStudy} at ${edu.institution}`)
        .moveDown();
    });

    // Experience
    const experience = typeof application.experience === 'string'
      ? JSON.parse(application.experience)
      : application.experience;

    doc
      .fontSize(16)
      .text('Experience')
      .moveDown()
      .fontSize(12);

    experience.forEach((exp: {
      title: string;
      company: string;
      location?: string;
      description?: string;
    }) => {
      doc
        .text(exp.title)
        .text(exp.company)
        .text(exp.location || '')
        .text(exp.description || '')
        .moveDown();
    });

    // Application Status
    doc
      .fontSize(16)
      .text('Application Status')
      .moveDown()
      .fontSize(12)
      .text(`Status: ${application.status}`)
      .text(`Last Updated: ${new Date(application.updatedAt).toLocaleDateString()}`)
      .moveDown();

    // Finalize the PDF
    doc.end();

    // Wait for PDF generation to complete
    const pdfBuffer = await pdfPromise;

    // Return the PDF
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=application-${application.firstName}-${application.lastName}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new NextResponse('Error generating PDF', { status: 500 });
  }
} 