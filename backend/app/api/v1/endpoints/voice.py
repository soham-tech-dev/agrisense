import io
import logging
from typing import Optional
import numpy as np
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import speech_recognition as sr

logger = logging.getLogger("app.api.voice")
router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: Optional[str] = Form("en"),
):
    """
    Transcribe audio recorded from any browser (Chrome, Firefox, Edge, Brave, Safari).
    Accepts standard PCM WAV audio files and performs accurate speech-to-text.
    """
    try:
        content = await file.read()
        if not content or len(content) < 100:
            return {"success": False, "transcript": "", "error": "Empty audio"}

        audio_bytes = io.BytesIO(content)
        recognizer = sr.Recognizer()

        with sr.AudioFile(audio_bytes) as source:
            audio_data = recognizer.record(source)
            sample_rate = source.SAMPLE_RATE
            sample_width = source.SAMPLE_WIDTH

        raw_bytes = audio_data.get_raw_data()
        duration_s = len(raw_bytes) / (sample_rate * sample_width)
        
        # Parse samples to analyze volume & apply dynamic gain
        samples = np.frombuffer(raw_bytes, dtype=np.int16)
        max_amplitude = int(np.max(np.abs(samples))) if len(samples) > 0 else 0
        logger.info(f"Audio received: {duration_s:.2f}s, rate={sample_rate}Hz, peak_amp={max_amplitude}")

        if max_amplitude > 100 and max_amplitude < 14000:
            # Boost quiet microphone input for high-confidence speech recognition
            gain = min(8.0, 22000.0 / max(1, max_amplitude))
            amplified_samples = np.clip(samples.astype(np.float32) * gain, -32768, 32767).astype(np.int16)
            audio_data = sr.AudioData(amplified_samples.tobytes(), sample_rate, sample_width)

        target_lang = "mr-IN" if language == "mr" else "en-IN"
        transcript = ""

        try:
            transcript = recognizer.recognize_google(audio_data, language=target_lang)
        except sr.UnknownValueError:
            # Fallback to en-US if en-IN did not match accent
            if language != "mr":
                try:
                    transcript = recognizer.recognize_google(audio_data, language="en-US")
                except Exception:
                    transcript = ""
            else:
                # Try Hindi as phonetically close fallback for regional Marathi dialect terms
                try:
                    transcript = recognizer.recognize_google(audio_data, language="hi-IN")
                except Exception:
                    transcript = ""
        except sr.RequestError as e:
            logger.warning(f"Google speech API request notice: {e}")
            transcript = ""

        clean = transcript.strip()
        logger.info(f"Transcribed audio ({language}): '{clean}' (success={bool(clean)})")
        return {
            "success": bool(clean),
            "transcript": clean,
            "language": language,
            "duration": duration_s
        }
    except Exception as exc:
        logger.error(f"Voice transcription exception: {exc}", exc_info=True)
        return {
            "success": False,
            "transcript": "",
            "error": str(exc)
        }
