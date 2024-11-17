import firebase_admin
from firebase_admin import credentials, firestore
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image
import io
import requests
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

with open('../db_json_file_name.json', 'r') as db_file_name:
    dbFName = json.load(db_file_name)

auth_file_name = dbFName["File_Name"]

cred = credentials.Certificate(f"../{auth_file_name}")
firebase_admin.initialize_app(cred)
db = firestore.client()

def access_nutritional_information(foodCounts: dict):

    result = []

    for food, quantity in foodCounts.items():
        # Query Firestore for the food item
        query = db.collection("food").where("Food", "==", food).limit(1)
        docs = query.stream()

        doc_found = False
        for doc in docs:
            doc_found = True
            nutrition_data = doc.to_dict()
            nutrition_data["Quantity"] = quantity
            nutrition_data["Calories"] *= quantity
            nutrition_data["Carbohydrate"] *= quantity
            nutrition_data["Fat"] *= quantity
            nutrition_data["Fiber"] *= quantity
            nutrition_data["Protein"] *= quantity
            result.append(nutrition_data)

        if not doc_found:
            print(f"No nutritional information found for {food}")

    return result

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    try:

        response = None

        contents = await file.read()
        
        with open("temp.jpg", "wb") as f:
            f.write(contents)

        # TODO: CHANGE URL TO REFLECT FLASK APP RUNNING ON GOOGLE COLAB
        url = "https://ed84-34-139-212-69.ngrok-free.app/detect"

        with open("temp.jpg", "rb") as img:
            files = {"image": img}
            response = requests.post(url, files=files)

        food_count = response.json()["output"]

        nutrition_info = access_nutritional_information(food_count)

        return JSONResponse(nutrition_info)

    except Exception as e:

        return JSONResponse({"error": str(e)}, status_code=500)