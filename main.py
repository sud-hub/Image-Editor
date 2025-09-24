from flask import Flask, render_template, request, flash, url_for, redirect
from werkzeug.utils import secure_filename
import os
from image_processing import process_image
from dotenv import load_dotenv

load_dotenv()

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# def process_image(filename, operation):
#     # Dummy implementation: just return the original filename
#     # Replace this with actual image processing logic as needed
#     print(f"filename: {filename}, operation: {operation}")
#     return filename

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/edit", methods=["GET", "POST"])
def edit():
    if request.method == "POST":
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            print("Executing function")
            new_filename = process_image(filename, operation=request.form.get("operation"))
            # return redirect(url_for('download_file', name=filename))
            flash('Processed image saved <a href="/static/' + new_filename + '" target="_blank">here</a>.')  
            # print(f"new_filename: {new_filename}") 
            return render_template("index.html") 
            # return render_template("output.html", filename=new_filename)
    return render_template("index.html")

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/how")
def how():
    return render_template("how.html")

@app.route("/docs")
def docs():
    return render_template("documentation.html")

app.run(debug=True)