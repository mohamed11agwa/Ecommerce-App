import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { action, fileId, model, trainingData, jobId } = await request.json();
    
    switch (action) {
      case 'upload-training-data':
        return await handleUploadTrainingData(trainingData);
      case 'create-job':
        return await handleCreateFineTuningJob(fileId, model);
      case 'list-jobs':
        return await handleListFineTuningJobs();
      case 'get-job':
        return await handleGetFineTuningJob(jobId);
      case 'cancel-job':
        return await handleCancelFineTuningJob(jobId);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Fine-tuning API error:', error);
    return NextResponse.json({ 
      error: 'An error occurred while processing fine-tuning request' 
    }, { status: 500 });
  }
}

async function handleUploadTrainingData(trainingData: any[]) {
  if (!trainingData || !Array.isArray(trainingData) || trainingData.length === 0) {
    return NextResponse.json({ 
      error: 'Training data array is required' 
    }, { status: 400 });
  }

  try {
    // Validate training data format
    const isValidFormat = trainingData.every(item => 
      item.messages && 
      Array.isArray(item.messages) && 
      item.messages.length >= 2 &&
      item.messages.every((msg: any) => msg.role && msg.content)
    );

    if (!isValidFormat) {
      return NextResponse.json({ 
        error: 'Invalid training data format. Each item should have a messages array with role and content.' 
      }, { status: 400 });
    }

    // Convert training data to JSONL format
    const jsonlData = trainingData
      .map(item => JSON.stringify(item))
      .join('\n');

    // Create a temporary file for upload
    const blob = new Blob([jsonlData], { type: 'application/jsonl' });
    const file = new File([blob], 'training_data.jsonl', { type: 'application/jsonl' });

    // Upload the file to OpenAI
    const uploadResponse = await openai.files.create({
      file: file,
      purpose: 'fine-tune',
    });

    return NextResponse.json({
      message: 'Training data uploaded successfully',
      fileId: uploadResponse.id,
      filename: uploadResponse.filename,
      bytes: uploadResponse.bytes,
      status: uploadResponse.status,
      purpose: uploadResponse.purpose
    });
  } catch (error) {
    console.error('Error uploading training data:', error);
    return NextResponse.json({ 
      error: 'Failed to upload training data' 
    }, { status: 500 });
  }
}

async function handleCreateFineTuningJob(fileId: string, model: string = 'gpt-3.5-turbo') {
  if (!fileId) {
    return NextResponse.json({ 
      error: 'File ID is required' 
    }, { status: 400 });
  }

  try {
    const fineTuningJob = await openai.fineTuning.jobs.create({
      training_file: fileId,
      model: model,
      hyperparameters: {
        n_epochs: 3, // You can customize this
      },
    });

    return NextResponse.json({
      message: 'Fine-tuning job created successfully',
      jobId: fineTuningJob.id,
      model: fineTuningJob.model,
      status: fineTuningJob.status,
      createdAt: fineTuningJob.created_at,
      trainingFile: fineTuningJob.training_file,
      hyperparameters: fineTuningJob.hyperparameters
    });
  } catch (error) {
    console.error('Error creating fine-tuning job:', error);
    return NextResponse.json({ 
      error: 'Failed to create fine-tuning job' 
    }, { status: 500 });
  }
}

async function handleListFineTuningJobs() {
  try {
    const jobs = await openai.fineTuning.jobs.list();
    
    const jobList = jobs.data.map(job => ({
      id: job.id,
      model: job.model,
      status: job.status,
      createdAt: job.created_at,
      finishedAt: job.finished_at,
      fineTunedModel: job.fine_tuned_model,
      trainingFile: job.training_file,
      validationFile: job.validation_file,
      hyperparameters: job.hyperparameters
    }));

    return NextResponse.json({
      jobs: jobList,
      total: jobs.data.length
    });
  } catch (error) {
    console.error('Error listing fine-tuning jobs:', error);
    return NextResponse.json({ 
      error: 'Failed to list fine-tuning jobs' 
    }, { status: 500 });
  }
}

async function handleGetFineTuningJob(jobId: string) {
  if (!jobId) {
    return NextResponse.json({ 
      error: 'Job ID is required' 
    }, { status: 400 });
  }

  try {
    const job = await openai.fineTuning.jobs.retrieve(jobId);
    
    return NextResponse.json({
      id: job.id,
      model: job.model,
      status: job.status,
      createdAt: job.created_at,
      finishedAt: job.finished_at,
      fineTunedModel: job.fine_tuned_model,
      trainingFile: job.training_file,
      validationFile: job.validation_file,
      hyperparameters: job.hyperparameters,
      resultFiles: job.result_files,
      trainedTokens: job.trained_tokens
    });
  } catch (error) {
    console.error('Error getting fine-tuning job:', error);
    return NextResponse.json({ 
      error: 'Failed to get fine-tuning job' 
    }, { status: 500 });
  }
}

async function handleCancelFineTuningJob(jobId: string) {
  if (!jobId) {
    return NextResponse.json({ 
      error: 'Job ID is required' 
    }, { status: 400 });
  }

  try {
    const job = await openai.fineTuning.jobs.cancel(jobId);
    
    return NextResponse.json({
      message: 'Fine-tuning job cancelled successfully',
      id: job.id,
      status: job.status
    });
  } catch (error) {
    console.error('Error cancelling fine-tuning job:', error);
    return NextResponse.json({ 
      error: 'Failed to cancel fine-tuning job' 
    }, { status: 500 });
  }
}

// GET endpoint to list files and jobs
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    
    if (type === 'files') {
      // List uploaded files
      const files = await openai.files.list();
      const fineTuneFiles = files.data.filter(file => file.purpose === 'fine-tune');
      
      return NextResponse.json({
        files: fineTuneFiles.map(file => ({
          id: file.id,
          filename: file.filename,
          bytes: file.bytes,
          createdAt: file.created_at,
          status: file.status,
          purpose: file.purpose
        }))
      });
    } else {
      // List fine-tuning jobs by default
      return await handleListFineTuningJobs();
    }
  } catch (error) {
    console.error('Error fetching fine-tuning data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch fine-tuning data' 
    }, { status: 500 });
  }
}

// DELETE endpoint to delete files
export async function DELETE(request: NextRequest) {
  try {
    const { fileId } = await request.json();
    
    if (!fileId) {
      return NextResponse.json({ 
        error: 'File ID is required' 
      }, { status: 400 });
    }

    await openai.files.del(fileId);
    
    return NextResponse.json({ 
      message: 'File deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ 
      error: 'Failed to delete file' 
    }, { status: 500 });
  }
}