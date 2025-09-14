import { NextRequest, NextResponse } from "next/server";

interface AppVersion {
  version: string;
  url: string;
}

export async function GET(request: NextRequest) {
  try {
    const versionUrl = process.env.NEXT_PUBLIC_CLEANER_APP_URL || 
      'https://pocpmli.s3.ap-south-1.amazonaws.com/mycleanone/version.json';
    
    console.log('Fetching app version from:', versionUrl);
    
    const response = await fetch(versionUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MyCleanOne-WebApp/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const versionData: AppVersion = await response.json();
    
    // Validate the response structure
    if (!versionData.version || !versionData.url) {
      throw new Error('Invalid version data structure');
    }
    
    console.log('Successfully fetched version:', versionData.version);
    
    return NextResponse.json({
      success: true,
      data: versionData,
    });
    
  } catch (error) {
    console.error('Failed to fetch app version:', error);
    
    // Return fallback version
    const fallbackVersion: AppVersion = {
      version: "1.1.0",
      url: 'https://pocpmli.s3.ap-south-1.amazonaws.com/mycleanone/MyCleanOnSetup.msi'
    };
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: fallbackVersion, // Still return usable data
    });
  }
}
