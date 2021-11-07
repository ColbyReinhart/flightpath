from flask import Flask, render_template, request
import json

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/navigation")
def navigation():
    return render_template("navigation.html")

@app.route("/perspective")
def perspective():
    return render_template("perspective.html")

@app.route("/compass")
def compass():
    return render_template("compasstest.html")

@app.route("/success")
def success():
    return render_template("success.html")

@app.route("/api/locations")
def api_locations():
    with open("locations.json") as json_file:
        locations = json.load(json_file)
    return locations
        

@app.route("/addnode", methods=["GET", "POST"])
def addnode():
    if request.method == "GET":
        return render_template("addnode.html")
    
    if request.method == "POST":
        with open("locations.json", "r") as json_file:
            locations = json.load(json_file)
        locations["Uncategorized"].append(request.json)
        with open("locations.json", "w") as json_file:
            json.dump(locations, json_file, indent=4, sort_keys=True)
        return "200"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)