import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import * as cron from 'node-cron';

// Store scheduled reminders (in production, use a database)
const scheduledReminders = new Map<string, any>();

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendReminderEmail = async (email: string, task: string, scheduledTime: string) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🔔 AI Reminder: Your Scheduled Task',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 24px;">🔔 Reminder Alert</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Your AI assistant is here to remind you!</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
              <h2 style="color: #333; margin-top: 0; font-size: 18px;">📋 Task Reminder</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 15px 0;">
                <strong>${task}</strong>
              </p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
              <p style="margin: 0; color: #1976d2; font-size: 14px;">
                <strong>⏰ Scheduled for:</strong> ${scheduledTime}
              </p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                This reminder was set up through your ChatGPT Clone AI Assistant
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${email} for task: ${task}`);
    
  } catch (error) {
    console.error('Error sending reminder email:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    const { task, date, time, email } = await request.json();
    
    // Validate input
    if (!task || !date || !time || !email) {
      return NextResponse.json({ 
        error: 'All fields are required' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Parse the scheduled time
    const scheduledDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (scheduledDateTime <= now) {
      return NextResponse.json({ 
        error: 'Scheduled time must be in the future' 
      }, { status: 400 });
    }

    // Create a unique ID for this reminder
    const reminderId = `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate cron expression
    const cronExpression = `${scheduledDateTime.getMinutes()} ${scheduledDateTime.getHours()} ${scheduledDateTime.getDate()} ${scheduledDateTime.getMonth() + 1} *`;
    
    // Schedule the reminder
    const scheduledTask = cron.schedule(cronExpression, async () => {
      await sendReminderEmail(email, task, scheduledDateTime.toLocaleString());
      
      // Clean up after sending
      scheduledReminders.delete(reminderId);
      scheduledTask.destroy();
    }, {
      scheduled: true,
      timezone: "America/New_York" // You can make this configurable
    });

    // Store the reminder info
    scheduledReminders.set(reminderId, {
      task,
      email,
      scheduledTime: scheduledDateTime.toISOString(),
      cronTask: scheduledTask
    });

    // For immediate testing, you can also send a confirmation email
    if (process.env.NODE_ENV === 'development') {
      try {
        const transporter = createTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: '✅ Reminder Set Successfully',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4CAF50;">✅ Reminder Set Successfully!</h2>
              <p>Your reminder has been scheduled:</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <strong>Task:</strong> ${task}<br>
                <strong>Scheduled for:</strong> ${scheduledDateTime.toLocaleString()}
              </div>
              <p style="color: #666; font-size: 14px;">You'll receive another email at the scheduled time.</p>
            </div>
          `
        });
      } catch (emailError) {
        console.log('Could not send confirmation email:', emailError);
      }
    }

    return NextResponse.json({ 
      message: `Reminder set successfully! You'll receive an email on ${scheduledDateTime.toLocaleDateString()} at ${scheduledDateTime.toLocaleTimeString()}`,
      reminderId,
      scheduledTime: scheduledDateTime.toISOString()
    });
    
  } catch (error) {
    console.error('Reminder API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid date')) {
        return NextResponse.json({ 
          error: 'Invalid date or time format' 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to set reminder. Please check your email configuration and try again.' 
    }, { status: 500 });
  }
}

// GET endpoint to list active reminders
export async function GET(request: NextRequest) {
  try {
    const reminders = Array.from(scheduledReminders.entries()).map(([id, reminder]) => ({
      id,
      task: reminder.task,
      email: reminder.email,
      scheduledTime: reminder.scheduledTime
    }));
    
    return NextResponse.json({ reminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

// DELETE endpoint to cancel a reminder
export async function DELETE(request: NextRequest) {
  try {
    const { reminderId } = await request.json();
    
    if (!reminderId || !scheduledReminders.has(reminderId)) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }
    
    const reminder = scheduledReminders.get(reminderId);
    reminder.cronTask.destroy();
    scheduledReminders.delete(reminderId);
    
    return NextResponse.json({ message: 'Reminder cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling reminder:', error);
    return NextResponse.json({ error: 'Failed to cancel reminder' }, { status: 500 });
  }
}