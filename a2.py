# websocket_audio_client.py
import asyncio
import websockets
import numpy as np
import sounddevice as sd
import threading
import time
import os
import queue
import json
from urllib.parse import urlencode

# ========================
#  CẤU HÌNH AUDIO (LOW LATENCY)
# ========================
SAMPLE_RATE = 48000
CHANNELS = 1
BUFFER_SIZE = int(os.getenv('MIC_BRIDGE_BUFFER', '256'))

audio_queue = queue.Queue(maxsize=10)

# ========================
#  KHUẾCH ĐẠI / CHUẨN HÓA ÂM THANH
# ========================
def optimize_audio_quality(audio_data):
    audio_data = audio_data.astype(np.float32)
    max_val = np.max(np.abs(audio_data))

    if 0.01 < max_val < 0.9999:
        audio_data = np.clip(audio_data * (0.9999 / max_val), -1.0, 1.0)

    return audio_data

# ========================
#  LUỒNG PHÁT ÂM THANH (VB-CABLE)
# ========================
def audio_playback_loop(device_id):
    try:
        with sd.OutputStream(
            samplerate=SAMPLE_RATE,
            channels=CHANNELS,
            dtype=np.float32,
            device=device_id,
            blocksize=BUFFER_SIZE,
            latency="low"
        ) as stream:
            print(f"✅ Playback sẵn sàng: {sd.query_devices(device_id)['name']}")

            while True:
                try:
                    audio_data = audio_queue.get(timeout=0.1)

                    if audio_data is not None and len(audio_data) > 0:
                        audio_data = optimize_audio_quality(audio_data)

                        for i in range(0, len(audio_data), BUFFER_SIZE):
                            chunk = audio_data[i:i+BUFFER_SIZE]
                            stream.write(chunk.reshape(-1, 1))
                    else:
                        stream.write(np.zeros((BUFFER_SIZE, 1), dtype=np.float32))

                except queue.Empty:
                    stream.write(np.zeros((BUFFER_SIZE, 1), dtype=np.float32))
                except Exception as e:
                    print(f"❌ Lỗi playback: {e}")
                    time.sleep(0.01)

    except Exception as e:
        print(f"❌ Không mở được audio device: {e}")

# ========================
#  TÌM VB-CABLE
# ========================
def find_vb_cable():
    devices = sd.query_devices()
    for i, d in enumerate(devices):
        if "cable input" in d["name"].lower() and d["max_output_channels"] > 0:
            return i
    return None

# ========================
#  WEBSOCKET CLIENT
# ========================
BASE_URL = "ws://rosaai_server1.rosachatbot.com/api/ws/connect"
MACHINE_ID = "KIOSK_001"
USER_NAME = "hcc"
ROLE = "python"
SECRET_KEY = "SJFO-0fpogdllkdf12WEQ!@#sd%##12312253FSERT"

async def connect_websocket():
    params = {
        "machine_id": MACHINE_ID,
        "user_name": USER_NAME,
        "role": ROLE,
        "secret_key": SECRET_KEY
    }

    ws_url = f"{BASE_URL}?{urlencode(params)}"
    print(f"📡 Kết nối WebSocket: {ws_url}")

    try:
        async with websockets.connect(ws_url, ping_interval=None) as ws:
            print("✅ WebSocket đã kết nối")

            async for msg in ws:
                # ===== JSON CONTROL =====
                if isinstance(msg, str):
                    try:
                        data = json.loads(msg)
                        print(f"📩 JSON: {data}")

                        if data.get("event") == "stop":
                            print("⛔ STOP → clear audio queue")
                            while not audio_queue.empty():
                                audio_queue.get_nowait()

                    except json.JSONDecodeError:
                        pass

                # ===== AUDIO BINARY =====
                elif isinstance(msg, bytes):
                    # PCM 16-bit → float32
                    audio = np.frombuffer(msg, dtype=np.int16).astype(np.float32)
                    audio /= 32768.0

                    try:
                        audio_queue.put_nowait(audio)
                    except queue.Full:
                        pass

    except Exception as e:
        print(f"❌ WebSocket lỗi: {e}")

# ========================
#  MAIN
# ========================
async def main():
    device_id = find_vb_cable()
    if device_id is None:
        print("❌ Không tìm thấy VB-CABLE (Cable Input)")
        return

    threading.Thread(
        target=audio_playback_loop,
        args=(device_id,),
        daemon=True
    ).start()

    await connect_websocket()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Đã dừng client")
