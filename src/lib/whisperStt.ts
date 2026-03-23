/**
 * Shared Whisper STT (Speech-to-Text) module.
 * Uses onnx-community/whisper-tiny.en via @huggingface/transformers.
 * Works offline in the browser (WASM) — no server or API key needed.
 */

interface TranscriberPipeline {
  (audio: Float32Array): Promise<{ text: string }>;
}

let transcriberPromise: Promise<TranscriberPipeline> | null = null;

export async function getTranscriber(
  onProgress?: (progress: number) => void,
): Promise<TranscriberPipeline> {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const { pipeline } = await import('@huggingface/transformers');
      const transcriber = await pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-tiny.en',
        {
          dtype: 'q8',
          device: 'wasm',
          progress_callback: (p) => {
            if ('progress' in p && typeof p.progress === 'number' && onProgress) {
              onProgress(p.progress);
            }
          },
        },
      );
      return (audio: Float32Array) =>
        transcriber(audio) as Promise<{ text: string }>;
    })();
  }
  return transcriberPromise;
}

export async function decodeAudioBlob(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  const float32 = decoded.getChannelData(0);
  await audioCtx.close();
  return float32;
}

export async function transcribeBlob(
  blob: Blob,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const transcriber = await getTranscriber(onProgress);
  const audio = await decodeAudioBlob(blob);
  const result = await transcriber(audio);
  return result.text.trim();
}
