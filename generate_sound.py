import wave
import random
import struct
import math

def generate_explosion_sound(filename="explosion.wav", duration=0.5, volume=0.5):
    sample_rate = 44100
    n_samples = int(sample_rate * duration)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes per sample (16-bit)
        wav_file.setframerate(sample_rate)
        
        for i in range(n_samples):
            # Decay envelope
            decay = 1.0 - (i / n_samples)
            decay = decay ** 2  # Exponential decay
            
            # White noise
            noise = random.uniform(-1, 1)
            
            # Apply envelope and volume
            sample = noise * decay * volume
            
            # Scale to 16-bit integer
            sample_int = int(sample * 32767)
            
            wav_file.writeframes(struct.pack('h', sample_int))

if __name__ == "__main__":
    generate_explosion_sound()
    print("Generated explosion.wav")
