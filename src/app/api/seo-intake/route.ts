import { NextRequest, NextResponse } from 'next/server';
import { FormData } from '../../seo-intake-form/types';
import { db } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const formData: FormData = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'company', 'phone', 'email', 'website', 'serviceAreas'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Save to database
    try {
      const result = await db.execute({
        sql: `INSERT INTO seo_intake_forms (
          name, title, company, phone, email, best_time,
          website, years_in_business, services, service_areas, competitors,
          current_seo_provider, monthly_seo_investment, current_seo_work,
          website_platform, admin_access, google_accounts,
          primary_goal, target_customers, customer_value, top_services,
          package_interest, differentiators, common_questions, additional_info, industry
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          formData.name,
          formData.title || null,
          formData.company,
          formData.phone,
          formData.email,
          formData.bestTime || null,
          formData.website,
          formData.yearsInBusiness || null,
          JSON.stringify(formData.services || []),
          formData.serviceAreas,
          formData.competitors || null,
          formData.currentSeoProvider || null,
          formData.monthlySeoInvestment || null,
          JSON.stringify(formData.currentSeoWork || []),
          formData.websitePlatform || null,
          formData.adminAccess || null,
          JSON.stringify(formData.googleAccounts || []),
          formData.primaryGoal || null,
          formData.targetCustomers || null,
          formData.customerValue || null,
          formData.topServices || null,
          formData.package || null,
          formData.differentiators || null,
          formData.commonQuestions || null,
          formData.additionalInfo || null,
          formData.industry || 'general'
        ]
      });

      console.log('Form saved to database with ID:', result.lastInsertRowid);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue with email even if database fails
    }

    // Format email content
    const emailContent = formatEmailContent(formData);
    
    // Here you would typically send the email
    // For now, we'll log it and simulate success
    console.log('New SEO Intake Form Submission:');
    console.log(emailContent);
    
    // You can integrate with email services like:
    // - Resend
    // - SendGrid
    // - Nodemailer with Gmail
    // - AWS SES
    
    // Example with a simple email service (you'll need to implement):
    // await sendEmail({
    //   to: 'Jim@Lowrys.org',
    //   subject: `New SEO Intake Form - ${formData.company}`,
    //   html: emailContent
    // });
    
    return NextResponse.json({ success: true, message: 'Form submitted successfully' });
    
  } catch (error) {
    console.error('Error processing form submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatEmailContent(data: FormData): string {
  return `
    <h2>New SEO Intake Form Submission</h2>
    
    <h3>Contact Information</h3>
    <ul>
      <li><strong>Name:</strong> ${data.name}</li>
      <li><strong>Title:</strong> ${data.title || 'Not provided'}</li>
      <li><strong>Company:</strong> ${data.company}</li>
      <li><strong>Phone:</strong> ${data.phone}</li>
      <li><strong>Email:</strong> ${data.email}</li>
      <li><strong>Best time to contact:</strong> ${data.bestTime || 'Not specified'}</li>
    </ul>
    
    <h3>Business Information</h3>
    <ul>
      <li><strong>Website:</strong> <a href="${data.website}">${data.website}</a></li>
      <li><strong>Years in business:</strong> ${data.yearsInBusiness || 'Not provided'}</li>
      <li><strong>Services offered:</strong> ${data.services.join(', ') || 'Not specified'}</li>
      <li><strong>Service areas:</strong> ${data.serviceAreas}</li>
      <li><strong>Main competitors:</strong> ${data.competitors || 'Not provided'}</li>
    </ul>
    
    <h3>Current SEO</h3>
    <ul>
      <li><strong>Current provider:</strong> ${data.currentSeoProvider || 'None specified'}</li>
      <li><strong>Monthly investment:</strong> ${data.monthlySeoInvestment || 'Not provided'}</li>
      <li><strong>Current SEO work:</strong> ${data.currentSeoWork.join(', ') || 'Not specified'}</li>
    </ul>
    
    <h3>Package Interest</h3>
    <p><strong>Interested in:</strong> ${data.package || 'Not specified'}</p>
    
    <h3>Additional Information</h3>
    <ul>
      <li><strong>What makes them different:</strong> ${data.differentiators || 'Not provided'}</li>
      <li><strong>Common customer questions:</strong> ${data.commonQuestions || 'Not provided'}</li>
      <li><strong>Additional information:</strong> ${data.additionalInfo || 'Not provided'}</li>
    </ul>
    
    <hr>
    <p><small>Submitted: ${new Date().toLocaleString()}</small></p>
  `;
}

// Alternative: Plain text email format
function formatPlainTextEmail(data: FormData): string {
  return `
NEW SEO INTAKE FORM SUBMISSION

CONTACT INFORMATION:
Name: ${data.name}
Title: ${data.title || 'Not provided'}
Company: ${data.company}
Phone: ${data.phone}
Email: ${data.email}
Best time to contact: ${data.bestTime || 'Not specified'}

BUSINESS INFORMATION:
Website: ${data.website}
Years in business: ${data.yearsInBusiness || 'Not provided'}
Services offered: ${data.services.join(', ') || 'Not specified'}
Service areas: ${data.serviceAreas}
Main competitors: ${data.competitors || 'Not provided'}

CURRENT SEO:
Current provider: ${data.currentSeoProvider || 'None specified'}
Monthly investment: ${data.monthlySeoInvestment || 'Not provided'}
Current SEO work: ${data.currentSeoWork.join(', ') || 'Not specified'}

PACKAGE INTEREST:
${data.package || 'Not specified'}

ADDITIONAL INFO:
What makes them different: ${data.differentiators || 'Not provided'}
Common customer questions: ${data.commonQuestions || 'Not provided'}
Additional information: ${data.additionalInfo || 'Not provided'}

Submitted: ${new Date().toLocaleString()}
  `;
}
