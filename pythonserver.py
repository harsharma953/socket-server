import asyncio
import websockets
import json
import base64
import cv2
import numpy as np

async def handle_connection(websocket, path):
    print("Client connected")
    try:
        async for message in websocket:
            data = json.loads(message)
            if 'frame' in data:
                frame_data = base64.b64decode(data['frame'])
                nparr = np.frombuffer(frame_data, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if frame is not None:
                    cv2.imshow('Received Frame', frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed: {e}")
    finally:
        print("Client disconnected")
        cv2.destroyAllWindows()

async def main():
    server = await websockets.serve(handle_connection, "172.20.10.12", 8080)
    print("Server started at ws://0.0.0.0:8080")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
