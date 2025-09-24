from PIL import Image
import os
import cv2

def process_image(filename, operation):
    print(f"Processing {filename} with operation {operation}")
    img = Image.open(f"uploads/{filename}")
    match(operation):
        case "cpng":
            new_filename = f"{os.path.splitext(filename)[0]}.png"
            img.save(f"static/{new_filename}", "PNG")
            return new_filename
        case "cgray":
            gray_img = cv2.cvtColor(cv2.imread(f"uploads/{filename}"), cv2.COLOR_BGR2GRAY)
            new_filename = f"{os.path.splitext(filename)[0]}_gray.png"
            cv2.imwrite(f"static/{new_filename}", gray_img)
            return new_filename
        case "cwebp":
            new_filename = f"{os.path.splitext(filename)[0]}.webp"
            img.save(f"static/{new_filename}", "WEBP")
            return new_filename
        case "cjpg":
            new_filename = f"{os.path.splitext(filename)[0]}.jpg"
            img.save(f"static/{new_filename}", "JPEG")
            return new_filename        
        case _:
            return filename
        