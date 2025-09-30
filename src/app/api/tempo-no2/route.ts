import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { longitude, latitude, date } = await request.json();

    // Validate coordinates
    if (
      longitude < -155 || longitude > -24.5 ||
      latitude < 17.2 || latitude > 63.55
    ) {
      return NextResponse.json(
        { error: 'Coordinates outside TEMPO coverage area' },
        { status: 400 }
      );
    }

    // Call Python script
    const pythonScript = path.join(process.cwd(), 'api', 'tempo_fetcher.py');
    
    const result = await callPythonScript(pythonScript, latitude, longitude, date);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching TEMPO data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TEMPO data' },
      { status: 500 }
    );
  }
}

function callPythonScript(scriptPath: string, lat: number, lon: number, date?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const python = spawn('python3', [
      scriptPath,
      String(lat),
      String(lon),
      date || ''
    ]);

    let dataString = '';
    let errorString = '';

    python.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorString += data.toString();
      console.error(`Python Error: ${data}`);
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}: ${errorString}`));
        return;
      }
      
      try {
        const result = JSON.parse(dataString);
        resolve(result);
      } catch (e) {
        reject(new Error('Failed to parse Python output'));
      }
    });
  });
}