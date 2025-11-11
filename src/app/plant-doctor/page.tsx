'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Upload, Mic, Bot, AlertTriangle, ArrowLeft, Lightbulb, ShieldCheck, TestTube2, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useWeather } from '@/hooks/use-weather';
import { plantDoctor, type PlantDoctorOutput, type PlantDoctorInput } from '@/ai/flows/plant-doctor-flow';
import Image from 'next/image';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type Status = 'idle' | 'recording' | 'processing' | 'success' | 'error';
type View = 'capture' | 'result';

export default function PlantDoctorPage() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { weather } = useWeather();
  
  const [view, setView] = useState<View>('capture');
  const [status, setStatus] = useState<Status>('idle');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [result, setResult] = useState<PlantDoctorOutput | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  useEffect(() => {
    async function getCameraPermission() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions to use this feature.',
        });
      }
    }
    getCameraPermission();

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [toast]);
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageSrc(dataUrl);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };
  
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: 'Browser Not Supported', description: 'Your browser does not support voice recognition.', variant: 'destructive' });
      return;
    }
    
    setStatus('recording');
    setTranscript('');
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = language;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onresult = (event: any) => {
      const currentTranscript = Array.from(event.results).map((result: any) => result[0].transcript).join('');
      setTranscript(currentTranscript);
    };
    
    recognitionRef.current.onend = () => {
      setStatus('idle');
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setStatus('idle');
    }
  };

  const handleDiagnose = async () => {
    if (!imageSrc) {
      toast({ title: 'No Image', description: 'Please capture or upload an image first.', variant: 'destructive' });
      return;
    }
    
    setStatus('processing');
    
    const input: PlantDoctorInput = {
      photoDataUri: imageSrc,
      voice_text: transcript,
      crop_name_or_unknown: "unknown",
      growth_stage_or_unknown: "unknown",
      location_or_unknown: weather?.location || "unknown",
      weather_summary_or_unknown: weather ? `${weather.temperature}°C, ${weather.condition}` : 'unknown',
      user_notes_or_empty: '',
      language_pref: language,
    };
    
    try {
      const response = await plantDoctor(input);
      setResult(response);
      setStatus('success');
      setView('result');
    } catch (err) {
      console.error(err);
      setStatus('error');
      toast({ title: 'Diagnosis Failed', description: 'An error occurred while analyzing the plant. Please try again.', variant: 'destructive'});
    }
  };

  const reset = () => {
    setView('capture');
    setStatus('idle');
    setImageSrc(null);
    setTranscript('');
    setResult(null);
  }

  if (view === 'result' && result) {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <Button variant="ghost" onClick={reset} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Start New Diagnosis</Button>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-2"><Bot className="text-primary"/> Plant Diagnosis Report</CardTitle>
                    <CardDescription>Confidence: {Math.round(result.confidence * 100)}% - {result.disclaimer}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {result.speakableSummary && (
                        <Alert className="bg-primary/10 border-primary/20">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            <AlertTitle className="font-bold text-primary">Quick Summary</AlertTitle>
                            <AlertDescription>{result.speakableSummary}</AlertDescription>
                        </Alert>
                    )}

                    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="font-bold text-lg">Identification</AccordionTrigger>
                            <AccordionContent>
                                {result.plantIdentification?.primarySpecies?.name ? (
                                    <p><strong>Primary Species:</strong> {result.plantIdentification.primarySpecies.name} (Confidence: {Math.round(result.plantIdentification.primarySpecies.confidence * 100)}%)</p>
                                ) : <p>Could not identify plant species.</p>}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="font-bold text-lg">Diagnosis</AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                {result.diagnosis.length > 0 ? result.diagnosis.map((d, i) => (
                                    <Card key={i} className="bg-muted/50">
                                        <CardHeader className="p-4">
                                            <CardTitle className="text-md capitalize">{d.issueType}: {d.name}</CardTitle>
                                            <CardDescription>Severity: <span className="font-bold">{d.severity}</span>, Likelihood: {Math.round(d.likelihood * 100)}%</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <strong>Evidence:</strong>
                                            <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                                {d.evidence.map((e, idx) => <li key={idx}>{e}</li>)}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )) : <p>No specific issues diagnosed.</p>}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger className="font-bold text-lg">Recommendations</AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                <Card>
                                  <CardHeader className="p-4"><CardTitle className="text-md flex items-center gap-2"><ShieldCheck/> Cultural & IPM</CardTitle></CardHeader>
                                  <CardContent className="p-4 pt-0 text-sm"><ul className="list-disc pl-5">{result.recommendations.culturalIPM.map((r,i) => <li key={i}>{r}</li>)}</ul></CardContent>
                                </Card>
                                <Card>
                                  <CardHeader className="p-4"><CardTitle className="text-md flex items-center gap-2"><TestTube2/> Organic/Biological</CardTitle></CardHeader>
                                  <CardContent className="p-4 pt-0 text-sm"><ul className="list-disc pl-5">{result.recommendations.organicBiological.map((r,i) => <li key={i}>{r.active}: {r.notes}</li>)}</ul></CardContent>
                                </Card>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-4">
                            <AccordionTrigger className="font-bold text-lg flex items-center gap-2"><ImageIcon/> Image Quality</AccordionTrigger>
                            <AccordionContent>
                                <p><strong>Quality:</strong> <span className="capitalize">{result.dataQuality.imageQuality}</span></p>
                                <p><strong>Suggestions:</strong></p>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                    {result.dataQuality.nextPhotoRequests.map((r,i) => <li key={i}>{r}</li>)}
                                </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Plant Doctor</CardTitle>
          <CardDescription>Capture or upload a photo of your plant and add a voice note for an AI diagnosis.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">1. Provide an Image</h3>
            <div className="relative aspect-video w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
              {imageSrc ? (
                <Image src={imageSrc} alt="Captured plant" fill className="object-contain" />
              ) : (
                <div className="w-full h-full">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                  {!hasCameraPermission && (
                     <Alert variant="destructive" className="absolute bottom-4 left-4 right-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access to use this feature.
                        </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
               <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            <div className="flex gap-2 justify-center">
                <Button onClick={handleCapture} disabled={!hasCameraPermission || status === 'processing'}>
                    <Camera className="mr-2" /> Capture
                </Button>
                <Button asChild variant="outline" disabled={status === 'processing'}>
                    <label htmlFor="upload-button">
                        <Upload className="mr-2" /> Upload
                        <input id="upload-button" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">2. Add a Voice Note (Optional)</h3>
            <div className="flex items-center gap-2">
                <Button 
                    size="icon" 
                    onClick={status === 'recording' ? stopRecording : startRecording}
                    variant={status === 'recording' ? 'destructive' : 'default'}
                    disabled={status === 'processing'}
                    className="rounded-full w-12 h-12"
                >
                    <Mic />
                </Button>
                <div className="w-full p-2 h-12 border rounded-md bg-muted/50 text-sm text-muted-foreground">
                    {status === 'recording' && <span className="text-primary animate-pulse">Listening...</span>}
                    {transcript}
                </div>
            </div>
          </div>

          <Button size="lg" className="w-full font-bold text-lg" onClick={handleDiagnose} disabled={!imageSrc || status === 'processing' || status === 'recording'}>
            {status === 'processing' ? <><Loader2 className="mr-2 animate-spin" /> Diagnosing...</> : 'Get Diagnosis'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
