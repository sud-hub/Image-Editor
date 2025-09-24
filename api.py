from flask import Flask, request, jsonify, send_file
from google import genai
from google.genai import types
from PIL import Image
import io
import base64
import pathlib
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

@app.route("/edit_image", methods=["POST"])
def edit_image():
    try:
        prompt = request.form.get("prompt")
        image_file = request.files.get("image")

        if not image_file:
            return jsonify({"error": "No image uploaded"}), 400
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400

        image = Image.open(io.BytesIO(image_file.read()))

        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=[prompt, image],
            config=types.GenerateContentConfig(
                response_modalities=['Text', 'Image']
            )
        )

        image_path = None
        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                print("Part MIME type:", part.inline_data.mime_type)
                print("Part data length:", len(part.inline_data.data))

                image_path = "edited_image.png"
                pathlib.Path(image_path).write_bytes(part.inline_data.data)

                print("Saved image:", image_path)

        try:
            img = Image.open(image_path)
            img.verify()
            print("Image verified successfully!")

        except Exception as e:
            print("Corrupted image:", e)

        if image_path:
            return send_file(image_path, mimetype='image/png')
        else:
            return jsonify({"error": "No image generated"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)